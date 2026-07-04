// SQLite data layer. One file, zero-config for dev; the schema is written so a
// swap to Postgres later is mechanical (same tables/columns, JSON blobs for the
// app-shaped ratings/profile). All access goes through the prepared statements
// in the route modules.
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DB_PATH = process.env.DB_PATH || './data/app.db';
mkdirSync(dirname(resolve(DB_PATH)), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    name       TEXT NOT NULL DEFAULT '',
    pass_hash  TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- One row per (user, subject). Mirrors the app's localStorage: the ratings map
  -- (pg_train_ratings_*) and the You-profile tally (pg_profile_*), stored as JSON.
  CREATE TABLE IF NOT EXISTS user_data (
    user_id      INTEGER NOT NULL,
    subject      TEXT NOT NULL,
    ratings_json TEXT NOT NULL DEFAULT '{}',
    profile_json TEXT NOT NULL DEFAULT '{}',
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, subject),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Server-backed matchmaker links: a short id resolves to a shared brief, so the
  -- app can move off the base64-in-the-URL scheme to real short links.
  CREATE TABLE IF NOT EXISTS shares (
    id           TEXT PRIMARY KEY,
    user_id      INTEGER,
    subject      TEXT NOT NULL,
    name         TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);
