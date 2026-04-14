This directory holds puzzle data and editorial assets.

Current contents:
- `starter-puzzles.js` — original locally loadable seed corpus for the web demo
- `draft-40.js` — active 40-puzzle draft corpus used by the current prototype

Current puzzle record fields:
- `id`
- `clue`
- `displayAnswer`
- `answerWords`
- `aliases`
- `explanation`
- `difficulty`
- `status`
- `notes`

Why JS instead of JSON right now:
- the prototype must open directly from the filesystem without a build step
- browser `fetch()` on local JSON is less reliable under `file://`
- this can later convert to JSON once the app has a dev/build pipeline
