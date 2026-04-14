# Content and Puzzle Notes

## Working definition

A Homonym Game puzzle contains:
- a clue
- a two-word answer
- an explanation of why each word fits
- optional metadata for editorial use

## Early editorial rules

1. The answer should sound natural when spoken.
2. The answer should preferably be a legitimate phrase, not just repeated sound coincidence.
3. The clue should point to both words fairly.
4. Never use an answer word, obvious inflection, or trivially recycled form of the answer inside the clue.
5. The joke should survive first contact — payoff matters.
6. Avoid clues whose solution space is too broad without strong anchoring.

## Current prototype schema

```js
{
  id: 'starter-001',
  clue: 'loathsome test tube',
  displayAnswer: 'vile vial',
  answerWords: ['vile', 'vial'],
  aliases: ['vile-vial'],
  explanation: [
    'vile = loathsome',
    'vial = test tube / small bottle'
  ],
  difficulty: 'easy',
  status: 'reviewed',
  notes: 'Clean adjective + noun phrase with a sharp sound-pair payoff.'
}
```

## Current files

- `starter-puzzles.js` — the original 3-puzzle seed corpus
- `draft-20.js` — the active 20-candidate corpus now wired into the prototype demo

## Starter set

1. loathsome test tube -> vile vial
2. lazy golden calf -> idle idol
3. thief of shepherd's tools -> crook crook

## First 20-candidate batch

Strong early shortlist:
- vile vial
- idle idol
- mourning morning
- sole soul
- minor miner
- allowed aloud
- flower flour
- pair pear

Potentially usable with more wording work:
- dear deer
- weak week
- serial cereal
- principal principle
- waist waste
- male mail
- sight site
- knight night
- aisle isle
- naval navel
- plain plane

Riskier / boundary-case entries:
- crook crook

## Open content questions

- Should repeated-sound answers like `crook crook` be common, rare, or excluded?
- Should every answer be adjective + noun, or can we allow other phrase types?
- Should clues stay compact and noun-phrase-like, or sometimes become sentence fragments?
- What makes a puzzle feel elegant versus merely admissible?

## Long-term content pipeline

Possible stages:
- brainstorm answer phrase
- draft clue
- test ambiguity
- assign difficulty
- editorial approval
- place in daily queue

## Near-term authoring need

Next editorial pass:
- cut weak or redundant entries from the first 20
- improve clue wording for the mid-tier candidates
- promote 7-10 strongest entries into the polished demo queue
- keep aliases rare and intentional
- mark puzzles clearly as `prototype`, `reviewed`, or `published`

Latest pass applied:
- removed direct answer-word leakage from flagged clues
- tightened several overly easy or overly abstract clues
- corrected the `flower flour` baking explanation
- reclassified `naval navel` and `plain plane` as mid-tier rather than shortlist-level
