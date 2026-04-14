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

  function isCorrectGuess(puzzle, guess) {
    const normalizedGuess = normalizeGuess(guess);
    if (!normalizedGuess) {
      return false;
    }

    return getAcceptedAnswers(puzzle).map(normalizeGuess).includes(normalizedGuess);
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

  return {
    normalizeGuess,
    getCanonicalAnswer,
    getAcceptedAnswers,
    isCorrectGuess,
    getGuessShape,
    getPuzzleProgressLabel,
  };
});
