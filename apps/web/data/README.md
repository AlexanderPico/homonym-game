Public daily data lives here.

Files:
- `today.js` — generated payload containing exactly one English puzzle for the public site
- `today-jp.js` — generated payload containing exactly one Japanese puzzle for the public site

Notes:
- both generated payloads are ignored by git and must never be committed to the public repo
- generate them from the curated source corpora (`en-puzzles.js` / `jp-puzzles.js`) with:
  - `node scripts/build-public-daily.js`
  - or `node scripts/build-public-daily.js YYYY-MM-DD`
