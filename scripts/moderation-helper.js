const fs = require('node:fs');
const path = require('node:path');

const ALLOWED_DECISIONS = new Set(['approve', 'reject', 'skip']);
const ALLOWED_SOURCE_SETS = new Set(['drafts']);
const ALLOWED_LOCALES = new Set(['en', 'jp']);

function resolveSourceRoot(options = {}) {
  const repoRoot = options.repoRoot || path.resolve(__dirname, '..');
  const env = options.env || process.env;
  if (env.PRIVATE_CORPUS_ROOT) {
    return path.resolve(env.PRIVATE_CORPUS_ROOT);
  }

  const localSourcePathFile = path.join(repoRoot, '.local', 'source-repo-path.txt');
  if (fs.existsSync(localSourcePathFile)) {
    const pointedPath = fs.readFileSync(localSourcePathFile, 'utf8').trim();
    if (pointedPath) {
      return path.resolve(repoRoot, pointedPath);
    }
  }

  return null;
}

function moderationQueuePathForSourceRoot(sourceRoot) {
  return path.join(sourceRoot, 'content', 'puzzles', 'moderation-queue.json');
}

function readModerationQueue(queuePath) {
  if (!fs.existsSync(queuePath)) {
    return [];
  }
  const text = fs.readFileSync(queuePath, 'utf8').trim();
  if (!text) {
    return [];
  }
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error(`Moderation queue must be an array: ${queuePath}`);
  }
  return parsed;
}

function normalizeModerationDecision(decision) {
  if (!decision || typeof decision !== 'object') {
    throw new Error('Moderation decision must be an object');
  }

  const id = String(decision.id || '').trim();
  if (!id) {
    throw new Error('Moderation decision requires id');
  }

  const locale = String(decision.locale || '').trim();
  if (!ALLOWED_LOCALES.has(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const source_set = String(decision.source_set || '').trim();
  if (!ALLOWED_SOURCE_SETS.has(source_set)) {
    throw new Error(`Invalid source_set: ${source_set}`);
  }

  const action = String(decision.decision || '').trim();
  if (!ALLOWED_DECISIONS.has(action)) {
    throw new Error(`Invalid decision: ${action}`);
  }

  const reviewed_at = String(decision.reviewed_at || '').trim();
  if (!reviewed_at) {
    throw new Error('Moderation decision requires reviewed_at');
  }

  const reviewed_by = String(decision.reviewed_by || 'local-admin').trim() || 'local-admin';
  const review_notes = String(decision.review_notes || '');

  const normalized = {
    id,
    locale,
    source_set,
    decision: action,
    reviewed_at,
    reviewed_by,
    review_notes,
  };

  if (typeof decision.clue === 'string' && decision.clue.trim()) {
    normalized.clue = decision.clue.trim();
  }
  if (typeof decision.displayAnswer === 'string' && decision.displayAnswer.trim()) {
    normalized.displayAnswer = decision.displayAnswer.trim();
  }

  return normalized;
}

function appendModerationDecision(queuePath, decision) {
  const normalized = normalizeModerationDecision(decision);
  const queue = readModerationQueue(queuePath);
  queue.push(normalized);
  fs.mkdirSync(path.dirname(queuePath), { recursive: true });
  fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
  return normalized;
}

module.exports = {
  resolveSourceRoot,
  moderationQueuePathForSourceRoot,
  readModerationQueue,
  normalizeModerationDecision,
  appendModerationDecision,
};
