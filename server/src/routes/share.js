// Server-backed matchmaker links. POST stores a brief and returns a short id;
// GET resolves it. Auth is optional — a logged-in author gets linked to the row,
// anonymous shares are allowed too.
import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { db } from '../db.js';
import { optionalAuth } from '../auth.js';

const r = Router();
const SUBJECTS = new Set(['girl', 'guy']);
const shortId = () => randomBytes(6).toString('base64url'); // ~8 chars

r.post('/', optionalAuth, (req, res) => {
  const subject = String(req.body?.subject || '');
  if (!SUBJECTS.has(subject)) return res.status(400).json({ error: 'bad subject' });
  const payload = req.body?.payload;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'missing payload' });
  const name = String(req.body?.name || '').slice(0, 40);

  const id = shortId();
  db.prepare('INSERT INTO shares (id, user_id, subject, name, payload_json) VALUES (?,?,?,?,?)')
    .run(id, req.userId ?? null, subject, name, JSON.stringify(payload));
  res.status(201).json({ id });
});

r.get('/:id', (req, res) => {
  const row = db.prepare('SELECT subject, name, payload_json, created_at FROM shares WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ subject: row.subject, name: row.name, payload: JSON.parse(row.payload_json), createdAt: row.created_at });
});

export default r;
