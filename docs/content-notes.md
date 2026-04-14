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
- `draft-40.js` — the active 40-candidate corpus now wired into the prototype demo

## Starter set

1. loathsome test tube -> vile vial
2. lazy golden calf -> idle idol
3. thief of shepherd's tools -> crook crook

## Active 40-puzzle draft corpus

Current strongest easy/medium candidates:
- vile vial
- idle idol
- sole soul
- minor miner
- flower flour
- pair pear
- knight night
- steel steal
- cent scent
- yoke yolk
- kernel colonel
- altar alter

Promising but still mid-tier or tone-sensitive:
- mourning morning
- naval navel
- dear deer
- plain plane
- serial cereal
- principal principle
- waist waste
- allowed aloud
- sight site
- aisle isle
- cue queue
- scene seen
- suite sweet
- peak peek
- flew flu
- pause paws

Riskier / boundary-case entries:
- crook crook
- male mail
- berry bury

Hard-mode anchors now in corpus:
- crook crook
- principal principle
- male mail
- kernel colonel
- altar alter
- berry bury

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
- cut weak or redundant entries from the 40
- improve clue wording for the mid-tier candidates
- promote 10-14 strongest entries into the polished demo queue
- keep aliases rare and intentional
- mark puzzles clearly as `prototype`, `reviewed`, or `published`

Latest pass applied:
- expanded the active corpus from 20 to 40 entries
- redistributed difficulty so the set now includes a real hard tier
- removed direct answer-word leakage from flagged clues
- tightened several overly easy or overly abstract clues
- corrected the `flower flour` baking explanation
