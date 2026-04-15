# Homonym Game Roadmap

## Product direction

Homonym Game is a short-form word puzzle built around clues that resolve into a two-word homonym answer. The answer should ideally be both:
- a satisfying decode of the clue
- a legitimate phrase in ordinary English

Current direction:
- `/` is the public English daily puzzle page and should only receive one generated puzzle payload at a time
- `/jp/` is the public Japanese daily puzzle page and should only receive one generated puzzle payload at a time
- local `/admin/` is the English curator browse-and-review page
- local `/jp/admin/` is the Japanese curator browse-and-review page
- typed guesses as the default interaction
- daily selection comes from private curated corpora and is exported into single public payloads
- mobile-first
- visually restrained, editorial, and shareable

## Phase 0 — single-puzzle prototype

Goal:
- prove that the typed solve loop is legible, fair, and satisfying in a tiny browser demo

Deliverables:
- simple mobile-friendly public daily page
- single featured clue selected by date and exported into a public payload
- separate local `/admin/` curator page with sequential browsing
- typed answer checking
- typo-aware near-match feedback
- three-guess limit with spoiler-safe share glyphs
- basic explanation of the mechanic

Questions to answer:
- do players understand the expected answer shape immediately?
- does typed entry feel satisfying without becoming frustrating?
- does reveal belong as a permanent affordance or only onboarding scaffolding?
- which clues are delightful, fair, and specific enough to survive daily play?

## Phase 1 — interaction refinement

Goal:
- tune the core player loop until it feels inevitable

Primary interaction model:
1. Read the clue.
2. Type a two-word answer.
3. Check the guess.
4. If you are one typo away, get a near-match warning instead of a generic miss.
5. Solve within three guesses, or reveal only if stuck.
6. Share a spoiler-safe glyph summary.
7. Move to the next demo puzzle.

Design concerns:
- mobile thumb ergonomics
- clue readability at a glance
- preserving delight without making onboarding confusing
- making failure feel playful, not punishing
- clear solved state and onward motion

## Phase 2 — content system

Goal:
- build a strong puzzle corpus and a lightweight authoring workflow

Needs:
- puzzle schema
- answer validation rules
- difficulty tags
- editorial notes for fairness and ambiguity
- reviewed starter corpus
- later themed packs and daily queue candidates

Editorial principle:
- phrase quality matters as much as clue cleverness

## Phase 3 — daily distribution

Goal:
- ship a daily-play format with archive and sharing

Likely requirements:
- canonical puzzle ID per date
- timezone policy for rollover
- spoiler-safe share card or emoji summary
- archive page
- analytics for completion and reveal rate
- optional leaderboard or friend-group sharing later

## Phase 4 — user testing

Goal:
- validate comprehension, delight, retention, and sharing behavior

Initial user-testing plan:
- 5-10 testers on phones
- record time to first understanding
- record whether they infer answer format without explanation
- measure solve rate versus reveal rate
- collect examples of ambiguous or low-payoff clues

## Current recommendation

Start with a tiny but polished slice:
- one puzzle visible at a time
- 7-10 reviewed puzzles later, but only 3 in the first demo
- typed guesses first
- no accounts, backend, or scoring yet
- editorial visual identity from day one
