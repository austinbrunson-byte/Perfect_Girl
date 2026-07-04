// End-to-end smoke test: boots the app on an ephemeral port against a throwaway
// SQLite file and exercises the full auth + data + share surface with real HTTP.
import { rmSync } from 'node:fs';

const DB = `./data/smoke-${Date.now()}.db`;
process.env.DB_PATH = DB;
process.env.JWT_SECRET = 'smoke-secret';

const { createApp } = await import('../src/app.js');
const server = await new Promise((resolve) => {
  const s = createApp().listen(0, () => resolve(s));
});
const base = `http://127.0.0.1:${server.address().port}`;

let pass = 0, fail = 0;
const ok = (name, cond) => { (cond ? pass++ : fail++); console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}`); };
const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
};

try {
  const email = `smoke${Date.now()}@test.com`;

  ok('health', (await call('GET', '/api/health')).json?.ok === true);

  // register
  let r = await call('POST', '/api/auth/register', { body: { email, name: 'Smoke', password: 'secret1' } });
  ok('register 201', r.status === 201 && !!r.json.token);
  const token = r.json.token;

  // duplicate register rejected
  r = await call('POST', '/api/auth/register', { body: { email, name: 'Dup', password: 'secret1' } });
  ok('duplicate email 409', r.status === 409);

  // bad password rejected
  r = await call('POST', '/api/auth/register', { body: { email: `x${email}`, password: '123' } });
  ok('short password 400', r.status === 400);

  // login wrong / right
  ok('login wrong 401', (await call('POST', '/api/auth/login', { body: { email, password: 'nope' } })).status === 401);
  r = await call('POST', '/api/auth/login', { body: { email, password: 'secret1' } });
  ok('login 200', r.status === 200 && !!r.json.token);

  // me: gated
  ok('me without token 401', (await call('GET', '/api/auth/me')).status === 401);
  r = await call('GET', '/api/auth/me', { token });
  ok('me 200', r.status === 200 && r.json.user.email === email);

  // data: empty then round-trip
  r = await call('GET', '/api/data/girl', { token });
  ok('data empty', r.status === 200 && Object.keys(r.json.ratings).length === 0);

  const ratings = { 'she chews with her mouth open.': { verdict: 'good', note: '' } };
  const profile = { total: 3, yesHuman: 2, noHuman: 1 };
  ok('data put', (await call('PUT', '/api/data/girl', { token, body: { ratings, profile } })).json?.ok === true);
  r = await call('GET', '/api/data/girl', { token });
  ok('data get round-trip', r.json.ratings['she chews with her mouth open.']?.verdict === 'good' && r.json.profile.total === 3);

  // subjects are isolated
  r = await call('GET', '/api/data/guy', { token });
  ok('other subject empty', Object.keys(r.json.ratings).length === 0);

  ok('bad subject 400', (await call('GET', '/api/data/nope', { token })).status === 400);

  // share create + fetch
  r = await call('POST', '/api/share', { body: { subject: 'girl', name: 'Austin', payload: { total: 3, yesHuman: 2 } } });
  ok('share create 201', r.status === 201 && !!r.json.id);
  const sid = r.json.id;
  r = await call('GET', `/api/share/${sid}`);
  ok('share fetch', r.status === 200 && r.json.name === 'Austin' && r.json.payload.total === 3);
  ok('share 404', (await call('GET', '/api/share/doesnotexist')).status === 404);

  console.log(`\n${pass} passed, ${fail} failed`);
} finally {
  server.close();
  for (const suffix of ['', '-shm', '-wal']) { try { rmSync(DB + suffix); } catch {} }
}
process.exit(fail ? 1 : 0);
