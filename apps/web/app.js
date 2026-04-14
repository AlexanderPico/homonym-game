const puzzles = Array.isArray(globalThis.HOMONYM_DRAFT_PUZZLES)
  ? globalThis.HOMONYM_DRAFT_PUZZLES
  : Array.isArray(globalThis.HOMONYM_PUZZLES)
    ? globalThis.HOMONYM_PUZZLES
    : [];
const { isCorrectGuess, getPuzzleProgressLabel, getGuessShape } = globalThis.HomonymGameCore || {};

const progressPill = document.getElementById('progress-pill');
const difficultyBadge = document.getElementById('difficulty-badge');
const clueText = document.getElementById('puzzle-title');
const statusText = document.getElementById('status-text');
const guessForm = document.getElementById('guess-form');
const guessInput = document.getElementById('guess-input');
const revealButton = document.getElementById('reveal-button');
const nextButton = document.getElementById('next-button');
const resultPanel = document.getElementById('result-panel');
const answerText = document.getElementById('answer-text');
const explanationList = document.getElementById('explanation-list');
const notesText = document.getElementById('notes-text');

let currentIndex = 0;
let solvedCurrentPuzzle = false;
let revealedCurrentPuzzle = false;

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
  revealButton.disabled = true;
}

function unlockPuzzleInteraction() {
  guessInput.disabled = false;
  revealButton.disabled = false;
}

function showAnswer(puzzle, mode) {
  resultPanel.hidden = false;
  answerText.textContent = puzzle.displayAnswer;
  renderExplanation(puzzle.explanation);
  notesText.textContent =
    mode === 'solved'
      ? 'Solved. The clue and phrase now line up cleanly.'
      : puzzle.notes || 'Revealed for review.';
}

function setStatus(message, tone) {
  statusText.textContent = message;
  statusText.dataset.tone = tone || 'neutral';
}

function loadPuzzle(index) {
  const puzzle = puzzles[index];
  if (!puzzle) {
    clueText.textContent = 'No puzzle loaded';
    setStatus('Puzzle data is missing.', 'error');
    guessInput.disabled = true;
    revealButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  currentIndex = index;
  solvedCurrentPuzzle = false;
  revealedCurrentPuzzle = false;
  progressPill.textContent = getPuzzleProgressLabel(index, puzzles.length);
  difficultyBadge.textContent = titleCase(puzzle.difficulty || 'prototype');
  clueText.textContent = puzzle.clue;
  guessInput.value = '';
  unlockPuzzleInteraction();
  guessInput.focus();
  revealButton.disabled = false;
  nextButton.disabled = false;
  resultPanel.hidden = true;
  setStatus('Type your best guess.', 'neutral');
}

function handleGuessSubmit(event) {
  event.preventDefault();
  const puzzle = puzzles[currentIndex];
  const guess = guessInput.value;

  if (solvedCurrentPuzzle || revealedCurrentPuzzle) {
    setStatus('This puzzle is closed. Tap Next puzzle to continue.', 'neutral');
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

  if (isCorrectGuess(puzzle, guess)) {
    solvedCurrentPuzzle = true;
    revealedCurrentPuzzle = true;
    showAnswer(puzzle, 'solved');
    lockPuzzleInteraction();
    setStatus('Correct. Nicely landed.', 'success');
    return;
  }

  setStatus('Not quite. Revise your phrase or reveal the answer.', 'error');
}

function handleReveal() {
  const puzzle = puzzles[currentIndex];
  revealedCurrentPuzzle = true;
  showAnswer(puzzle, solvedCurrentPuzzle ? 'solved' : 'revealed');
  lockPuzzleInteraction();
  if (!solvedCurrentPuzzle) {
    setStatus('Answer revealed. Use Next puzzle to keep demoing the loop.', 'neutral');
  }
}

function handleNextPuzzle() {
  const nextIndex = (currentIndex + 1) % puzzles.length;
  loadPuzzle(nextIndex);
}

if (!puzzles.length || !isCorrectGuess || !getPuzzleProgressLabel || !getGuessShape) {
  clueText.textContent = 'Setup incomplete';
  setStatus('Puzzle data or game logic failed to load.', 'error');
  guessInput.disabled = true;
  revealButton.disabled = true;
  nextButton.disabled = true;
} else {
  guessForm.addEventListener('submit', handleGuessSubmit);
  revealButton.addEventListener('click', handleReveal);
  nextButton.addEventListener('click', handleNextPuzzle);
  loadPuzzle(0);
}
