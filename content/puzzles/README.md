This directory holds puzzle data and editorial assets.

Current public-safe contents:
- `README.md` — explains how private/local puzzle data is handled

Private/local files expected here but ignored by git:
- `draft-40.js` — full unpublished corpus used for local curation

Notes:
- the public repo should not contain the active unpublished puzzle corpus
- generate a single public daily payload into `apps/web/data/today.js` instead
- use `node scripts/build-public-daily.js` to export the current daily puzzle from the private corpus
