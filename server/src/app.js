// Express app wiring. Kept separate from index.js so tests can spin it up on an
// ephemeral port without binding the real one.
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import shareRoutes from './routes/share.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  const origin = process.env.CORS_ORIGIN || '*';
  app.use(cors({ origin: origin === '*' ? true : origin.split(',').map((s) => s.trim()) }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/share', shareRoutes);

  app.use((_req, res) => res.status(404).json({ error: 'not found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  });

  return app;
}
