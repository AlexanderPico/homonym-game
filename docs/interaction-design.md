# Interaction Design Notes

## Core mechanic

A clue describes a phrase whose solution is a pair of homonyms.

Examples:
- loathsome test tube -> vile vial
- lazy golden calf -> idle idol
- thief of shepherd's tools -> crook crook

The player experience should feel like:
1. read a compact clue
2. form a mental image of two linked meanings
3. type the phrase that sounds right
4. feel a clean payoff when the answer clicks

## Prototype interaction choice

For the current prototype, use a single featured puzzle:
- present one clue at a time
- let the player type a guess immediately
- provide a single primary action: Check
- keep Reveal answer as an escape hatch if the player is stuck
- use Next puzzle to simulate tomorrow's puzzle in the demo

Reason:
- closer to the eventual daily product shape
- preserves a stronger sense of solving than reveal-only cards
- lets us learn about answer validation and frustration early

## Mobile UX principles

- large clue text
- one focused puzzle card
- high contrast
- no tiny affordances
- generous tap targets
- visible but restrained progress context
- keyboard flow should feel natural on a phone

## Answer checking principles

- normalize case
- normalize punctuation and hyphenation
- collapse repeated whitespace
- accept a small alias list only when editorially justified
- avoid broad fuzzy matching that could make the game feel sloppy

## Proposed future interaction variants

### Variant A — hint ladder
- hint 1: phrase structure or word class
- hint 2: first letters
- hint 3: reveal

Pros:
- supports a wider audience
- useful for daily retention

Cons:
- more content authoring burden

### Variant B — swipeable daily card
- single featured puzzle per day
- archive below

Pros:
- closest to eventual product behavior

Cons:
- still premature before the content corpus is stronger

## Information architecture for the prototype

Top of page:
- title
- short mechanic description
- lightweight progress context

Main section:
- single clue card
- text input
- check / reveal / next actions
- answer explanation after solve or reveal

Bottom section:
- note about future daily-play direction

## Success criteria for this prototype

- a first-time player understands the mechanic within 30 seconds
- clues feel witty rather than opaque
- typed entry feels worth doing
- reveal fallback reduces frustration without undermining the solve loop
- page works comfortably on a phone without zooming
