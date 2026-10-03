import { readFileSync } from 'node:fs';
import { z } from 'zod';

export const MODE_KEY = 'cgPromptMode';
export const MODE_EVENT = 'chatgpt-ui/prompt-mode';
export const CODEX_PROMPT = readFileSync(new URL('../prompts/codex.txt', import.meta.url), 'utf8').trim();
const modeSchema = z.enum(['DeepSeek', 'Codex']);
const selectionSchema = z.object({ sessionId: z.string().min(1).max(256), mode: modeSchema.optional(), action: z.enum(['read', 'select']).default('select') }).strict();
const requestSchema = z.object({ type: z.literal('client-request'), rpcId: z.string().min(1).max(256), method: z.literal(MODE_EVENT), payload: z.unknown() }).strict();

// Read legacy mode events; all new choices use a dedicated durable KV unit.
export const modeProjection = {
  key: MODE_KEY,
  stateSchema: modeSchema,
  stateVersion: 1,
  init: () => 'DeepSeek',
  apply: (state, event) => event.type === MODE_EVENT ? modeSchema.parse(event.data.mode) : state,
  wire: { viewSchema: modeSchema, view: state => state },
};

export const inject = ['systemPrompt', 'sessionProjections', 'sessionController', 'sessions', 'connection', 'storage', 'storage.backend.json'];

export async function apply(ctx) {
  const unit = await ctx.storage.backend.get('json').kv.open({ name: 'chatgpt_ui_modes', version: 1, tables: ['sessions'], hasGlobal: false });
  const saved = (await unit.loadAll()).tables.sessions;
  const modes = new Map(Object.entries(saved).map(([id, mode]) => [id, modeSchema.parse(mode)]));
  let writes = Promise.resolve();
  ctx.effect(() => async () => { await writes.catch(() => {}); await unit.close(); });
  const modeFor = session => modes.get(session.id) ?? ctx.sessionProjections.stateOf(session, MODE_KEY) ?? 'DeepSeek';
  ctx.sessionProjections.register(modeProjection);
  ctx.on('session/created', session => {
    const parent = session.header.isSeeded && session.header.parentSession;
    if (!parent || modes.has(session.id) || !modes.has(parent)) return;
    const mode = modes.get(parent);
    modes.set(session.id, mode);
    writes = writes.catch(() => {}).then(() => unit.putRecord('sessions', session.id, mode));
    writes.catch(error => ctx.logger.warn(`prompt mode fork save failed: ${error.message}`));
  });
  ctx.systemPrompt.section({
    name: 'chatgpt-ui:codex-style',
    order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_SUFFIX') + 1,
    interpolate: false,
    // An empty section renders no bytes: DeepSeek always uses the native prompt.
    text: ({ agent }) => agent && modeFor(agent.session) === 'Codex' ? CODEX_PROMPT : '',
  });

  // Use DSH's authenticated Connection carrier; no extra HTTP server or token.
  async function selectMode(payload, signal) {
    const parsed = selectionSchema.safeParse(payload);
    const fail = (code, message, details = {}) => ({ ok: false, error: { code, message, details } });
    if (!parsed.success) return fail('prompt-mode/invalid', '模式参数无效。');
    const { sessionId, mode, action } = parsed.data;
    try {
      signal.throwIfAborted();
      if (action === 'read') {
        const session = ctx.sessions.get(sessionId);
        if (session) return { ok: true, value: { sessionId, mode: modeFor(session) } };
        const inspection = await ctx.sessionController.inspect(sessionId, signal);
        const legacy = inspection.events.findLast(event => event.type === MODE_EVENT)?.data.mode;
        return { ok: true, value: { sessionId, mode: modes.get(sessionId) ?? modeSchema.parse(legacy ?? 'DeepSeek') } };
      }
      if (mode === undefined) return fail('prompt-mode/invalid', '缺少模式参数。');
      const resolved = await ctx.sessionController.resolveAgent(sessionId);
      if (resolved.error) return fail(resolved.error.code, resolved.error.message, resolved.error.details);
      const { agent } = resolved;
      if (agent.status !== 'idle') return fail('prompt-mode/busy', '请等待当前回复完成后再切换模式。');
      // Hold the idle phase through durability: a new turn cannot race this write.
      return await agent.runMaintenance(async maintenanceSignal => {
        signal.throwIfAborted();
        maintenanceSignal.throwIfAborted();
        const write = writes.catch(() => {}).then(async () => {
          await unit.putRecord('sessions', sessionId, mode);
          modes.set(sessionId, mode);
        });
        writes = write;
        await write;
        return { ok: true, value: { sessionId, mode } };
      });
    } catch (error) {
      return fail('prompt-mode/failed', error.message || String(error));
    }
  }
  ctx.connection.fetch.register({
    path: '/api/chatgpt-ui/prompt-mode', methods: ['POST'], requestBody: 'buffered',
    async fetch(request) {
      let envelope;
      try { envelope = requestSchema.parse(await request.json()); }
      catch { return Response.json({ error: 'Invalid mode request' }, { status: 400 }); }
      const result = await selectMode(envelope.payload, request.signal);
      return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result });
    },
  });
}
