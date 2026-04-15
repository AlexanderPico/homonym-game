const {
  getPuzzleProgressLabel,
  getGuessShape,
  getGuessResult,
  buildShareGlyph,
  getRouteConfig,
  getPuzzleSetForMode,
} = globalThis.HomonymGameCore || {};

const route = getRouteConfig ? getRouteConfig(window.location.pathname) : { locale: 'en', mode: 'daily' };
const appMode = route.mode;
const locale = route.locale;
const ADMIN_SOURCE_OPTIONS = ['drafts', 'curated', 'rejected'];

function getStoredAdminSource() {
  if (appMode !== 'admin') return 'drafts';
  const searchSource = new URLSearchParams(window.location.search).get('source');
  if (ADMIN_SOURCE_OPTIONS.includes(searchSource)) {
    return searchSource;
  }
  try {
    const stored = window.localStorage.getItem(`homonym-admin-source:${locale}`);
    if (ADMIN_SOURCE_OPTIONS.includes(stored)) {
      return stored;
    }
  } catch (error) {}
  return 'drafts';
}

const adminSource = getStoredAdminSource();
const puzzles = getPuzzleSetForMode
  ? getPuzzleSetForMode({ ...route, adminSource }, {
      publicPuzzleByLocale: {
        en: globalThis.HOMONYM_TODAY_PUZZLE || null,
        jp: globalThis.HOMONYM_TODAY_PUZZLE_JP || null,
      },
      draftCorpusByLocale: {
        en: Array.isArray(globalThis.HOMONYM_EN_DRAFT_PUZZLES) ? globalThis.HOMONYM_EN_DRAFT_PUZZLES : [],
        jp: Array.isArray(globalThis.HOMONYM_JP_DRAFT_PUZZLES) ? globalThis.HOMONYM_JP_DRAFT_PUZZLES : [],
      },
      curatedCorpusByLocale: {
        en: Array.isArray(globalThis.HOMONYM_EN_PUZZLES) ? globalThis.HOMONYM_EN_PUZZLES : [],
        jp: Array.isArray(globalThis.HOMONYM_JP_PUZZLES) ? globalThis.HOMONYM_JP_PUZZLES : [],
      },
      rejectedCorpusByLocale: {
        en: Array.isArray(globalThis.HOMONYM_EN_REJECTED_PUZZLES) ? globalThis.HOMONYM_EN_REJECTED_PUZZLES : [],
        jp: Array.isArray(globalThis.HOMONYM_JP_REJECTED_PUZZLES) ? globalThis.HOMONYM_JP_REJECTED_PUZZLES : [],
      },
    })
  : [];

const STRINGS = {
  en: {
    dailyPill: 'Daily puzzle',
    adminShareHeader: (index, total) => `Homonym Game Admin ${index + 1}/${total}`,
    dailyShareHeader: (date) => `Homonym Game ${date}`,
    typePrompt: 'Type your best guess.',
    empty: 'Enter a two-word guess first.',
    oneWord: 'Try a two-word phrase.',
    longer: 'Keep it to a tight two-word phrase.',
    closedAdmin: 'This puzzle is closed. Tap Next puzzle to continue.',
    closedDaily: 'Today\'s puzzle is closed. Come back tomorrow or share your result.',
    noGuessesAdmin: 'No guesses left. Tap Next puzzle to continue.',
    noGuessesDaily: 'No guesses left for today. Share your result or come back tomorrow.',
    solvedStatus: (n) => `Correct. Nicely landed in ${n}/3.`,
    solvedCaption: (n) => `Solved in ${n}/3`,
    closeStatus: 'Very close — this looks like a typo or misspelling away.',
    closeFail: 'That was extremely close, but you are out of guesses.',
    closeFailCaption: 'Almost solved — out of guesses',
    failStatus: 'Three guesses used. Answer revealed below.',
    failCaption: 'Missed after 3/3',
    revealAdmin: 'Answer revealed. Use Next puzzle to keep demoing the loop.',
    revealDaily: 'Answer revealed. Share your result or come back tomorrow for the next daily clue.',
    revealCaption: 'Revealed',
    solvedNote: 'Solved. The clue and phrase now line up cleanly.',
    failedNote: 'Out of guesses. Here is the answer and why it works.',
    defaultNote: 'Revealed for review.',
    copyDone: 'Copied',
    shareDefault: 'Spoiler-safe summary',
    attemptsLeft: (n) => `${n} guess${n === 1 ? '' : 'es'} left`,
    sourceLabel: 'Puzzle source',
    sourceDrafts: 'Drafts',
    sourceCurated: 'Curated',
    sourceRejected: 'Rejected',
    cardLabelBySource: {
      drafts: 'Current draft clue',
      curated: 'Current curated clue',
      rejected: 'Current rejected clue',
    },
    noPuzzlesBySource: {
      drafts: 'No draft puzzles loaded.',
      curated: 'No curated puzzles loaded.',
      rejected: 'No rejected puzzles loaded.',
    },
    moderationReady: 'Draft mode only',
    moderationDisabledBySource: 'Switch back to Drafts to queue decisions.',
    moderationMissingHelper: 'Local moderation helper unavailable. Run node scripts/moderation-helper-server.js.',
    moderationQueued: (decision, queueLength) => `${decision} queued. Queue length: ${queueLength}.`,
    moderationApprove: 'Approved',
    moderationReject: 'Rejected',
    moderationSkip: 'Skipped',
  },
  jp: {
    dailyPill: '今日のパズル',
    adminShareHeader: (index, total) => `Homonym Game JP Admin ${index + 1}/${total}`,
    dailyShareHeader: (date) => `Homonym Game JP ${date}`,
    typePrompt: '答えを入力してください。',
    empty: '答えを入力してください。',
    oneWord: '二語の答えを入力してください。',
    longer: '短い二語の答えにしてください。',
    closedAdmin: 'この問題は終了しました。次のパズルへ進んでください。',
    closedDaily: '今日の問題は終了しました。結果を共有するか、明日の問題を待ってください。',
    noGuessesAdmin: '残り回数がありません。次のパズルへ進んでください。',
    noGuessesDaily: '今日はもう試せません。結果を共有するか、明日また来てください。',
    solvedStatus: (n) => `${n}/3で正解です。`,
    solvedCaption: (n) => `${n}/3で正解`,
    closeStatus: 'かなり近いです。誤字か表記違いかもしれません。',
    closeFail: 'とても近かったですが、試行回数が尽きました。',
    closeFailCaption: 'もう少しで正解',
    failStatus: '3回使い切りました。答えを表示します。',
    failCaption: '3/3で未正解',
    revealAdmin: '答えを表示しました。次のパズルに進んでください。',
    revealDaily: '答えを表示しました。結果を共有するか、明日の問題を待ってください。',
    revealCaption: '答えを表示',
    solvedNote: '正解です。ヒントと答えがきれいにつながりました。',
    failedNote: '試行回数が尽きました。答えと意味を表示します。',
    defaultNote: '確認用に答えを表示しました。',
    copyDone: 'コピー済み',
    shareDefault: 'ネタバレなし',
    attemptsLeft: (n) => `残り ${n} 回`,
    sourceLabel: '表示するセット',
    sourceDrafts: '下書き',
    sourceCurated: '承認済み',
    sourceRejected: '却下',
    cardLabelBySource: {
      drafts: '現在の下書きヒント',
      curated: '現在の承認済みヒント',
      rejected: '現在の却下ヒント',
    },
    noPuzzlesBySource: {
      drafts: '下書きパズルがありません。',
      curated: '承認済みパズルがありません。',
      rejected: '却下済みパズルがありません。',
    },
    moderationReady: '下書きモードのみ',
    moderationDisabledBySource: '判定を送るには下書き表示に戻してください。',
    moderationMissingHelper: 'ローカル審査ヘルパーが見つかりません。node scripts/moderation-helper-server.js を実行してください。',
    moderationQueued: (decision, queueLength) => `${decision}をキューに追加しました。件数: ${queueLength}`,
    moderationApprove: '承認',
    moderationReject: '却下',
    moderationSkip: '保留',
  },
};

const ui = STRINGS[locale] || STRINGS.en;
const ALLOW_SHAPE_CHECK = locale === 'en';
const MAX_ATTEMPTS = 3;

const progressPill = document.getElementById('progress-pill');
const difficultyBadge = document.getElementById('difficulty-badge');
const cardLabel = document.getElementById('card-label');
const sourceSelect = document.getElementById('source-select');
const sourceLabel = document.getElementById('source-label');
const clueText = document.getElementById('puzzle-title');
const statusText = document.getElementById('status-text');
const guessForm = document.getElementById('guess-form');
const guessInput = document.getElementById('guess-input');
const checkButton = document.getElementById('check-button');
const revealButton = document.getElementById('reveal-button');
const nextButton = document.getElementById('next-button');
const resultPanel = document.getElementById('result-panel');
const moderationPanel = document.getElementById('moderation-panel');
const moderationStatus = document.getElementById('moderation-status');
const reviewNoteInput = document.getElementById('review-note');
const approveButton = document.getElementById('approve-button');
const rejectButton = document.getElementById('reject-button');
const skipButton = document.getElementById('skip-button');
const answerText = document.getElementById('answer-text');
const explanationList = document.getElementById('explanation-list');
const notesText = document.getElementById('notes-text');
const attemptSummary = document.getElementById('attempt-summary');
const attemptGlyphs = document.getElementById('attempt-glyphs');
const sharePanel = document.getElementById('share-panel');
const shareCaption = document.getElementById('share-caption');
const shareText = document.getElementById('share-text');
const copyShareButton = document.getElementById('copy-share-button');

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

function getSourceLabelFor(source) {
  return ui.cardLabelBySource?.[source] || ui.cardLabelBySource?.drafts || '';
}

function getNoPuzzlesMessageFor(source) {
  return ui.noPuzzlesBySource?.[source] || ui.noPuzzlesBySource?.drafts || (locale === 'jp' ? 'パズルデータが見つかりません。' : 'Puzzle data is missing.');
}

function configureAdminSourceUi() {
  if (appMode !== 'admin' || !sourceSelect || !sourceLabel) return;
  sourceLabel.textContent = ui.sourceLabel;
  const options = [
    { value: 'drafts', label: ui.sourceDrafts },
    { value: 'curated', label: ui.sourceCurated },
    { value: 'rejected', label: ui.sourceRejected },
  ];
  sourceSelect.replaceChildren();
  options.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (value === adminSource) option.selected = true;
    sourceSelect.appendChild(option);
  });
}

function updateAdminSourceUi() {
  if (appMode !== 'admin') return;
  if (cardLabel) {
    cardLabel.textContent = getSourceLabelFor(adminSource);
  }
  if (sourceSelect) {
    sourceSelect.value = adminSource;
  }
}

function persistAdminSource(nextSource) {
  if (!ADMIN_SOURCE_OPTIONS.includes(nextSource)) return;
  try {
    window.localStorage.setItem(`homonym-admin-source:${locale}`, nextSource);
  } catch (error) {}
  const url = new URL(window.location.href);
  if (nextSource === 'drafts') {
    url.searchParams.delete('source');
  } else {
    url.searchParams.set('source', nextSource);
  }
  window.location.href = url.toString();
}

function setModerationStatus(message, tone = 'neutral') {
  if (!moderationStatus) return;
  moderationStatus.textContent = message;
  moderationStatus.dataset.tone = tone;
}

function setModerationButtonsDisabled(disabled) {
  [approveButton, rejectButton, skipButton, reviewNoteInput].forEach((element) => {
    if (element) element.disabled = disabled;
  });
}

function updateModerationUi() {
  if (!moderationPanel) return;
  const enabled = appMode === 'admin' && adminSource === 'drafts' && Boolean(puzzles[currentIndex]);
  setModerationButtonsDisabled(!enabled);
  if (enabled) {
    setModerationStatus(ui.moderationReady, 'neutral');
    return;
  }
  setModerationStatus(ui.moderationDisabledBySource, 'warning');
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
  const header = appMode === 'admin' ? ui.adminShareHeader(currentIndex, puzzles.length) : ui.dailyShareHeader(getLocalDateString());
  shareCaption.textContent = outcomeLabel;
  shareText.textContent = `${header}\n${glyphLine}`;
  sharePanel.hidden = false;
}

function hideSharePanel() {
  sharePanel.hidden = true;
  shareCaption.textContent = ui.shareDefault;
  shareText.textContent = '';
  copyShareButton.textContent = locale === 'jp' ? 'コピー' : 'Copy glyphs';
}

function showAnswer(puzzle, mode) {
  resultPanel.hidden = false;
  answerText.textContent = puzzle.displayAnswer;
  renderExplanation(puzzle.explanation);
  notesText.textContent = mode === 'solved' ? ui.solvedNote : mode === 'failed' ? ui.failedNote : puzzle.notes || ui.defaultNote;
}

function updateAttemptUi() {
  const remaining = MAX_ATTEMPTS - attemptResults.length;
  attemptSummary.textContent = ui.attemptsLeft(remaining);
  const glyphMap = { exact: '◆', close: '◈', miss: '◇', unused: '—' };
  const cells = attemptResults.slice(0, MAX_ATTEMPTS).map((result) => glyphMap[result] || glyphMap.miss);
  while (cells.length < MAX_ATTEMPTS) cells.push(glyphMap.unused);
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
  progressPill.textContent = ui.dailyPill;
  if (nextButton) nextButton.hidden = true;
}

function loadPuzzle(index) {
  currentIndex = index;
  const puzzle = puzzles[index];
  updateAdminSourceUi();
  updateModeChrome();
  if (!puzzle) {
    clueText.textContent = locale === 'jp' ? 'パズルが読み込めません' : 'No puzzle loaded';
    setStatus(getNoPuzzlesMessageFor(adminSource), 'error');
    guessInput.disabled = true;
    checkButton.disabled = true;
    revealButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    updateModerationUi();
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
  setStatus(ui.typePrompt, 'neutral');
  updateModerationUi();
}

function closePuzzleWithAnswer(puzzle, mode, statusMessage, tone, shareCaptionText) {
  revealedCurrentPuzzle = true;
  if (mode === 'solved') solvedCurrentPuzzle = true;
  showAnswer(puzzle, mode);
  lockPuzzleInteraction();
  setStatus(statusMessage, tone);
  renderSharePanel(shareCaptionText);
}

async function copyShareSummary() {
  const text = shareText.textContent;
  if (!text) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      copyShareButton.textContent = ui.copyDone;
      return;
    }
  } catch (error) {}
  const range = document.createRange();
  range.selectNodeContents(shareText);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  copyShareButton.textContent = ui.copyDone;
}

function handleGuessSubmit(event) {
  event.preventDefault();
  const puzzle = puzzles[currentIndex];
  const guess = guessInput.value;
  if (solvedCurrentPuzzle || revealedCurrentPuzzle) {
    setStatus(appMode === 'admin' ? ui.closedAdmin : ui.closedDaily, 'neutral');
    return;
  }
  if (!guess.trim()) {
    setStatus(ui.empty, 'error');
    guessInput.focus();
    return;
  }
  if (ALLOW_SHAPE_CHECK) {
    const guessShape = getGuessShape(guess);
    if (guessShape === 'one-word') {
      setStatus(ui.oneWord, 'error');
      guessInput.focus();
      return;
    }
    if (guessShape === 'longer') {
      setStatus(ui.longer, 'error');
      guessInput.focus();
      return;
    }
  }
  if (attemptResults.length >= MAX_ATTEMPTS) {
    setStatus(appMode === 'admin' ? ui.noGuessesAdmin : ui.noGuessesDaily, 'neutral');
    return;
  }
  const result = getGuessResult(puzzle, guess);
  attemptResults.push(result);
  updateAttemptUi();
  if (result === 'exact') {
    closePuzzleWithAnswer(puzzle, 'solved', ui.solvedStatus(attemptResults.length), 'success', ui.solvedCaption(attemptResults.length));
    return;
  }
  if (result === 'close') {
    if (attemptResults.length >= MAX_ATTEMPTS) {
      closePuzzleWithAnswer(puzzle, 'failed', ui.closeFail, 'error', ui.closeFailCaption);
      return;
    }
    setStatus(ui.closeStatus, 'warning');
    guessInput.focus();
    guessInput.select();
    return;
  }
  if (attemptResults.length >= MAX_ATTEMPTS) {
    closePuzzleWithAnswer(puzzle, 'failed', ui.failStatus, 'error', ui.failCaption);
    return;
  }
  setStatus(locale === 'jp' ? `${ui.typePrompt} ${ui.attemptsLeft(MAX_ATTEMPTS - attemptResults.length)}` : `Not quite. ${MAX_ATTEMPTS - attemptResults.length} guesses left.`, 'error');
  guessInput.focus();
  guessInput.select();
}

function handleReveal() {
  const puzzle = puzzles[currentIndex];
  closePuzzleWithAnswer(puzzle, 'revealed', appMode === 'admin' ? ui.revealAdmin : ui.revealDaily, 'neutral', ui.revealCaption);
}

function handleNextPuzzle() {
  if (appMode !== 'admin') return;
  const nextIndex = (currentIndex + 1) % puzzles.length;
  loadPuzzle(nextIndex);
}

async function queueModerationDecision(decision) {
  const puzzle = puzzles[currentIndex];
  if (appMode !== 'admin' || adminSource !== 'drafts' || !puzzle) {
    setModerationStatus(ui.moderationDisabledBySource, 'warning');
    return;
  }

  const note = reviewNoteInput ? reviewNoteInput.value.trim() : '';
  setModerationButtonsDisabled(true);
  setModerationStatus(`${decision}…`, 'neutral');

  try {
    const response = await fetch('http://127.0.0.1:8765/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: puzzle.id,
        locale,
        source_set: 'drafts',
        decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'alex',
        review_notes: note,
        clue: puzzle.clue,
        displayAnswer: puzzle.displayAnswer,
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || `Request failed: ${response.status}`);
    }
    const label = decision === 'approve' ? ui.moderationApprove : decision === 'reject' ? ui.moderationReject : ui.moderationSkip;
    setModerationStatus(ui.moderationQueued(label, payload.queueLength), 'success');
    if (reviewNoteInput) {
      reviewNoteInput.value = '';
    }
    handleNextPuzzle();
  } catch (error) {
    const helperHint = /fetch|Failed to fetch|NetworkError/i.test(String(error && error.message)) ? ` ${ui.moderationMissingHelper}` : '';
    setModerationStatus(`${error.message || String(error)}${helperHint}`, 'error');
    updateModerationUi();
  }
}

if (!getPuzzleProgressLabel || !getGuessShape || !getGuessResult || !buildShareGlyph || !getRouteConfig || !getPuzzleSetForMode) {
  configureAdminSourceUi();
  updateAdminSourceUi();
  clueText.textContent = locale === 'jp' ? '設定エラー' : 'Setup incomplete';
  setStatus(locale === 'jp' ? 'パズルデータまたはロジックの読み込みに失敗しました。' : 'Puzzle data or game logic failed to load.', 'error');
  guessInput.disabled = true;
  checkButton.disabled = true;
  revealButton.disabled = true;
  if (nextButton) nextButton.disabled = true;
} else {
  configureAdminSourceUi();
  guessForm.addEventListener('submit', handleGuessSubmit);
  revealButton.addEventListener('click', handleReveal);
  if (nextButton) nextButton.addEventListener('click', handleNextPuzzle);
  if (sourceSelect) {
    sourceSelect.addEventListener('change', (event) => persistAdminSource(event.target.value));
  }
  if (approveButton) approveButton.addEventListener('click', () => queueModerationDecision('approve'));
  if (rejectButton) rejectButton.addEventListener('click', () => queueModerationDecision('reject'));
  if (skipButton) skipButton.addEventListener('click', () => queueModerationDecision('skip'));
  copyShareButton.addEventListener('click', copyShareSummary);
  loadPuzzle(0);
}
