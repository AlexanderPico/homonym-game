# Interaction Design Notes

## Core mechanic

A clue describes a phrase whose solution is a pair of homonyms or homophone-adjacent words.

The player experience should feel like:
1. read a compact clue
2. form a mental image of two linked meanings
3. type the phrase that sounds right
4. feel a clean payoff when the answer clicks

## Prototype interaction choice

For the current prototype, split the experience into two routes:
- `/` shows one generated public daily puzzle
- local `/admin/` preserves sequential private corpus browsing
- both routes use typed guesses and the same answer-checking rules
- both routes keep reveal as an escape hatch
- only local `/admin/` exposes `Next puzzle`

Reason:
- public users should experience a true daily ritual rather than a browsing demo
- curator/admin needs are different from player needs
- the admin route preserves the current high-value editorial workflow
- shared guess logic keeps the product behavior consistent across both views

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

Public `/` page:
- title
- short mechanic description
- single daily clue card
- attempts / share state

Admin `/admin/` page:
- title
- curator framing copy
- progress context across the full corpus
- single clue card with `Next puzzle`

Shared game section:
- text input
- check / reveal actions
- answer explanation after solve or reveal
- share glyph panel after puzzle closure

## Success criteria for this prototype

- a first-time player understands the mechanic within 30 seconds
- clues feel witty rather than opaque
- typed entry feels worth doing
- reveal fallback reduces frustration without undermining the solve loop
- page works comfortably on a phone without zooming
