# Perfect Girl — continuation handoff

Paste the block below into a fresh chat to continue with minimal token overhead.
**Always read `index.html` first before making changes.**

---

**Project: "Perfect Girl" web app — continuation**

I have a single-file web app already built and deployed. Everything you need is in
the repo — **read `index.html` first** before making changes.

- **Repo:** `austinbrunson-byte/Perfect_Girl` (GitHub). Work on the default branch
  `main`, commit + push directly. It auto-deploys to **GitHub Pages** at
  https://austinbrunson-byte.github.io/Perfect_Girl/ via `.github/workflows/pages.yml`
  (every push to `main` redeploys).
- **What it is:** one self-contained `index.html` (no build step). A yes/no
  compatibility game ("Perfect girl, but…" + a dealbreaker over a photo;
  swipe/tap/arrows). Assets alongside it: `icon.svg` + `appicon.svg` (anime girl,
  blue eyes), `apple-touch-icon.png` / `icon-192.png` / `icon-512.png`,
  `site.webmanifest`, and `sfx/` (yes-sound voice clips).
- **Version:** there's a `const APP_VERSION` near the top of the `<script>`, shown
  in the footer. **Bump it on every push** (currently around v2.6) so I can tell
  which build is live. Test cache-busted with `?v=NN`.
- **Prompt bank:** a JS array `const ISSUES = [...]` grouped by section comments.
  ~188 prompts, ~50% roach. Keep a dup-guard when appending.
- **Voice rules (strict):** deadpan, one clean sentence, no punchline/wink, name the
  roach plainly, plausible percentage, a **recurring** trait (never one-time), tied
  to *her* or the couple. Favorite pattern: *"X% of the time [ordinary shared
  moment], a roach [appears]."* Full spec + approved/rejected examples live in
  `perfect-girl-style-guide.md` (also the brief I paste into a separate Fable chat
  to generate more; it returns a JSON array of strings).
- **Train tab:** swipe/tap prompts good(right)/bad(left)/maybe(up; opens a note).
  Ratings persist in `localStorage` (`pg_train_ratings_v2`, keyed by exact prompt
  text, shape `{verdict, note}`). Train serves only **untrained** prompts, **30 per
  batch**, with a "Rate N more new" button. Copy JSON / Download export the whole
  bank + ratings; **Load JSON** re-imports a previous export.
- **`SEED_RATINGS`** (near the Train code): baked-in ratings keyed by prompt text,
  merged into localStorage on load (never overwriting local). This is how trained
  state ships with the app and survives cache clears / re-added Home Screen icons /
  new devices. When I send an export, bake the `good` verdicts here.
- **Play only serves prompts vetted `good`** (seed + local ratings); untrained /
  rejected prompts stay in Train only. Falls back to the whole bank if nothing is
  rated.
- **Sound is girl-side only.** The anime-girl voice clips + cute synth chimes don't fit
  the guy world, so `playHappy/playSad/playMaybe` no-op when `subjectKey==='guy'`, the
  header 🔊 button is hidden, and the Account "Sound" row is hidden. All restore on girl.
- **Exports are labeled by subject:** `tPayload()` includes `subject`/`subjectLabel`, and
  Download names the file `perfect-<girl|guy>-ratings.json`.
- **Sound (girl):** a 🔊 toggle in the header (persists in `localStorage` `pg_sound`).
  Yes/Good plays a **random** real voice clip from `sfx/` (synth chime fallback);
  No/Bad and Maybe are synthesized Web Audio chimes. iOS: clips play inside the tap
  gesture (no readyState gating) with a one-time muted-play unlock; the hardware
  silent switch mutes everything. Sad/No **voice** clips not yet provided.
- **Layout:** locked to `100dvh`, no page scroll; `html{background}` set so no white
  bar shows. Keep it that way.
- **Photos:** `const PHOTOS_GIRL = [...]` — 25 Unsplash portrait URLs, all women;
  `const PHOTOS_GUY = [...]` — 24 male portraits. `let PHOTOS` points at the active one.
- **Girl / Guy swap:** a `⇄` button top-left of the header toggles `subject` between
  `girl` and `guy` (persists in `localStorage` `pg_subject`). Guy is a mirror: blue
  theme (CSS vars swap via `:root[data-subject="guy"]`), male photos, and a separate
  bank `ISSUES_GUY` — the ordinary human dealbreakers pronoun-flipped to *him*, with
  every roach / Shaq / The General prompt removed, plus its own batch of original,
  guy-coded dealbreakers (the boys, gaming, gym, sports, trucks, his mom/ex, ego) —
  ~135 total, fully separate from the girl bank (no shared strings). Each subject has
  its own ratings + profile localStorage keys and its own `SEED_*`. All of it is driven by the
  `SUBJECTS` config + `applySubject()`; the You axis labels/flavor come from there too
  (girl: impossible/ordinary; guy: red flags/little things).
- **Matchmaker share link:** the You tab has a name field + "Share my matchmaker link"
  (`navigator.share`, clipboard fallback, and the raw link shown). It encodes the
  subject + profile tally into the URL hash (`#s=<base64 JSON>`, no backend). Opening
  such a link shows a read-only `#shareView` ("<name> is looking for a girl/guy" + their
  type, tolerances, hard-no, and where to look) themed to the shared subject, so friends
  can go find them a match. `computeProfile()` is shared by the You tab and the share
  view; "Make your own ▸" clears the hash and reloads.
- **First-open chooser:** if no `pg_subject` is saved yet, a full-screen overlay
  (`#chooser`) asks "Who are you looking for?" with a girl photo + guy photo (tap to
  pick, no swipe). Picking calls `applySubject()` (persists) and dismisses it; after
  that the saved subject loads straight in. Shared links skip the chooser.
- **Account tab (local foundation):** a 4th tab. Device-local accounts in `localStorage`
  (`pg_accounts` keyed by email, `pg_session` = current email) — register / log in /
  log out, plus a settings panel (Looking for girl/guy → `applySubject`; Sound; Display
  name → `pg_name`). No server yet; `hashPass()` is a placeholder — the seams
  (`loadAccounts`/`hashPass`/submit handler) are where real auth drops in later.

**My usual workflow — I'll do one of these:**
1. Paste an exported **ratings JSON** → keep `good` verbatim + **bake into
   `SEED_RATINGS`**, rewrite each `maybe` per its note, drop `bad` from `ISSUES`,
   push.
2. Paste a **JSON array of new prompts** (from the Fable brief) → append to `ISSUES`
   deduped.
3. Ask for a fresh batch or other tweaks.

**Validate in headless Chromium before pushing** (Playwright at the global npm root;
Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — the numbered dir
can change, resolve it if needed). Sanity-check: `ISSUES.length`, no duplicates,
seed count, `document.documentElement.scrollHeight - window.innerHeight === 0` at a
phone viewport, and no `pageerror`s. Then bump `APP_VERSION`, commit, push.

**First step: read `index.html`, tell me the current prompt count, seed count, and
version, then wait for my ratings JSON / prompt array / request.**

---

## Notes for whoever picks this up

- The bank + `SEED_RATINGS` are regenerated with small Node scripts (locate the
  `const ISSUES = [` / `const SEED_RATINGS = {` blocks and splice) — see git history
  for the pattern. Each entry is `JSON.stringify`'d so quotes/`×`/`’` escape cleanly.
- Ratings are keyed by exact prompt text, so **rewording a prompt makes it
  "untrained" again** (shows in Train) while unchanged prompts stay rated. Intended.
- To add sad/no voice: mirror the yes pool — drop clips in `sfx/`, build a
  `NO_SRCS`/`noPool`, and play a random one in `playSad` (keep synth fallback).
