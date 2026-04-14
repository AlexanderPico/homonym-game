const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeGuess,
  isCorrectGuess,
  getPuzzleProgressLabel,
  getAcceptedAnswers,
  getGuessShape,
  getGuessResult,
  buildShareGlyph,
  getDailyPuzzleIndex,
  getAppMode,
} = require('../packages/game-core/index.js');

test('normalizeGuess lowercases and collapses punctuation-like separators', () => {
  assert.equal(normalizeGuess('  Vile   Vial  '), 'vile vial');
  assert.equal(normalizeGuess('Idle-Idol'), 'idle idol');
  assert.equal(normalizeGuess('Crook,   Crook!'), 'crook crook');
});

test('getAcceptedAnswers derives the canonical answer from answerWords when present', () => {
  const puzzle = {
    displayAnswer: 'display only',
    answerWords: ['vile', 'vial'],
    aliases: ['vile-vial'],
  };

  assert.deepEqual(getAcceptedAnswers(puzzle), ['vile vial', 'vile-vial']);
});

test('isCorrectGuess accepts canonical answers and aliases after normalization', () => {
  const puzzle = {
    displayAnswer: 'vile vial',
    answerWords: ['vile', 'vial'],
    aliases: ['vile-vial'],
  };

  assert.equal(isCorrectGuess(puzzle, 'Vile Vial'), true);
  assert.equal(isCorrectGuess(puzzle, 'vile-vial'), true);
  assert.equal(isCorrectGuess(puzzle, 'idle idol'), false);
});

test('getGuessShape distinguishes empty one-word two-word and longer guesses', () => {
  assert.equal(getGuessShape(''), 'empty');
  assert.equal(getGuessShape('vile'), 'one-word');
  assert.equal(getGuessShape('vile vial'), 'two-word');
  assert.equal(getGuessShape('the vile vial'), 'longer');
});

test('getGuessResult marks exact, close typo, and miss distinctly', () => {
  const puzzle = {
    displayAnswer: 'vile vial',
    answerWords: ['vile', 'vial'],
    aliases: ['vile-vial'],
  };

  assert.equal(getGuessResult(puzzle, 'vile vial'), 'exact');
  assert.equal(getGuessResult(puzzle, 'vile vail'), 'close');
  assert.equal(getGuessResult(puzzle, 'idle idol'), 'miss');
});

test('buildShareGlyph summarizes three-attempt runs without spoilers', () => {
  assert.equal(buildShareGlyph(['miss', 'close', 'exact'], 3), '◇◈◆');
  assert.equal(buildShareGlyph(['miss', 'miss'], 3), '◇◇—');
  assert.equal(buildShareGlyph(['close', 'miss', 'miss'], 3), '◈◇◇');
});

test('getDailyPuzzleIndex is deterministic and stays in range', () => {
  assert.equal(getDailyPuzzleIndex('2026-04-14', 40), getDailyPuzzleIndex('2026-04-14', 40));
  assert.equal(getDailyPuzzleIndex('2026-04-15', 40), 7);
  assert.ok(getDailyPuzzleIndex('2026-04-14', 40) >= 0);
  assert.ok(getDailyPuzzleIndex('2026-04-14', 40) < 40);
});

test('getAppMode distinguishes admin and daily routes', () => {
  assert.equal(getAppMode('/'), 'daily');
  assert.equal(getAppMode('/index.html'), 'daily');
  assert.equal(getAppMode('/admin'), 'admin');
  assert.equal(getAppMode('/admin/'), 'admin');
  assert.equal(getAppMode('/admin/index.html'), 'admin');
});

test('getPuzzleProgressLabel reports current position for demo next flow', () => {
  assert.equal(getPuzzleProgressLabel(0, 3), 'Puzzle 1 of 3');
  assert.equal(getPuzzleProgressLabel(2, 3), 'Puzzle 3 of 3');
});
