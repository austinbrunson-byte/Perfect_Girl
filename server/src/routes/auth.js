// Register / login / me / logout. Passwords hashed with bcrypt.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, requireAuth } from '../auth.js';

const r = Router();
const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name });

r.post('/register', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim().slice(0, 40);
  const password = String(req.body?.password || '');
  if (!emailRe.test(email)) return res.status(400).json({ error: 'invalid email' });
  if (password.length < 6) return res.status(400).json({ error: 'password too short (min 6)' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, name, pass_hash) VALUES (?,?,?)').run(email, name, hash);
  const user = { id: Number(info.lastInsertRowid), email, name };
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

r.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!u || !bcrypt.compareSync(password, u.pass_hash)) {
    return res.status(401).json({ error: 'wrong email or password' });
  }
  res.json({ token: signToken(u), user: publicUser(u) });
});

r.get('/me', requireAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json({ user: publicUser(u) });
});

// Stateless JWT — logout is a client-side token discard. Endpoint exists for
// symmetry and as the hook for future server-side revocation.
r.post('/logout', (_req, res) => res.json({ ok: true }));

export default r;
