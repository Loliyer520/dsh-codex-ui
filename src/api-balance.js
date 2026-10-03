import { createHash } from 'node:crypto';

// Keep provider credentials on the server; only return validated balance fields.
export function createBalanceReader(getAdapter, fetcher = fetch) {
  let cached;
  let pending;
  return async function readBalance() {
    const fail = (code, message) => ({ ok: false, error: { code, message } });
    try {
      const adapter = getAdapter();
      if (!adapter?.dependencies?.options || !adapter.dependencies.resolveAuth) return fail('balance/unconfigured', '尚未配置 DeepSeek API');
      const options = adapter.dependencies.options();
      const url = new URL(options.baseURL);
      if (url.protocol !== 'https:' || url.hostname !== 'api.deepseek.com' || url.port || url.username || url.password) return fail('balance/unsupported', '当前服务地址不支持官方余额查询');
      const auth = await adapter.dependencies.resolveAuth(options);
      const headers = new Headers(auth.headers);
      const key = headers.get('x-api-key') || headers.get('authorization')?.replace(/^Bearer\s+/i, '');
      if (!key) return fail('balance/unconfigured', '尚未配置 DeepSeek API');
      const identity = createHash('sha256').update(key).digest('hex');
      if (cached?.identity === identity && Date.now() - cached.at < 30_000) return cached.result;
      if (pending?.identity === identity) return pending.promise;
      const promise = (async () => {
        const response = await fetcher('https://api.deepseek.com/user/balance', { headers: { Authorization: `Bearer ${key}` }, redirect: 'error', signal: AbortSignal.timeout(10_000) });
        if (!response.ok) return fail('balance/http', response.status === 401 || response.status === 403 ? 'API 密钥无效或无余额查询权限' : '余额暂时无法读取，请稍后重试');
        const body = await response.json();
        if (typeof body.is_available !== 'boolean' || !Array.isArray(body.balance_infos) || !body.balance_infos.length) return fail('balance/invalid', '余额返回格式异常');
        const balances = body.balance_infos.map(row => {
          if (!['CNY', 'USD'].includes(row.currency) || !['total_balance', 'granted_balance', 'topped_up_balance'].every(k => typeof row[k] === 'string' && /^\d+(?:\.\d+)?$/.test(row[k]))) throw new Error('Invalid balance');
          return { currency: row.currency, total: row.total_balance, granted: row.granted_balance, toppedUp: row.topped_up_balance };
        });
        const result = { ok: true, value: { available: body.is_available, balances } };
        cached = { identity, at: Date.now(), result };
        return result;
      })().catch(() => fail('balance/failed', '余额读取失败，请检查 API 配置或稍后重试'));
      pending = { identity, promise };
      try { return await promise; } finally { if (pending?.promise === promise) pending = null; }
    } catch {
      // Provider exceptions may contain credentials or response bodies; never relay them.
      return fail('balance/failed', '余额读取失败，请检查 API 配置或稍后重试');
    }
  };
}

export function registerBalance(ctx) {
  const readBalance = createBalanceReader(() => ctx.get('llm')?.adapters.get('deepseek-official')?.adapter);
  ctx.connection.fetch.register({
    path: '/api/dsh-codex-ui/balance', methods: ['POST'], requestBody: 'buffered',
    async fetch(request) {
      let envelope;
      try { envelope = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
      if (envelope?.type !== 'client-request' || envelope.method !== 'dsh-codex-ui/balance' || typeof envelope.rpcId !== 'string' || envelope.rpcId.length > 256) return Response.json({ error: 'Invalid request' }, { status: 400 });
      return Response.json({ type: 'server-response', rpcId: envelope.rpcId, result: await readBalance() });
    }
  });
}
