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
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
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

  function getDailyPuzzleIndex(dateString, total) {
    if (!total || total < 1) {
      return 0;
    }

    const match = String(dateString || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return 0;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const utcMillis = Date.UTC(year, month - 1, day);
    const ordinal = Math.floor(utcMillis / 86400000);
    return (ordinal + 9) % total;
  }

  function getRouteConfig(pathname) {
    const normalized = String(pathname || '/').replace(/\/+$/, '') || '/';
    const parts = normalized.split('/').filter(Boolean);
    const locale = parts.includes('jp') ? 'jp' : 'en';
    const lastPart = parts[parts.length - 1] || '';
    const mode = lastPart === 'admin' || parts.includes('admin') ? 'admin' : 'daily';
    return { locale, mode };
  }

  function getAppMode(pathname) {
    return getRouteConfig(pathname).mode;
  }

  function getPuzzleSetForMode(route, sources) {
    const locale = route?.locale || 'en';
    const mode = route?.mode || 'daily';
    const privateCorpusByLocale = sources?.privateCorpusByLocale || {};
    const publicPuzzleByLocale = sources?.publicPuzzleByLocale || {};
    const privateCorpus = Array.isArray(privateCorpusByLocale[locale]) ? privateCorpusByLocale[locale] : [];
    const publicPuzzle = publicPuzzleByLocale[locale] || null;

    if (mode === 'admin') {
      return privateCorpus;
    }

    return publicPuzzle ? [publicPuzzle] : [];
  }

  function getRotatedPuzzleIndex(dateString, total, offset = 0) {
    if (!total || total < 1) {
      return 0;
    }
    const base = getDailyPuzzleIndex(dateString, total);
    const normalizedOffset = Number.isFinite(offset) ? offset : 0;
    return (base + normalizedOffset + total) % total;
  }

  function selectPublicPuzzle(corpus, dateString, publishConfig) {
    if (!Array.isArray(corpus) || !corpus.length) {
      return null;
    }

    const offset = publishConfig && Number.isFinite(publishConfig.offset) ? publishConfig.offset : 0;
    return corpus[getRotatedPuzzleIndex(dateString, corpus.length, offset)] || null;
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
    getDailyPuzzleIndex,
    getRouteConfig,
    getAppMode,
    getPuzzleSetForMode,
    getRotatedPuzzleIndex,
    selectPublicPuzzle,
    buildShareGlyph,
  };
});
