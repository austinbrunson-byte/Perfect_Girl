# Perfect Girl — continuation handoff

Paste this into a fresh chat to continue with minimal token overhead.
**Always read `index.html` first before making changes.**

---

**Project: "Perfect Girl" web app — continuation**

I have a single-file web app already built and deployed. Everything you need is in
the repo — **read `index.html` first** before making changes.

- **Repo:** `austinbrunson-byte/Perfect_Girl` (GitHub). Work on the default branch
  `main`. It's a static site auto-deployed to **GitHub Pages** at
  https://austinbrunson-byte.github.io/Perfect_Girl/ via `.github/workflows/pages.yml`
  — every push to `main` redeploys. Commit and push directly to `main`.
- **What it is:** one self-contained `index.html` (no build step). A yes/no
  compatibility game ("Perfect girl, but…" + a dealbreaker over a photo;
  swipe/tap/arrows). Anime-girl favicon `icon.svg`.
- **Prompt bank:** a JS array `const ISSUES = [...]` grouped by section comments
  (roaches / Shaq / insurance / ordinary). **~93 prompts, target ~70% roach.**
- **Voice rules (strict):** deadpan, one clean sentence, no punchline/wink, name the
  roach plainly ("a roach", "roach legs"), use a plausible percentage, describe a
  **recurring** trait (never a one-time event), and tie it to *her* or the couple.
  The pattern the owner likes most: *"X% of the time [ordinary shared moment], a
  roach [appears]."*
- **Train tab:** swipe prompts good/right, bad/left, maybe/up (maybe opens a note
  field). Ratings persist in `localStorage` (`pg_train_ratings_v2`, keyed by prompt
  text, shape `{verdict, note}`). Train only serves **untrained** prompts; **Copy
  JSON / Download** exports the whole bank. Goal: grow the bank toward hundreds over
  time.
- **Layout:** locked to `100dvh`, no page scroll; the card flexes to fit. Keep it
  that way.
- **Photos:** `const PHOTOS = [...]` Unsplash portrait URLs.

**My usual workflow:** I paste an exported ratings JSON → you keep the `good`
verbatim, rewrite the `maybe` per each note, drop the `bad`, then push. Or I ask for
a fresh batch of new prompts (following the voice rules, ~70% roach, deduped)
appended to the bank. Validate in headless Chromium (Playwright is at the global npm
root; Chromium at `/opt/pw-browsers/chromium/chrome-linux/chrome`) before pushing.

**First step: read `index.html`, then tell me the current prompt count and wait for
my ratings JSON or batch request.**

---

## Notes for whoever picks this up

- The prompt bank is regenerated with small Node scripts (find `const ISSUES = [`,
  splice the block) — see git history for the pattern. Each entry is `JSON.stringify`'d
  so quotes/`×`/apostrophes escape cleanly.
- Keep a dup-guard when appending (compare against existing `ISSUES`).
- Ratings are keyed by exact prompt text, so **rewording a prompt makes it "untrained"
  again** (shows up in Train) while unchanged prompts stay rated. That's intended.
- After edits, sanity-check in headless Chromium: `ISSUES.length`, no duplicates,
  `document.documentElement.scrollHeight - window.innerHeight === 0` (no scroll at a
  phone viewport), and no `pageerror`s.
