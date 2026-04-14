# Homonym Game

A wordplay game prototype for clueing homonym pairs that resolve into a valid phrase.

Initial concept:
- clue a two-word answer made of homonyms
- answers should ideally form a legitimate phrase on their own
- tone and polish should support eventual daily distribution in the style of NYT mini word games

Examples:
- loathsome test tube -> vile vial
- lazy golden calf -> idle idol
- thief of shepherd's tools -> crook crook

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

Open this file in a browser:
- `apps/web/index.html`

No build step is required for the current prototype.

Current demo behavior:
- one featured puzzle at a time
- typed guesses with no answer-revealing placeholder text
- typo-aware near-match feedback for guesses that are one misspelling away
- three-guess limit per puzzle
- spoiler-safe share glyph summary after solve, fail, or reveal
- `Next puzzle` rotates through the full 20-puzzle draft set
- editorial styling aimed at a polished daily-game feel

## Current content state

- `content/puzzles/starter-puzzles.js` preserves the original 3-puzzle seed set
- `content/puzzles/draft-20.js` is now the active 20-puzzle corpus for the demo
- `docs/content-notes.md` tracks the current shortlist and open content questions

## Verification

Run the current tests:
- `node --test tests/game-core.test.js`

## Near-term goals

- expand and tighten the reviewed puzzle corpus
- tune answer validation and hint policy
- improve completion/share states
- decide daily-distribution format
- prepare lightweight user testing
