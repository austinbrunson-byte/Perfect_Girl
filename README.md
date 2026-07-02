# Perfect Girl ♥

A very serious yes/no compatibility test. Would you still say yes?

Each prospect starts with **"Perfect girl, but…"** followed by one small
(usually roach-related) dealbreaker, shown over a photo. Say **Yes** or **No** —
tap the buttons, swipe the card, or use the arrow keys. At the end you get your
official **roach tolerance** verdict.

## Run it

It's a single, self-contained HTML file with no build step and no dependencies.

- Open `index.html` in any browser, **or**
- Serve it locally: `python3 -m http.server` then visit http://localhost:8000

## Deploy (free static hosting)

Because it's one static file, you can drop it on GitHub Pages:

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick `main` / `/ (root)`.
3. Your app goes live at `https://<user>.github.io/perfect-girl/`.

## Credits

Portrait photos are pulled from [Unsplash](https://unsplash.com) under the
Unsplash License (free to use). If a photo fails to load, an inline gradient
placeholder is shown instead. The app icon (`icon.svg`) is a hand-drawn
anime-style portrait.
