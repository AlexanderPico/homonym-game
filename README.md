# Homonym Game

A wordplay game prototype for clueing homonym pairs that resolve into a valid phrase.

Initial concept:
- clue a two-word answer made of homonyms or homophone pairs
- answers should ideally form a legitimate phrase on their own
- tone and polish should support eventual daily distribution in the style of NYT mini word games

This repository is structured for two horizons:
1. near-term: a simple static web demo that opens locally on a phone or desktop browser
2. longer-term: a content pipeline and web product that can support daily puzzle distribution, archiving, analytics, and social play

## Repository layout

- `apps/web/` — local-openable web prototype
- `content/puzzles/` — puzzle corpus and future authoring assets
- `packages/game-core/` — reusable normalization and answer-checking utilities
- `docs/` — roadmap, design, and implementation notes
- `tests/` — lightweight automated checks for core game logic

## Current prototype

Open these files in a browser:
- public daily page: `apps/web/index.html`
- local/private curator view: `apps/web/admin/index.html`

No build step is required for the current prototype, but the public page now expects a generated daily payload.

Current demo behavior:
- `/` is intended to serve exactly one generated daily puzzle
- local `/admin/` preserves the browse-and-curate `Next puzzle` workflow
- typed guesses with no answer-revealing placeholder text
- typo-aware near-match feedback for guesses that are one misspelling away
- three-guess limit per puzzle
- spoiler-safe share glyph summary after solve, fail, or reveal
- editorial styling aimed at a polished daily-game feel

## Current content state

- private unpublished corpus and curator-only files now live in the sibling private repo:
  - `../homonym-game-private/`
- this public repo only generates and serves one daily payload at a time
- `apps/web/data/today.js` is a generated local/public payload containing exactly one puzzle and is ignored by git
- `docs/content-notes.md` tracks editorial rules and file roles without exposing the private full draft file

## Reality check

Web research did not surface a major existing daily game with this exact clue-to-homophone-pair format. The closest public relatives are:
- Hink Pink / Hinky Pinky style clue-to-word-pair puzzles
- dictionary homophone quizzes
- cryptic crossword homophone clueing

Best corpus sources appear to be generated rather than copied:
- CMU Pronouncing Dictionary
- Datamuse homophone lookup
- Wiktionary for definitions/pronunciations
- wordfreq for familiarity filtering

So the current recommendation is:
- treat the format as reasonably original in product form
- build your own curated corpus rather than relying on a huge ready-made public list

## Easiest public deployment right now

For the current static build, the simplest shareable URL path is GitHub Pages.

Suggested setup:
- keep this public repo as the Pages/deploy repo
- keep unpublished corpus + curator files in the sibling private repo `../homonym-game-private/`
- add a GitHub Actions secret named `PRIVATE_REPO_SSH_KEY` containing a read-only deploy key for the private repo
- the included Pages workflow will generate `today.js` during deployment
- share the published root URL for the daily page

Because the app is still static, GitHub Pages is the lowest-friction choice for initial user testing.

## Verification

Run the current tests:
- `node --test tests/game-core.test.js`

## Near-term goals

- expand and tighten the reviewed puzzle corpus
- tune answer validation and hint policy
- improve completion/share states
- decide daily-distribution format
- prepare lightweight user testing
