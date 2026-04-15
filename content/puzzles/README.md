This directory holds puzzle data and editorial assets.

Current public-safe contents:
- `README.md` — explains how private/local puzzle data is handled

Private/local files expected here but ignored by git:
- English corpus file(s)
- Japanese corpus file(s)

Notes:
- the public repo should not contain the active unpublished puzzle corpus for any locale
- generate public daily payloads into `apps/web/data/today.js` and `apps/web/jp/data/today-jp.js` instead
- use `node scripts/build-public-daily.js` to export the current daily puzzles from the source corpus
