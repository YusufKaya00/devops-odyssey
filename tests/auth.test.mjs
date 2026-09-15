import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { registerHooks } from 'node:module';
import express from 'express';

import { createGoogleTokenAuthenticator, getRequestIdentity } from '../server/auth.js';

const CLIENT_ID = 'server-client.apps.googleusercontent.com';
const WEB_CLIENT_ID = 'web-client.apps.googleusercontent.com';
const NOW = 1_800_000_000_000;
const validPayload = {
  aud: CLIENT_ID,
  iss: 'https://accounts.google.com',
  exp: String(NOW / 1000 + 3600),
  sub: 'verified-google-user',
  email: 'verified@example.com',
  name: 'Verified User',
  picture: 'https://example.com/avatar.png'
};

// Structurally valid but forged: the old network fallback trusted this victim ID.
const forgedToken = [
  Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ ...validPayload, sub: 'victim-user' })).toString('base64url'),
  Buffer.from('not-a-google-signature').toString('base64url')
].join('.');

function createAuth(options = {}) {
  return createGoogleTokenAuthenticator({
    allowedClientIds: [CLIENT_ID, WEB_CLIENT_ID],
    now: () => NOW,
    fetchImpl: async () => { throw new Error('Unexpected verification request'); },
    ...options
  });
}

async function invoke(auth, authorization = `Bearer ${forgedToken}`) {
  const req = { headers: { authorization }, user: { id: 'stale-user' } };
  let nextCalls = 0;
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  await auth(req, res, () => { nextCalls += 1; });
  return { req, res, nextCalls };
}

function assertRejected(result, statusCode, message) {
  assert.equal(result.res.statusCode, statusCode);
  assert.deepEqual(result.res.body, { success: false, message });
  assert.equal(result.req.user, null);
  assert.equal(result.nextCalls, 0, 'Rejected credentials must not reach any route');
}

test('absent Authorization ignores identity headers and preserves only the local guest', async () => {
  const req = {
    headers: { 'x-user-id': 'victim-user', 'x-user-email': 'victim@example.com', 'x-user-name': 'Victim' },
    user: { id: 'stale-user' }
  };
  let nextCalls = 0;
  await createAuth()(req, {}, () => { nextCalls += 1; });
  assert.equal(req.user, null);
  assert.deepEqual(getRequestIdentity(req), { id: 'local_user', email: null, name: null, avatarUrl: null });
  assert.equal(nextCalls, 1);
});

test('network errors never authenticate a forged JWT or fall back to guest', async t => {
  for (const code of ['ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT']) {
    await t.test(code, async () => {
      const result = await invoke(createAuth({
        fetchImpl: async () => { throw Object.assign(new Error(code), { code }); }
      }));
      assertRejected(result, 503, 'Google token verification temporarily unavailable');
      assert.doesNotMatch(JSON.stringify(result.res.body), /victim-user|stale-user|example\.com/);
    });
  }
});

test('malformed credentials fail before verification instead of becoming guests', async t => {
  for (const header of [
    '', 'Bearer', 'Bearer ', 'Basic abc', 'Bearer not-a-jwt', 'Bearer a.b',
    'Bearer a.b.', 'Bearer a..c', 'Bearer a.b.c.d', 'Bearer a.b.c extra',
    'Bearer a.b.c&id_token=other', ['Bearer a.b.c'], null
  ]) {
    await t.test(JSON.stringify(header), async () => {
      let requests = 0;
      const result = await invoke(createAuth({ fetchImpl: async () => { requests += 1; } }), header);
      assertRejected(result, 401, 'Invalid or expired Google token');
      assert.equal(requests, 0);
    });
  }
});

test('Google rejection of an invalid signature or token returns the existing 401 response', async () => {
  const result = await invoke(createAuth({
    fetchImpl: async () => new Response('{"error":"invalid_token"}', { status: 400 })
  }));
  assertRejected(result, 401, 'Invalid or expired Google token');
});

test('upstream outages and rate limits fail closed', async t => {
  for (const status of [429, 500, 503]) {
    await t.test(String(status), async () => {
      const result = await invoke(createAuth({ fetchImpl: async () => new Response('', { status }) }));
      assertRejected(result, 503, 'Google token verification temporarily unavailable');
    });
  }
});

test('unreadable verification JSON cannot fall back to the JWT payload', async () => {
  const result = await invoke(createAuth({ fetchImpl: async () => new Response('not JSON') }));
  assertRejected(result, 503, 'Google token verification temporarily unavailable');
});

test('audience must exactly match a configured client ID', async t => {
  for (const aud of ['another-client', undefined, null, '', [CLIENT_ID]]) {
    await t.test(JSON.stringify(aud) ?? 'missing', async () => {
      const result = await invoke(createAuth({
        fetchImpl: async () => Response.json({ ...validPayload, aud })
      }));
      assertRejected(result, 401, 'Audience mismatch');
    });
  }
});

test('missing or blank client IDs cannot accidentally allow an absent audience', async () => {
  let requests = 0;
  const result = await invoke(createAuth({
    allowedClientIds: [undefined, null, '', '   '],
    fetchImpl: async () => { requests += 1; return Response.json({ ...validPayload, aud: undefined }); }
  }));
  assertRejected(result, 503, 'Google authentication is not configured');
  assert.equal(requests, 0);
});

test('invalid verified response shapes, issuers, subjects and expiry claims fail closed', async t => {
  const cases = [
    ['null response', null],
    ['array response', []],
    ['string response', 'not a payload'],
    ['wrong issuer', { ...validPayload, iss: 'https://attacker.example' }],
    ['missing issuer', { ...validPayload, iss: undefined }],
    ['missing subject', { ...validPayload, sub: undefined }],
    ['blank subject', { ...validPayload, sub: ' ' }],
    ['non-string subject', { ...validPayload, sub: 123 }],
    ['expired', { ...validPayload, exp: NOW / 1000 - 1 }],
    ['expiry boundary', { ...validPayload, exp: String(NOW / 1000) }],
    ['missing expiry', { ...validPayload, exp: undefined }],
    ['invalid expiry', { ...validPayload, exp: 'tomorrow' }],
    ['infinite expiry', { ...validPayload, exp: 'Infinity' }],
    ['array expiry', { ...validPayload, exp: [NOW / 1000 + 3600] }],
    ['fractional expiry', { ...validPayload, exp: NOW / 1000 + 0.5 }]
  ];
  for (const [name, payload] of cases) {
    await t.test(name, async () => {
      const result = await invoke(createAuth({ fetchImpl: async () => Response.json(payload) }));
      assertRejected(result, 401, 'Invalid or expired Google token');
    });
  }
});

test('valid verification uses only Google response claims and preserves the user shape', async t => {
  for (const aud of [CLIENT_ID, WEB_CLIENT_ID]) {
    for (const iss of ['accounts.google.com', 'https://accounts.google.com']) {
      await t.test(`${aud}: ${iss}`, async () => {
        let requests = 0;
        const result = await invoke(createAuth({
          allowedClientIds: [undefined, '', CLIENT_ID, WEB_CLIENT_ID],
          fetchImpl: async (url, options) => {
            requests += 1;
            assert.equal(url.origin, 'https://oauth2.googleapis.com');
            assert.equal(url.pathname, '/tokeninfo');
            assert.deepEqual([...url.searchParams], [['id_token', forgedToken]]);
            assert.equal(options.redirect, 'error');
            assert.equal(options.signal.aborted, false);
            return Response.json({ ...validPayload, aud, iss });
          }
        }), `bearer ${forgedToken}`);
        assert.deepEqual(result.req.user, {
          id: validPayload.sub,
          email: validPayload.email,
          name: validPayload.name,
          avatarUrl: validPayload.picture
        });
        assert.equal(result.res.body, undefined);
        assert.equal(result.nextCalls, 1);
        assert.equal(requests, 1);
      });
    }
  }
});

test('valid numeric expiry and absent optional profile claims still authenticate', async () => {
  const result = await invoke(createAuth({
    fetchImpl: async () => Response.json({
      aud: CLIENT_ID, iss: validPayload.iss, sub: validPayload.sub, exp: NOW / 1000 + 3600
    })
  }));
  assert.deepEqual(result.req.user, {
    id: validPayload.sub, email: undefined, name: undefined, avatarUrl: undefined
  });
  assert.equal(result.nextCalls, 1);
});

test('verification timeout aborts both connection and response body waits', { timeout: 2000 }, async t => {
  for (const phase of ['connection', 'body']) {
    await t.test(phase, async () => {
      let signal;
      const result = await invoke(createAuth({
        timeoutMs: 10,
        fetchImpl: async (_url, options) => {
          signal = options.signal;
          const waitForAbort = () => new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
          });
          return phase === 'connection' ? waitForAbort() : { ok: true, json: waitForAbort };
        }
      }));
      assertRejected(result, 503, 'Google token verification temporarily unavailable');
      assert.equal(signal.aborted, true);
    });
  }
});

test('Express rejects supplied invalid credentials before downstream guest or user actions', async t => {
  let routeCalls = 0;
  let verificationMode = 'network';
  const app = express();
  app.use(createAuth({
    fetchImpl: async () => {
      if (verificationMode === 'network') throw new Error('DNS unavailable');
      return Response.json({ ...validPayload, aud: verificationMode === 'mismatch' ? 'other' : CLIENT_ID });
    }
  }));
  app.post('/api/auth-test', (req, res) => {
    routeCalls += 1;
    res.json({ user: req.user, userId: getRequestIdentity(req).id });
  });
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/api/auth-test`;

  for (const [mode, token, status, message] of [
    ['network', forgedToken, 503, 'Google token verification temporarily unavailable'],
    ['valid', 'malformed', 401, 'Invalid or expired Google token'],
    ['mismatch', forgedToken, 401, 'Audience mismatch']
  ]) {
    verificationMode = mode;
    const response = await fetch(url, {
      method: 'POST', headers: { authorization: `Bearer ${token}`, 'x-user-id': 'victim-user' }
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { success: false, message });
    assert.equal(routeCalls, 0);
  }

  verificationMode = 'valid';
  const authenticated = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${forgedToken}` } });
  assert.equal(authenticated.status, 200);
  assert.deepEqual(await authenticated.json(), {
    user: { id: validPayload.sub, email: validPayload.email, name: validPayload.name, avatarUrl: validPayload.picture },
    userId: validPayload.sub
  });

  for (const headers of [{}, { 'x-user-id': 'existing-guest' }]) {
    const guest = await fetch(url, { method: 'POST', headers });
    assert.equal(guest.status, 200);
    assert.deepEqual(await guest.json(), { user: null, userId: 'local_user' });
  }
  assert.equal(routeCalls, 3);
});

async function loadServerRoutes(t, database, authenticate) {
  const app = express();
  const originalListen = app.listen;
  let startupCalls = 0;
  app.listen = () => { startupCalls += 1; return app; };
  const fixtureKey = Symbol.for('devops.auth-route-fixture');
  const unexpectedFileAccess = () => { throw new Error('Auth tests must not access user files'); };
  globalThis[fixtureKey] = {
    express: Object.assign(() => app, { json: express.json }),
    authenticate,
    database,
    fs: {
      existsSync: file => /[\\/]devops-sandbox$/.test(file),
      mkdirSync: unexpectedFileAccess,
      writeFileSync: unexpectedFileAccess,
      readFileSync: unexpectedFileAccess
    }
  };
  const serverUrl = new URL('../server.js?auth-route-test', import.meta.url).href;
  const authUrl = new URL('../server/auth.js', import.meta.url).href;
  const sources = new Map([
    ['express', 'export default fixture.express;'],
    ['fs', 'export default fixture.fs;'],
    ['./server/database.js', `export const {
      initDatabase, getUserData, saveUserData, resetUserData, getStorageMode
    } = fixture.database;`],
    ['./server/validators.js', 'export const validators = {};'],
    ['./server/auth.js', `export { getRequestIdentity } from ${JSON.stringify(authUrl)};
      export const createGoogleTokenAuthenticator = () => fixture.authenticate;`]
  ]);

  // Load unchanged production routes with isolated I/O, not copies of route logic.
  // Synchronous hooks: https://nodejs.org/api/module.html#moduleregisterhooksoptions
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (context.parentURL === serverUrl && sources.has(specifier)) {
        return { url: `auth-route-test:${encodeURIComponent(specifier)}`, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
      if (url.startsWith('auth-route-test:')) {
        return {
          format: 'module', shortCircuit: true,
          source: `const fixture = globalThis[Symbol.for('devops.auth-route-fixture')];
            ${sources.get(decodeURIComponent(url.slice('auth-route-test:'.length)))}`
        };
      }
      return nextLoad(url, context);
    }
  });
  try {
    await import(serverUrl);
    assert.equal(startupCalls, 1);
  } finally {
    hooks.deregister();
    delete globalThis[fixtureKey];
    app.listen = originalListen;
  }
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  return `http://127.0.0.1:${server.address().port}`;
}

test('production routes never let identity headers select another user', { timeout: 10000 }, async t => {
  const initialData = {
    completedQuests: ['existing-quest'], completedSteps: ['existing-step:0'],
    experiencePoints: 100, streak: 1, lastActiveDate: null, stepNotes: {},
    email: null, displayName: null, avatarUrl: null
  };
  const victimData = {
    ...initialData, completedQuests: ['victim-private-quest'], experiencePoints: 9999,
    email: 'victim@example.com', displayName: 'Victim', avatarUrl: 'https://example.com/victim.png',
    stepNotes: { 'private:0': 'victim-private-note' }
  };
  let records;
  let calls;
  let verificationMode = 'valid';
  let verificationCalls = 0;
  const resetRecords = () => {
    records = new Map([
      ['local_user', structuredClone(initialData)],
      ['victim-user', structuredClone(victimData)],
      [validPayload.sub, structuredClone(initialData)]
    ]);
    calls = [];
    verificationCalls = 0;
  };
  const database = {
    initDatabase: async () => {},
    getStorageMode: () => 'auth-test-memory',
    getUserData: async (id, email = null, displayName = null, avatarUrl = null) => {
      calls.push({ operation: 'read', id, email, displayName, avatarUrl });
      assert.ok(records.has(id), `Unexpected storage identity: ${id}`);
      const data = structuredClone(records.get(id));
      for (const [key, value] of Object.entries({ email, displayName, avatarUrl })) {
        if (value !== null) data[key] = value;
      }
      return data;
    },
    saveUserData: async (id, data) => {
      calls.push({ operation: 'write', id });
      records.set(id, structuredClone(data));
    },
    resetUserData: async id => {
      calls.push({ operation: 'reset', id });
      records.set(id, { ...structuredClone(initialData), completedQuests: [], completedSteps: [], experiencePoints: 0 });
    }
  };
  const baseUrl = await loadServerRoutes(t, database, createAuth({
    fetchImpl: async () => {
      verificationCalls += 1;
      if (verificationMode === 'network') throw new Error('DNS unavailable');
      return Response.json({ ...validPayload, aud: verificationMode === 'mismatch' ? 'other' : CLIENT_ID });
    }
  }));
  const spoofedHeaders = {
    'X-User-Id': 'victim-user', 'X-User-Name': 'Forged Name', 'X-User-Email': 'forged@example.com',
    'X-User-Avatar': 'https://example.com/forged.png', 'X-Forwarded-User': 'victim-user'
  };
  const routes = [
    { name: 'status', path: '/api/status', method: 'GET', operation: 'read' },
    { name: 'quest', path: '/api/verify', method: 'POST', operation: 'write',
      body: { validatorKey: 'auth-quest', difficulty: 'Beginner', isSimulated: true } },
    { name: 'step', path: '/api/verify', method: 'POST', operation: 'write',
      body: { validatorKey: 'auth-step', stepIndex: 0 } },
    { name: 'notes', path: '/api/notes', method: 'POST', operation: 'write',
      body: { validatorKey: 'auth-note', stepIndex: 0, notes: 'guest note' } },
    { name: 'reset', path: '/api/reset', method: 'POST', operation: 'reset' },
    { name: 'merge', path: '/api/merge-progress', method: 'POST', operation: 'write' }
  ];
  async function request(route, headers) {
    const response = await fetch(`${baseUrl}${route.path}`, {
      method: route.method, headers: { 'content-type': 'application/json', ...headers },
      ...(route.method === 'POST' ? { body: JSON.stringify(route.body || {}) } : {})
    });
    return { status: response.status, body: await response.json() };
  }

  for (const [headerCase, headers] of [
    ['no headers', {}], ['victim ID', { 'x-user-id': 'victim-user' }],
    ['forged profile', spoofedHeaders], ['verified user ID', { ...spoofedHeaders, 'X-User-Id': validPayload.sub }]
  ]) {
    for (const route of routes) {
      await t.test(`guest ${headerCase}: ${route.name}`, async () => {
        resetRecords();
        const result = await request(route, headers);
        assert.equal(verificationCalls, 0);
        assert.deepEqual(records.get('victim-user'), victimData);
        assert.deepEqual(records.get(validPayload.sub), initialData);
        if (route.name === 'merge') {
          assert.equal(result.status, 401);
          assert.deepEqual(result.body, { success: false, message: 'Google Authentication required to merge progress.' });
          assert.deepEqual(calls, []);
          assert.deepEqual(records.get('local_user'), initialData);
          return;
        }
        assert.equal(result.status, 200);
        assert.ok(calls.some(call => call.operation === route.operation));
        assert.ok(calls.every(call => call.id === 'local_user'));
        for (const call of calls.filter(call => call.operation === 'read')) {
          assert.deepEqual(call, { operation: 'read', id: 'local_user', email: null, displayName: null, avatarUrl: null });
        }
        const local = records.get('local_user');
        assert.equal(local.email, null);
        assert.equal(local.displayName, null);
        assert.equal(local.avatarUrl, null);
        assert.doesNotMatch(JSON.stringify(result.body), /victim-private|victim@example|Forged Name|forged@example/);
        if (route.name === 'status') assert.deepEqual(result.body.completedQuests, initialData.completedQuests);
        if (route.name === 'quest') assert.ok(local.completedQuests.includes('auth-quest'));
        if (route.name === 'step') assert.ok(local.completedSteps.includes('auth-step:0'));
        if (route.name === 'notes') assert.equal(local.stepNotes['auth-note:0'], 'guest note');
        if (route.name === 'reset') assert.equal(local.experiencePoints, 0);
      });
    }
  }

  for (const route of routes) {
    await t.test(`verified user ignores forged identity headers: ${route.name}`, async () => {
      resetRecords();
      verificationMode = 'valid';
      const result = await request(route, { ...spoofedHeaders, authorization: `Bearer ${forgedToken}` });
      assert.equal(result.status, 200);
      assert.equal(verificationCalls, 1);
      assert.deepEqual(records.get('victim-user'), victimData);
      assert.deepEqual(records.get('local_user'), initialData);
      assert.ok(calls.some(call => call.id === validPayload.sub && call.operation === route.operation));
      for (const call of calls) {
        if (route.name === 'merge' && call.operation === 'read' && call.id === 'local_user') continue;
        assert.equal(call.id, validPayload.sub);
        if (call.operation === 'read') {
          assert.deepEqual(call, {
            operation: 'read', id: validPayload.sub, email: validPayload.email,
            displayName: validPayload.name, avatarUrl: validPayload.picture
          });
        }
      }
    });
  }

  for (const [mode, token, expectedStatus] of [
    ['network', forgedToken, 503], ['mismatch', forgedToken, 401], ['valid', 'malformed', 401]
  ]) {
    for (const route of routes) {
      await t.test(`rejected credentials with forged headers: ${mode}, ${route.name}`, async () => {
        resetRecords();
        verificationMode = mode;
        const result = await request(route, { ...spoofedHeaders, authorization: `Bearer ${token}` });
        assert.equal(result.status, expectedStatus);
        assert.equal(result.body.success, false);
        assert.deepEqual(calls, []);
        assert.deepEqual(records.get('victim-user'), victimData);
        assert.deepEqual(records.get('local_user'), initialData);
        assert.deepEqual(records.get(validPayload.sub), initialData);
      });
    }
  }
});
