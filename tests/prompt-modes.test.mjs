import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { apply, CODEX_PROMPT, MODE_KEY, MODE_EVENT } from '../src/prompt-modes.js';

// Exercise the installed DSH implementation, not a copy of prompt assembly.
const packages = process.env.DSH_RUNTIME_PACKAGES || join(homedir(), '.dsh-win/versions/0.2.0-rc.2/node_modules/.pnpm');
function runtimeEntry(name, prefix) {
  const folder = readdirSync(packages).find(entry => entry.startsWith(prefix));
  assert.ok(folder, `Missing DSH runtime dependency: ${name}`);
  return join(packages, folder, 'node_modules/@deepseek-ai', name, 'lib/index.js');
}
const systemEntry = runtimeEntry('dsh-system-prompt', '@deepseek-ai+dsh-system-pro_');
const { Context } = await import(pathToFileURL(createRequire(systemEntry).resolve('@deepseek-ai/cordis')));
const { default: SystemPrompt, renderPrompt } = await import(pathToFileURL(systemEntry));
const { Session, default: SessionStore } = await import(pathToFileURL(runtimeEntry('dsh-session', '@deepseek-ai+dsh-session@')));
const { default: Projections } = await import(pathToFileURL(runtimeEntry('dsh-session-projection', '@deepseek-ai+dsh-session-pr_')));

test('native prompt survives mode changes, session isolation, replay and invalid requests', async () => {
  const ctx = new Context();
  const sessions = new SessionStore(ctx);
  const projections = new Projections(ctx);
  const prompt = new SystemPrompt(ctx, {});
  prompt.section({ name: 'test:tools', order: 1000, text: 'Keep native tool guidance.' });
  const baseline = renderPrompt(await prompt.assemble());
  const agents = new Map();
  let rpc;
  let flushCount = 0;
  let rejectFlush = false;
  const storedModes = {};
  await apply({
    effect: () => {}, on: () => {},
    storage: { backend: { get: () => ({ kv: { open: async () => ({
      loadAll: async () => ({ tables: { sessions: { ...storedModes } } }),
      putRecord: async (_table, id, mode) => { flushCount++; if (rejectFlush) throw new Error('disk write failed'); storedModes[id] = mode; },
      close: async () => {},
    }) } }) } },
    systemPrompt: prompt,
    sessionProjections: projections,
    sessionController: { resolveAgent: async id => agents.has(id) ? { agent: agents.get(id) } : { error: { code: 'session/not-found', message: 'missing', details: {} } } },
    sessions: { get: id => agents.get(id)?.session },
    connection: { fetch: { register: route => {
      assert.equal(route.path, '/api/chatgpt-ui/prompt-mode'); rpc = route.fetch;
    } } },
  });
  const makeAgent = (id, seed) => {
    const agent = { session: Session.create(id, seed), status: 'idle', runMaintenance: async fn => fn(new AbortController().signal) };
    agents.set(id, agent);
    return agent;
  };
  const a = makeAgent('mode-a'), b = makeAgent('mode-b');
  const render = async agent => renderPrompt(await prompt.assemble({ agent }));
  const choose = async (sessionId, mode) => (await (await rpc(new Request('http://localhost/api/chatgpt-ui/prompt-mode', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'client-request', rpcId: 'test-mode', method: MODE_EVENT, payload: { sessionId, mode } }),
  }))).json()).result;
  assert.equal(await render(a), baseline);
  assert.equal((await choose('mode-a', 'Codex')).ok, true);
  assert.equal(await render(a), baseline + '\n\n' + CODEX_PROMPT);
  assert.equal(await render(b), baseline, 'another session must remain native');
  assert.equal(storedModes['mode-a'], 'Codex');
  assert.equal(a.session.snapshotEvents().length, 0, 'new selections must never write unknown session events');
  const restored = makeAgent('mode-a', a.session.snapshotEvents());
  assert.equal(await render(restored), await render(a), 'reopening the same session retains the stored choice');
  agents.set('mode-a', a);
  assert.equal((await choose('mode-a', 'DeepSeek')).ok, true);
  assert.equal(await render(a), baseline, 'switching back must restore byte-identical native text');
  const before = flushCount;
  assert.equal((await choose('mode-a', 'unknown')).ok, false);
  assert.equal((await choose('../missing', 'Codex')).ok, false);
  a.status = 'running';
  assert.equal((await choose('mode-a', 'Codex')).error.code, 'prompt-mode/busy');
  assert.equal(flushCount, before, 'invalid or busy requests cannot write');
  a.status = 'idle';
  rejectFlush = true;
  assert.equal((await choose('mode-a', 'Codex')).ok, false, 'durability failure must not report success');
  rejectFlush = false;
  assert.equal((await choose('mode-a', 'Codex')).ok, true, 'retry must flush even if the event already committed');
});
