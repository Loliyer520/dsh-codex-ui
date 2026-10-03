import test from 'node:test';
import assert from 'node:assert/strict';
import { createBalanceReader } from '../src/api-balance.js';

test('balance queries use server credentials, coalesce requests and cache per credential', async () => {
  let key = 'test-key', calls = 0;
  const read = createBalanceReader(() => ({ dependencies: {
    options: () => ({ baseURL: 'https://api.deepseek.com/anthropic' }),
    resolveAuth: async () => ({ headers: { 'x-api-key': key } })
  } }), async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.deepseek.com/user/balance');
    assert.equal(options.headers.Authorization, `Bearer ${key}`);
    assert.equal(options.redirect, 'error');
    return Response.json({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '3.25', granted_balance: '1.00', topped_up_balance: '2.25' }] });
  });
  const results = await Promise.all([read(), read()]);
  assert.equal(calls, 1);
  assert.equal(results[0].value.balances[0].total, '3.25');
  assert.equal(JSON.stringify(results).includes(key), false);
  await read();
  assert.equal(calls, 1);
  key = 'new-test-key';
  await read();
  assert.equal(calls, 2);
});

test('unsupported providers and failures never expose provider secrets or response text', async () => {
  let authCalls = 0;
  const unsupported = createBalanceReader(() => ({ dependencies: {
    options: () => ({ baseURL: 'https://third-party.example' }),
    resolveAuth: async () => { authCalls++; }
  } }));
  assert.equal((await unsupported()).error.code, 'balance/unsupported');
  assert.equal(authCalls, 0);
  const broken = createBalanceReader(() => ({ dependencies: {
    options: () => ({ baseURL: 'https://api.deepseek.com' }),
    resolveAuth: async () => { throw new Error('secret-test-key'); }
  } }));
  assert.equal(JSON.stringify(await broken()).includes('secret-test-key'), false);
  const invalid = createBalanceReader(() => ({ dependencies: {
    options: () => ({ baseURL: 'https://api.deepseek.com' }),
    resolveAuth: async () => ({ headers: { 'x-api-key': 'test-key' } })
  } }), async () => Response.json({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: 'invalid' }] }));
  const invalidResults = await Promise.all([invalid(), invalid()]);
  assert.ok(invalidResults.every(result => result.ok === false));
});
