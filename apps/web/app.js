const {
  getPuzzleProgressLabel,
  getGuessShape,
  getGuessResult,
  buildShareGlyph,
  getAppMode,
  getPuzzleSetForMode,
} = globalThis.HomonymGameCore || {};

const appMode = getAppMode ? getAppMode(window.location.pathname) : 'daily';
const puzzles = getPuzzleSetForMode
  ? getPuzzleSetForMode(appMode, {
      publicPuzzle: globalThis.HOMONYM_TODAY_PUZZLE || null,
      privateCorpus: Array.isArray(globalThis.HOMONYM_DRAFT_PUZZLES) ? globalThis.HOMONYM_DRAFT_PUZZLES : [],
    })
  : [];
const difficultyBadge = document.getElementById('difficulty-badge');
const clueText = document.getElementById('puzzle-title');
const statusText = document.getElementById('status-text');
const guessForm = document.getElementById('guess-form');
const guessInput = document.getElementById('guess-input');
const checkButton = document.getElementById('check-button');
const revealButton = document.getElementById('reveal-button');
const nextButton = document.getElementById('next-button');
const resultPanel = document.getElementById('result-panel');
const answerText = document.getElementById('answer-text');
const explanationList = document.getElementById('explanation-list');
const notesText = document.getElementById('notes-text');
const attemptSummary = document.getElementById('attempt-summary');
const attemptGlyphs = document.getElementById('attempt-glyphs');
const sharePanel = document.getElementById('share-panel');
const shareCaption = document.getElementById('share-caption');
const shareText = document.getElementById('share-text');
const copyShareButton = document.getElementById('copy-share-button');

const MAX_ATTEMPTS = 3;

const progressPill = document.getElementById('progress-pill');
let currentIndex = 0;
let solvedCurrentPuzzle = false;
let revealedCurrentPuzzle = false;
let attemptResults = [];

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function titleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function renderExplanation(lines) {
  explanationList.replaceChildren();

  lines.forEach((line) => {
    const li = document.createElement('li');
    li.textContent = line;
    explanationList.appendChild(li);
  });
}

function lockPuzzleInteraction() {
  guessInput.disabled = true;
  checkButton.disabled = true;
  revealButton.disabled = true;
}

function unlockPuzzleInteraction() {
  guessInput.disabled = false;
  checkButton.disabled = false;
  revealButton.disabled = false;
}

function setStatus(message, tone) {
  statusText.textContent = message;
  statusText.dataset.tone = tone || 'neutral';
}

function renderSharePanel(outcomeLabel) {
  const glyphLine = buildShareGlyph(attemptResults, MAX_ATTEMPTS);
  const header =
    appMode === 'admin'
      ? `Homonym Game Admin ${currentIndex + 1}/${puzzles.length}`
      : `Homonym Game ${getLocalDateString()}`;
  shareCaption.textContent = outcomeLabel;
  shareText.textContent = `${header}\n${glyphLine}`;
  sharePanel.hidden = false;
}

function hideSharePanel() {
  sharePanel.hidden = true;
  shareCaption.textContent = 'Spoiler-safe summary';
  shareText.textContent = '';
  copyShareButton.textContent = 'Copy glyphs';
}

function showAnswer(puzzle, mode) {
  resultPanel.hidden = false;
  answerText.textContent = puzzle.displayAnswer;
  renderExplanation(puzzle.explanation);
  notesText.textContent =
    mode === 'solved'
      ? 'Solved. The clue and phrase now line up cleanly.'
      : mode === 'failed'
        ? 'Out of guesses. Here is the answer and why it works.'
        : puzzle.notes || 'Revealed for review.';
}

function updateAttemptUi() {
  const remaining = MAX_ATTEMPTS - attemptResults.length;
  attemptSummary.textContent = `${remaining} guess${remaining === 1 ? '' : 'es'} left`;
  const glyphMap = {
    exact: '◆',
    close: '◈',
    miss: '◇',
    unused: '—',
  };
  const cells = attemptResults.slice(0, MAX_ATTEMPTS).map((result) => glyphMap[result] || glyphMap.miss);
  while (cells.length < MAX_ATTEMPTS) {
    cells.push(glyphMap.unused);
  }
  attemptGlyphs.textContent = cells.join(' ');
}

function updateModeChrome() {
  if (appMode === 'admin') {
    progressPill.textContent = getPuzzleProgressLabel(currentIndex, puzzles.length);
    if (nextButton) {
      nextButton.hidden = false;
      nextButton.disabled = false;
    }
    return;
  }

  progressPill.textContent = 'Daily puzzle';
  if (nextButton) {
    nextButton.hidden = true;
  }
}

function loadPuzzle(index) {
  const puzzle = puzzles[index];
  if (!puzzle) {
    clueText.textContent = 'No puzzle loaded';
    setStatus('Puzzle data is missing.', 'error');
    guessInput.disabled = true;
    checkButton.disabled = true;
    revealButton.disabled = true;
    if (nextButton) {
      nextButton.disabled = true;
    }
    return;
  }

  currentIndex = index;
  solvedCurrentPuzzle = false;
  revealedCurrentPuzzle = false;
  attemptResults = [];
  updateModeChrome();
  difficultyBadge.textContent = titleCase(puzzle.difficulty || 'prototype');
  clueText.textContent = puzzle.clue;
  guessInput.value = '';
  unlockPuzzleInteraction();
  guessInput.focus();
  resultPanel.hidden = true;
  hideSharePanel();
  updateAttemptUi();
  setStatus('Type your best guess.', 'neutral');
}

function closePuzzleWithAnswer(puzzle, mode, statusMessage, tone, shareCaptionText) {
  revealedCurrentPuzzle = true;
  if (mode === 'solved') {
    solvedCurrentPuzzle = true;
  }
  showAnswer(puzzle, mode);
  lockPuzzleInteraction();
  setStatus(statusMessage, tone);
  renderSharePanel(shareCaptionText);
}

async function copyShareSummary() {
  const text = shareText.textContent;
  if (!text) {
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      copyShareButton.textContent = 'Copied';
      return;
    }
  } catch (error) {
    // fallback below
  }

  const range = document.createRange();
  range.selectNodeContents(shareText);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  copyShareButton.textContent = 'Copied';
}

function handleGuessSubmit(event) {
  event.preventDefault();
  const puzzle = puzzles[currentIndex];
  const guess = guessInput.value;

  if (solvedCurrentPuzzle || revealedCurrentPuzzle) {
    setStatus(appMode === 'admin' ? 'This puzzle is closed. Tap Next puzzle to continue.' : 'Today\'s puzzle is closed. Come back tomorrow or share your result.', 'neutral');
    return;
  }

  if (!guess.trim()) {
    setStatus('Enter a two-word guess first.', 'error');
    guessInput.focus();
    return;
  }

  const guessShape = getGuessShape(guess);
  if (guessShape === 'one-word') {
    setStatus('Try a two-word phrase.', 'error');
    guessInput.focus();
    return;
  }

  if (guessShape === 'longer') {
    setStatus('Keep it to a tight two-word phrase.', 'error');
    guessInput.focus();
    return;
  }

  if (attemptResults.length >= MAX_ATTEMPTS) {
    setStatus(appMode === 'admin' ? 'No guesses left. Tap Next puzzle to continue.' : 'No guesses left for today. Share your result or come back tomorrow.', 'neutral');
    return;
  }

  const result = getGuessResult(puzzle, guess);
  attemptResults.push(result);
  updateAttemptUi();

  if (result === 'exact') {
    closePuzzleWithAnswer(
      puzzle,
      'solved',
      `Correct. Nicely landed in ${attemptResults.length}/3.`,
      'success',
      `Solved in ${attemptResults.length}/3`,
    );
    return;
  }

  if (result === 'close') {
    if (attemptResults.length >= MAX_ATTEMPTS) {
      closePuzzleWithAnswer(
        puzzle,
        'failed',
        'That was extremely close, but you are out of guesses.',
        'error',
        'Almost solved — out of guesses',
      );
      return;
    }

    setStatus('Very close — this looks like a typo or misspelling away.', 'warning');
    guessInput.focus();
    guessInput.select();
    return;
  }

  if (attemptResults.length >= MAX_ATTEMPTS) {
    closePuzzleWithAnswer(
      puzzle,
      'failed',
      'Three guesses used. Answer revealed below.',
      'error',
      'Missed after 3/3',
    );
    return;
  }

  setStatus(`Not quite. ${MAX_ATTEMPTS - attemptResults.length} guesses left.`, 'error');
  guessInput.focus();
  guessInput.select();
}

function handleReveal() {
  const puzzle = puzzles[currentIndex];
  closePuzzleWithAnswer(
    puzzle,
    'revealed',
    appMode === 'admin' ? 'Answer revealed. Use Next puzzle to keep demoing the loop.' : 'Answer revealed. Share your result or come back tomorrow for the next daily clue.',
    'neutral',
    'Revealed',
  );
}

function handleNextPuzzle() {
  if (appMode !== 'admin') {
    return;
  }
  const nextIndex = (currentIndex + 1) % puzzles.length;
  loadPuzzle(nextIndex);
}

function getInitialPuzzleIndex() {
  return 0;
}

if (!puzzles.length || !getPuzzleProgressLabel || !getGuessShape || !getGuessResult || !buildShareGlyph || !getAppMode || !getPuzzleSetForMode) {
  clueText.textContent = 'Setup incomplete';
  setStatus('Puzzle data or game logic failed to load.', 'error');
  guessInput.disabled = true;
  checkButton.disabled = true;
  revealButton.disabled = true;
  if (nextButton) {
    nextButton.disabled = true;
  }
} else {
  guessForm.addEventListener('submit', handleGuessSubmit);
  revealButton.addEventListener('click', handleReveal);
  if (nextButton) {
    nextButton.addEventListener('click', handleNextPuzzle);
  }
  copyShareButton.addEventListener('click', copyShareSummary);
  loadPuzzle(getInitialPuzzleIndex());
}
