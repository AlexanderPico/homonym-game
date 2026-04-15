Public daily data lives here.

Files:
- `today.js` — generated local-only payload containing exactly one publishable puzzle for the public site

Notes:
- `today.js` is ignored by git and must never be committed to the public repo
- generate it from the private corpus with:
  - `node scripts/build-public-daily.js`
  - or `node scripts/build-public-daily.js YYYY-MM-DD`
