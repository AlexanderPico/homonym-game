const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  resolveSourceRoot,
  moderationQueuePathForSourceRoot,
  appendModerationDecision,
  readModerationQueue,
} = require('../scripts/moderation-helper.js');

test('resolveSourceRoot prefers local pointer file when present', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'homonym-source-root-'));
  const localDir = path.join(tempRoot, '.local');
  fs.mkdirSync(localDir, { recursive: true });
  fs.writeFileSync(path.join(localDir, 'source-repo-path.txt'), '../private-repo');

  const resolved = resolveSourceRoot({ repoRoot: tempRoot });
  assert.equal(resolved, path.resolve(tempRoot, '../private-repo'));
});

test('appendModerationDecision creates queue file and appends normalized decisions', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'homonym-queue-root-'));
  const sourceRoot = path.join(tempRoot, 'private-repo');
  fs.mkdirSync(path.join(sourceRoot, 'content', 'puzzles'), { recursive: true });

  const queuePath = moderationQueuePathForSourceRoot(sourceRoot);
  const first = appendModerationDecision(queuePath, {
    id: 'en-001',
    locale: 'en',
    source_set: 'drafts',
    decision: 'approve',
    reviewed_by: 'alex',
    review_notes: 'ready',
    reviewed_at: '2026-04-15T19:00:00.000Z',
  });

  assert.equal(first.id, 'en-001');
  assert.equal(first.decision, 'approve');
  assert.equal(first.review_notes, 'ready');
  assert.equal(readModerationQueue(queuePath).length, 1);

  appendModerationDecision(queuePath, {
    id: 'jp-002',
    locale: 'jp',
    source_set: 'drafts',
    decision: 'reject',
    reviewed_by: 'alex',
    review_notes: '',
    reviewed_at: '2026-04-15T19:05:00.000Z',
  });

  const queue = readModerationQueue(queuePath);
  assert.equal(queue.length, 2);
  assert.deepEqual(queue.map((entry) => entry.id), ['en-001', 'jp-002']);
});

test('appendModerationDecision rejects invalid moderation decisions', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'homonym-invalid-queue-'));
  const sourceRoot = path.join(tempRoot, 'private-repo');
  fs.mkdirSync(path.join(sourceRoot, 'content', 'puzzles'), { recursive: true });

  const queuePath = moderationQueuePathForSourceRoot(sourceRoot);

  assert.throws(
    () => appendModerationDecision(queuePath, {
      id: 'en-003',
      locale: 'en',
      source_set: 'curated',
      decision: 'approve',
      reviewed_by: 'alex',
      reviewed_at: '2026-04-15T19:10:00.000Z',
    }),
    /source_set/,
  );

  assert.throws(
    () => appendModerationDecision(queuePath, {
      id: 'en-003',
      locale: 'en',
      source_set: 'drafts',
      decision: 'maybe',
      reviewed_by: 'alex',
      reviewed_at: '2026-04-15T19:10:00.000Z',
    }),
    /decision/,
  );
});
