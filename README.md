# Gyeong Taek Lee — Personal Website

A static site (no build step) generated from `CV_GyeongTaek_Lee_2026_07.pdf`.

## Files
- `index.html` — page structure
- `style.css` — design system (control-chart / datasheet theme)
- `data.js` — all CV content (edit this to add/update publications, awards, etc.)
- `script.js` — renders the lists from `data.js` and draws the hero control chart

## Publish with GitHub Pages

1. Create a new repository on GitHub, e.g. `LeeGyeongTak/LeeGyeongTak.github.io`
   (using that exact name gives you the URL `https://leegyeongtak.github.io/`;
   any other repo name works too, just under `/reponame/`).
2. Push these four files to the repo root:
   ```bash
   git init
   git add index.html style.css data.js script.js README.md
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/LeeGyeongTak/LeeGyeongTak.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)` → **Save**.
4. Wait ~1 minute, then visit the URL GitHub shows on that same Pages settings page.

## Updating content later
Everything text-based lives in `data.js` as plain arrays/objects — add a new
journal article, award, or project by adding one entry, no HTML editing needed.
