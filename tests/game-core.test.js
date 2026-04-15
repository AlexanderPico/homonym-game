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
  getRouteConfig,
  getPuzzleSetForMode,
  selectPublicPuzzle,
  getRotatedPuzzleIndex,
} = require('../packages/game-core/index.js');

test('normalizeGuess lowercases and collapses punctuation-like separators', () => {
  assert.equal(normalizeGuess('  Sample   Token  '), 'sample token');
  assert.equal(normalizeGuess('Sample-Token'), 'sample token');
  assert.equal(normalizeGuess('Sample,   Token!'), 'sample token');
  assert.equal(normalizeGuess('  記者  汽車  '), '記者 汽車');
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

test('getRouteConfig distinguishes locale and mode', () => {
  assert.deepEqual(getRouteConfig('/'), { locale: 'en', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/index.html'), { locale: 'en', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/admin'), { locale: 'en', mode: 'admin' });
  assert.deepEqual(getRouteConfig('/jp'), { locale: 'jp', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/jp/'), { locale: 'jp', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/jp/index.html'), { locale: 'jp', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/jp/admin'), { locale: 'jp', mode: 'admin' });
  assert.deepEqual(getRouteConfig('/jp/admin/index.html'), { locale: 'jp', mode: 'admin' });
  assert.deepEqual(getRouteConfig('/homonym-game/'), { locale: 'en', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/homonym-game/index.html'), { locale: 'en', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/homonym-game/jp/'), { locale: 'jp', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/homonym-game/jp/index.html'), { locale: 'jp', mode: 'daily' });
  assert.deepEqual(getRouteConfig('/homonym-game/admin/'), { locale: 'en', mode: 'admin' });
  assert.deepEqual(getRouteConfig('/homonym-game/jp/admin/'), { locale: 'jp', mode: 'admin' });
});

test('getPuzzleSetForMode uses locale-specific public puzzle for daily mode and locale corpus for admin', () => {
  const privateCorpusByLocale = {
    en: [{ id: 'en-1' }],
    jp: [{ id: 'jp-1' }, { id: 'jp-2' }],
  };
  const publicPuzzleByLocale = {
    en: { id: 'public-en' },
    jp: { id: 'public-jp' },
  };

  assert.deepEqual(getPuzzleSetForMode({ locale: 'en', mode: 'daily' }, { publicPuzzleByLocale, privateCorpusByLocale }), [{ id: 'public-en' }]);
  assert.deepEqual(getPuzzleSetForMode({ locale: 'jp', mode: 'daily' }, { publicPuzzleByLocale, privateCorpusByLocale }), [{ id: 'public-jp' }]);
  assert.deepEqual(getPuzzleSetForMode({ locale: 'jp', mode: 'admin' }, { publicPuzzleByLocale, privateCorpusByLocale }), [{ id: 'jp-1' }, { id: 'jp-2' }]);
});

test('selectPublicPuzzle uses manual offset on top of daily auto rotation', () => {
  const corpus = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  assert.equal(getRotatedPuzzleIndex('2026-04-14', 4, 0), getDailyPuzzleIndex('2026-04-14', 4));
  assert.equal(getRotatedPuzzleIndex('2026-04-14', 4, 1), (getDailyPuzzleIndex('2026-04-14', 4) + 1) % 4);
  assert.deepEqual(selectPublicPuzzle(corpus, '2026-04-14', { offset: 1 }), corpus[(getDailyPuzzleIndex('2026-04-14', 4) + 1) % 4]);
  assert.deepEqual(selectPublicPuzzle(corpus, '2026-04-15', { offset: 1 }), corpus[(getDailyPuzzleIndex('2026-04-15', 4) + 1) % 4]);
});

test('getPuzzleProgressLabel reports current position for demo next flow', () => {
  assert.equal(getPuzzleProgressLabel(0, 3), 'Puzzle 1 of 3');
  assert.equal(getPuzzleProgressLabel(2, 3), 'Puzzle 3 of 3');
});
