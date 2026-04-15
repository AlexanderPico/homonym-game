# Content and Puzzle Notes

## Working definition

A Homonym Game puzzle contains:
- a clue
- a two-word answer
- an explanation of why each word fits
- optional metadata for editorial use

## Public repo policy

This public repo must not contain the active unpublished puzzle corpus.

That means:
- no full draft corpus files committed publicly
- no admin browser page committed publicly
- no docs that enumerate unpublished clue/answer pairs
- only a generated one-puzzle public payload may be used for deployment, and that payload should stay out of git as well
- unpublished corpus and curator-only files should live outside this public repo
- local source checkout hints belong in ignored local notes or ignored flatfiles only

## Early editorial rules

1. The answer should sound natural when spoken.
2. The answer should preferably be a legitimate phrase, not just repeated sound coincidence.
3. The clue should point to both words fairly.
4. Never use an answer word, obvious inflection, or trivially recycled form of the answer inside the clue.
5. The joke should survive first contact — payoff matters.
6. Avoid clues whose solution space is too broad without strong anchoring.

## Current file roles

- unpublished corpus and curator-only assets — keep outside this public repo
- `apps/web/data/today.js` — generated single-puzzle public payload, ignored by git
- `content/puzzles/README.md` — non-sensitive notes about puzzle file roles

## Current prototype schema

```js
{
  id: 'draft-001',
  clue: '...',
  displayAnswer: '...',
  answerWords: ['...', '...'],
  aliases: [],
  explanation: ['...', '...'],
  difficulty: 'easy|medium|hard',
  status: 'draft|reviewed|published',
  notes: 'editorial notes'
}
```

## Difficulty policy

- `easy` — familiar words, high clue clarity, likely solvable quickly
- `medium` — slightly less obvious spelling or more indirect clueing
- `hard` — irregular spelling, abstract clueing, or editorial edge cases

## Near-term authoring need

Next editorial pass:
- keep expanding the private corpus locally
- promote only reviewed daily picks into the generated public payload
- keep aliases rare and intentional
- mark puzzles clearly as `prototype`, `reviewed`, or `published`
- avoid putting raw unpublished examples into public docs
