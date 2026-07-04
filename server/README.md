# Perfect Girl — backend API (foundation)

A small Node/Express + SQLite service that will back the "real live app": real
accounts, cloud-synced ratings/profiles, and server-backed matchmaker links.

This is **separate from the static app**. The GitHub Pages site (`../index.html`)
keeps running on localStorage and is unaffected by anything here. We keep tweaking
the static app; when it's ready, the frontend gets pointed at this API.

## Stack

- **Node + Express** — one language with the app, runs on any Node host.
- **SQLite** via `better-sqlite3` — a single file, zero config. The schema is
  Postgres-shaped (JSON blobs for the app data) so moving to Postgres later is
  mechanical.
- **bcryptjs** for password hashing, **JWT** (bearer tokens) for sessions.

## Run it

```bash
cd server
cp .env.example .env      # then set JWT_SECRET
npm install
npm start                 # or: npm run dev  (watch mode)
npm run smoke             # end-to-end test on a throwaway DB
```

Server listens on `PORT` (default 3000). Data lives in `DB_PATH` (default
`./data/app.db`, git-ignored).

## API

Base path `/api`. JSON in, JSON out. Auth endpoints return a `token`; send it as
`Authorization: Bearer <token>` on protected routes.

| Method | Path                 | Auth      | Body / notes |
|--------|----------------------|-----------|--------------|
| GET    | `/api/health`        | –         | liveness |
| POST   | `/api/auth/register` | –         | `{ email, name?, password }` → `{ token, user }` |
| POST   | `/api/auth/login`    | –         | `{ email, password }` → `{ token, user }` |
| GET    | `/api/auth/me`       | bearer    | → `{ user }` |
| POST   | `/api/auth/logout`   | –         | stateless; client discards token |
| GET    | `/api/data/:subject` | bearer    | `subject` = `girl`\|`guy` → `{ ratings, profile, updatedAt }` |
| PUT    | `/api/data/:subject` | bearer    | `{ ratings, profile }` → `{ ok }` |
| POST   | `/api/share`         | optional  | `{ subject, name?, payload }` → `{ id }` |
| GET    | `/api/share/:id`     | –         | → `{ subject, name, payload, createdAt }` |

`ratings` / `profile` are stored verbatim as the app's own shapes
(`pg_train_ratings_*` map and the `pg_profile_*` tally), so syncing is a
straight copy in and out.

## Data model

- **users** — `id, email (unique), name, pass_hash, created_at`
- **user_data** — `(user_id, subject)` PK, `ratings_json, profile_json, updated_at`
- **shares** — `id (short), user_id?, subject, name, payload_json, created_at`

## Deploying (later)

Any long-running Node host works — Render, Railway, Fly.io, a VPS. Set `PORT`,
a strong `JWT_SECRET`, `CORS_ORIGIN` (the Pages origin, e.g.
`https://austinbrunson-byte.github.io`), and a persistent volume for `DB_PATH`.
In production the server refuses to boot without `JWT_SECRET`.

## Wiring the frontend (later, on your call)

The static app currently reads/writes `localStorage`. To go live we add a thin
client that, when logged in, mirrors those same reads/writes to `/api/data/:subject`
and resolves `/api/share/:id`. Nothing here forces that yet — the app works
offline-first and this is the server it will sync to.

> Security note: this is a foundation. Before real users, add rate limiting on
> auth, HTTPS/secure cookies or token storage hardening, and email verification.
