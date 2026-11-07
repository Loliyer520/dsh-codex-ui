import { lstatSync, readdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { z } from 'zod';

// DSH has no built-in delete-session API. This host module removes archived
// session log directories under $DSH_HOME/sessions and prunes the workspace
// registry. Only archived sessions may be purged, mirroring the fork's rule.

const PURGE_EVENT = 'dsh-codex-ui/purge-session';
const FORGET_EVENT = 'dsh-codex-ui/forget-sessions';
const SESSION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const MAX_PURGED = 2000;

const requestSchema = z.object({
  type: z.literal('client-request'),
  rpcId: z.string().min(1).max(256),
  method: z.string(),
  payload: z.unknown(),
}).strict();

const purgeRequestSchema = z.object({
  sessionId: z.string().regex(SESSION_ID),
}).strict();

const forgetRequestSchema = z.object({
  sessionIds: z.array(z.string().regex(SESSION_ID)).min(1).max(100),
}).strict();

function fail(code, message, details = {}) {
  // details is required by the client envelope parser; keep it even on success-shaped errors.
  return { ok: false, error: { code, message, details } };
}

function readJsonSafe(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

function dshHome() {
  const home = process.env.DSH_HOME;
  if (!home) throw new Error('DSH_HOME 不可用：无法定位会话存储目录。');
  return home;
}

function workspaceRegistryPath(home) {
  return join(home, 'storages', 'workspace.json');
}

function purgedIdsPath(home) {
  return join(home, 'storages', 'codex-ui-purged.json');
}

function readArchivedIds(home) {
  const reg = readJsonSafe(workspaceRegistryPath(home), null);
  const ids = reg?.global?.archivedSessionIds;
  return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : null;
}

function readPurgedIds(home) {
  const data = readJsonSafe(purgedIdsPath(home), null);
  return Array.isArray(data?.ids) ? data.ids.filter(id => typeof id === 'string') : [];
}

function writePurgedIds(home, ids) {
  const path = purgedIdsPath(home);
  const tmp = path + '.tmp';
  writeFileSync(tmp, JSON.stringify({ ids }));
  renameSync(tmp, path);
}

function findSessionDir(home, sessionId) {
  const sessionsRoot = resolve(join(home, 'sessions'));
  const rootWithSep = sessionsRoot.endsWith(sep) ? sessionsRoot : sessionsRoot + sep;
  for (const project of readdirSync(sessionsRoot, { withFileTypes: true })) {
    if (!project.isDirectory() || project.isSymbolicLink?.()) continue;
    const projectDir = join(sessionsRoot, project.name);
    const candidate = join(projectDir, 'session-' + sessionId);
    let stat;
    try { stat = lstatSync(candidate); } catch { continue; }
    if (!stat.isDirectory() || stat.isSymbolicLink()) continue;
    const resolved = resolve(candidate);
    if (resolved !== candidate && !resolved.startsWith(rootWithSep)) continue;
    // A real session log dir contains a session log file; never delete an empty placeholder.
    let hasLog = false;
    try {
      for (const entry of readdirSync(candidate, { withFileTypes: true })) {
        if (entry.isFile() && /^session\.v\d+\.jsonl\.zstd$/.test(entry.name)) { hasLog = true; break; }
      }
    } catch { continue; }
    if (!hasLog) continue;
    return resolved;
  }
  return null;
}

function removeFromRegistry(home, sessionId) {
  const path = workspaceRegistryPath(home);
  const reg = readJsonSafe(path, null);
  if (!reg || !reg.global) return false;
  let changed = false;
  for (const key of ['archivedSessionIds', 'pinnedSessionIds']) {
    const list = reg.global[key];
    if (!Array.isArray(list)) continue;
    const next = list.filter(id => id !== sessionId);
    if (next.length !== list.length) { reg.global[key] = next; changed = true; }
  }
  if (!changed) return false;
  const tmp = path + '.tmp';
  writeFileSync(tmp, JSON.stringify(reg));
  renameSync(tmp, path);
  return true;
}

function removeProjectionCache(home, sessionId) {
  const path = join(home, 'storages', 'session_projcache', 'sessions', 'session-' + sessionId + '.json');
  try { unlinkSync(path); return true; } catch { return false; }
}

async function purgeArchivedSession({ home, sessionId, logger }) {
  const archived = readArchivedIds(home);
  if (archived === null) return fail('purge/registry', '无法读取会话注册表，请稍后重试。', { sessionId });
  if (!archived.includes(sessionId)) return fail('purge/not-archived', '只能删除已归档的会话。', { sessionId });

  const dir = findSessionDir(home, sessionId);
  let removed = null;
  if (dir) { try { rmSync(dir, { recursive: true, force: true }); removed = dir; } catch (error) { return fail('purge/remove', `删除会话日志失败：${error.message}`, { sessionId }); } }

  // Record the purge so a resurrected registry entry still hides the row after restart.
  try {
    const ids = readPurgedIds(home).filter(id => id !== sessionId);
    ids.push(sessionId);
    if (ids.length > MAX_PURGED) ids.splice(0, ids.length - MAX_PURGED);
    writePurgedIds(home, ids);
  } catch (error) {
    logger?.warn?.(`dsh-codex-ui: failed to persist purged id ${sessionId}: ${error.message}`);
  }

  const cleaned = [];
  try { if (removeFromRegistry(home, sessionId)) cleaned.push('registry'); } catch (error) { logger?.warn?.(`dsh-codex-ui: registry prune failed for ${sessionId}: ${error.message}`); }
  try { if (removeProjectionCache(home, sessionId)) cleaned.push('projection'); } catch (error) { logger?.warn?.(`dsh-codex-ui: projection prune failed for ${sessionId}: ${error.message}`); }

  return { ok: true, value: { sessionId, removed, cleaned } };
}

function registerSessionPurge(ctx) {
  // Soft-depend on connection: skip silently when the host has no connection capability.
  const connection = ctx.connection ?? ctx.get?.('connection');
  if (!connection?.fetch?.register) return;
  connection.fetch.register({
    path: '/api/dsh-codex-ui/purge-session', methods: ['POST'], requestBody: 'buffered',
    async fetch(request) {
      let envelope;
      try { envelope = requestSchema.parse(await request.json()); }
      catch { return Response.json({ error: 'Invalid purge request' }, { status: 400 }); }
      let parsed;
      if (envelope.method === PURGE_EVENT) {
        parsed = purgeRequestSchema.safeParse(envelope.payload);
        if (!parsed.success) return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result: fail('purge/invalid', '删除请求参数无效。', {}) }, { status: 200 });
        try {
          const home = dshHome();
          const result = await purgeArchivedSession({ home, sessionId: parsed.data.sessionId, logger: ctx.logger });
          return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result });
        } catch (error) {
          return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result: fail('purge/failed', error.message || String(error), {}) });
        }
      }
      if (envelope.method === FORGET_EVENT) {
        parsed = forgetRequestSchema.safeParse(envelope.payload);
        if (!parsed.success) return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result: fail('forget/invalid', '请求参数无效。', {}) }, { status: 200 });
        try {
          const home = dshHome();
          const ids = readPurgedIds(home);
          for (const id of parsed.data.sessionIds) if (!ids.includes(id)) ids.push(id);
          if (ids.length > MAX_PURGED) ids.splice(0, ids.length - MAX_PURGED);
          writePurgedIds(home, ids);
          return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result: { ok: true, value: { forgotten: parsed.data.sessionIds } } });
        } catch (error) {
          return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result: fail('forget/failed', error.message || String(error), {}) });
        }
      }
      return Response.json({ error: 'Unknown method' }, { status: 400 });
    },
  });
  connection.fetch.register({
    path: '/api/dsh-codex-ui/purged-ids', methods: ['GET'],
    async fetch() {
      let ids = [];
      try { ids = readPurgedIds(dshHome()); } catch { ids = []; }
      return Response.json({ ids });
    },
  });
  ctx.logger?.info?.('dsh-codex-ui: session purge endpoint registered');
}

export { registerSessionPurge, PURGE_EVENT, FORGET_EVENT };
