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
  getPuzzleSetForMode,
  selectPublicPuzzle,
} = require('../packages/game-core/index.js');

test('normalizeGuess lowercases and collapses punctuation-like separators', () => {
  assert.equal(normalizeGuess('  Sample   Token  '), 'sample token');
  assert.equal(normalizeGuess('Sample-Token'), 'sample token');
  assert.equal(normalizeGuess('Sample,   Token!'), 'sample token');
});

test('getAcceptedAnswers derives the canonical answer from answerWords when present', () => {
  const puzzle = {
    displayAnswer: 'display only',
    answerWords: ['sample', 'token'],
    aliases: ['sample-token'],
  };

  assert.deepEqual(getAcceptedAnswers(puzzle), ['sample token', 'sample-token']);
});

test('isCorrectGuess accepts canonical answers and aliases after normalization', () => {
  const puzzle = {
    displayAnswer: 'sample token',
    answerWords: ['sample', 'token'],
    aliases: ['sample-token'],
  };

  assert.equal(isCorrectGuess(puzzle, 'Sample Token'), true);
  assert.equal(isCorrectGuess(puzzle, 'sample-token'), true);
  assert.equal(isCorrectGuess(puzzle, 'random phrase'), false);
});

test('getGuessShape distinguishes empty one-word two-word and longer guesses', () => {
  assert.equal(getGuessShape(''), 'empty');
  assert.equal(getGuessShape('sample'), 'one-word');
  assert.equal(getGuessShape('sample token'), 'two-word');
  assert.equal(getGuessShape('the sample token'), 'longer');
});

test('getGuessResult marks exact, close typo, and miss distinctly', () => {
  const puzzle = {
    displayAnswer: 'sample token',
    answerWords: ['sample', 'token'],
    aliases: ['sample-token'],
  };

  assert.equal(getGuessResult(puzzle, 'sample token'), 'exact');
  assert.equal(getGuessResult(puzzle, 'sample tokan'), 'close');
  assert.equal(getGuessResult(puzzle, 'random phrase'), 'miss');
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

test('getPuzzleSetForMode uses only public daily puzzle for daily mode and private corpus for admin', () => {
  const privateCorpus = [{ id: 'private-1' }, { id: 'private-2' }];
  const publicPuzzle = { id: 'public-today' };

  assert.deepEqual(getPuzzleSetForMode('daily', { publicPuzzle, privateCorpus }), [publicPuzzle]);
  assert.deepEqual(getPuzzleSetForMode('admin', { publicPuzzle, privateCorpus }), privateCorpus);
  assert.deepEqual(getPuzzleSetForMode('daily', { publicPuzzle: null, privateCorpus }), []);
});

test('selectPublicPuzzle uses override id when present and falls back to date index otherwise', () => {
  const corpus = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(selectPublicPuzzle(corpus, '2026-04-14', 'b'), { id: 'b' });
  assert.deepEqual(selectPublicPuzzle(corpus, '2026-04-14', 'missing'), corpus[getDailyPuzzleIndex('2026-04-14', 3)]);
});

test('getPuzzleProgressLabel reports current position for demo next flow', () => {
  assert.equal(getPuzzleProgressLabel(0, 3), 'Puzzle 1 of 3');
  assert.equal(getPuzzleProgressLabel(2, 3), 'Puzzle 3 of 3');
});
