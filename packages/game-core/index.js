(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.HomonymGameCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizeGuess(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function getCanonicalAnswer(puzzle) {
    if (Array.isArray(puzzle.answerWords) && puzzle.answerWords.length) {
      return puzzle.answerWords.join(' ');
    }

    return puzzle.displayAnswer || '';
  }

  function getAcceptedAnswers(puzzle) {
    const canonical = getCanonicalAnswer(puzzle);
    const aliases = Array.isArray(puzzle.aliases) ? puzzle.aliases : [];
    return [canonical].concat(aliases).filter(Boolean);
  }

  function levenshteinDistance(a, b) {
    const left = normalizeGuess(a);
    const right = normalizeGuess(b);
    const rows = left.length + 1;
    const cols = right.length + 1;
    const table = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < rows; i += 1) {
      table[i][0] = i;
    }
    for (let j = 0; j < cols; j += 1) {
      table[0][j] = j;
    }

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = left[i - 1] === right[j - 1] ? 0 : 1;
        table[i][j] = Math.min(
          table[i - 1][j] + 1,
          table[i][j - 1] + 1,
          table[i - 1][j - 1] + cost,
        );

        if (
          i > 1 &&
          j > 1 &&
          left[i - 1] === right[j - 2] &&
          left[i - 2] === right[j - 1]
        ) {
          table[i][j] = Math.min(table[i][j], table[i - 2][j - 2] + 1);
        }
      }
    }

    return table[rows - 1][cols - 1];
  }

  function isCorrectGuess(puzzle, guess) {
    const normalizedGuess = normalizeGuess(guess);
    if (!normalizedGuess) {
      return false;
    }

    return getAcceptedAnswers(puzzle).map(normalizeGuess).includes(normalizedGuess);
  }

  function getGuessResult(puzzle, guess) {
    const normalizedGuess = normalizeGuess(guess);
    if (!normalizedGuess) {
      return 'miss';
    }

    const accepted = getAcceptedAnswers(puzzle).map(normalizeGuess);
    if (accepted.includes(normalizedGuess)) {
      return 'exact';
    }

    const isClose = accepted.some((answer) => levenshteinDistance(answer, normalizedGuess) === 1);
    return isClose ? 'close' : 'miss';
  }

  function getGuessShape(guess) {
    const normalizedGuess = normalizeGuess(guess);
    if (!normalizedGuess) {
      return 'empty';
    }

    const wordCount = normalizedGuess.split(' ').length;
    if (wordCount === 1) {
      return 'one-word';
    }
    if (wordCount === 2) {
      return 'two-word';
    }
    return 'longer';
  }

  function getPuzzleProgressLabel(index, total) {
    return `Puzzle ${index + 1} of ${total}`;
  }

  function buildShareGlyph(results, maxAttempts) {
    const glyphs = {
      exact: '◆',
      close: '◈',
      miss: '◇',
      unused: '—',
    };

    const filled = results.slice(0, maxAttempts).map((result) => glyphs[result] || glyphs.miss);
    while (filled.length < maxAttempts) {
      filled.push(glyphs.unused);
    }
    return filled.join('');
  }

  return {
    normalizeGuess,
    getCanonicalAnswer,
    getAcceptedAnswers,
    levenshteinDistance,
    isCorrectGuess,
    getGuessResult,
    getGuessShape,
    getPuzzleProgressLabel,
    buildShareGlyph,
  };
});
