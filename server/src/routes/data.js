// Per-user, per-subject sync of the app's ratings map and You-profile tally.
// GET returns what's stored (empty objects if nothing yet); PUT upserts.
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
const SUBJECTS = new Set(['girl', 'guy']);

r.get('/:subject', requireAuth, (req, res) => {
  const { subject } = req.params;
  if (!SUBJECTS.has(subject)) return res.status(400).json({ error: 'bad subject' });
  const row = db.prepare(
    'SELECT ratings_json, profile_json, updated_at FROM user_data WHERE user_id=? AND subject=?'
  ).get(req.userId, subject);
  res.json({
    ratings: row ? JSON.parse(row.ratings_json) : {},
    profile: row ? JSON.parse(row.profile_json) : {},
    updatedAt: row ? row.updated_at : null
  });
});

r.put('/:subject', requireAuth, (req, res) => {
  const { subject } = req.params;
  if (!SUBJECTS.has(subject)) return res.status(400).json({ error: 'bad subject' });
  const ratings = req.body?.ratings;
  const profile = req.body?.profile;
  if (ratings != null && typeof ratings !== 'object') return res.status(400).json({ error: 'ratings must be an object' });
  if (profile != null && typeof profile !== 'object') return res.status(400).json({ error: 'profile must be an object' });

  db.prepare(`
    INSERT INTO user_data (user_id, subject, ratings_json, profile_json, updated_at)
    VALUES (?,?,?,?, datetime('now'))
    ON CONFLICT(user_id, subject) DO UPDATE SET
      ratings_json = excluded.ratings_json,
      profile_json = excluded.profile_json,
      updated_at   = excluded.updated_at
  `).run(req.userId, subject, JSON.stringify(ratings ?? {}), JSON.stringify(profile ?? {}));

  res.json({ ok: true });
});

export default r;
