# Curated Corpus and Push-Triggered Moderation Workflow Plan

> For Hermes: use subagent-driven-development if executing this plan later.

Goal: separate curated public puzzles from draft intake puzzles, let a local curator approve/reject/skip items in admin mode, and run a push-triggered workflow that promotes approvals into the live curated sets while archiving rejections whenever new curation results land.

Architecture: keep the public repo static and auditable. Store the full corpus state in the private source repo under explicit locale-scoped files (`*-puzzles.js`, `*-drafts.js`, optional `*-rejected.js`). In local admin mode, write moderation decisions to a separate queue file instead of mutating the corpus immediately; a push-triggered GitHub Action in the private repo applies queued decisions deterministically, rebuilds curated files, archives rejected entries, and leaves an audit trail in git history.

Tech stack: plain HTML/CSS/JS for local admin UI, Node.js scripts for corpus transforms, GitHub Actions on push in the private repo.

---

## Target private-repo file layout

Per locale:
- `content/puzzles/en-puzzles.js` — curated/approved English puzzles eligible for daily publish
- `content/puzzles/en-drafts.js` — English drafts awaiting review
- `content/puzzles/en-rejected.js` — optional English rejection archive
- `content/puzzles/jp-puzzles.js` — curated/approved Japanese puzzles eligible for daily publish
- `content/puzzles/jp-drafts.js` — Japanese drafts awaiting review
- `content/puzzles/jp-rejected.js` — optional Japanese rejection archive

Decision queue + logs:
- `content/puzzles/moderation-queue.json`
- `content/puzzles/moderation-log.jsonl` or git-only audit trail if you want to avoid a second log

## Recommended puzzle schema additions

Keep current puzzle fields, and add only what the workflow needs:

```js
{
  id: 'en-001',
  clue: '...',
  displayAnswer: '...',
  answerWords: ['...', '...'],
  aliases: [],
  explanation: ['...', '...'],
  difficulty: 'easy',
  status: 'draft',
  notes: 'editorial notes',
  source: 'human|hermes|submission',
  submittedAt: '2026-04-15T18:00:00Z',
  reviewedAt: null,
  reviewedBy: null,
  reviewNotes: '',
}
```

For rejected archives, preserve the same object and append:
- `rejectedAt`
- `rejectedBy`
- `rejectionReason`

## Moderation decision model

The admin UI should not directly rewrite `*-puzzles.js` or `*-drafts.js` on each click. Instead it should append queue entries like:

```json
{
  "id": "en-042",
  "locale": "en",
  "source_set": "drafts",
  "decision": "approve",
  "reviewed_at": "2026-04-15T23:12:01Z",
  "reviewed_by": "alex",
  "review_notes": "Nice clue, ready for live rotation"
}
```

Allowed decisions:
- `approve`
- `reject`
- `skip`

Rules:
- `skip` should usually not write anything unless there is a note worth saving
- only one final queued decision per puzzle ID should be applied in a given workflow run; newest entry wins
- the apply script must be idempotent so repeated push-triggered runs stay safe

## Local admin UX mechanism

Recommended local admin controls:
- source toggle: `Drafts | Curated | Rejected`
- locale-aware default:
  - `/admin` opens English drafts
  - `/jp/admin` opens Japanese drafts
- action buttons per puzzle:
  - `Approve`
  - `Reject`
  - `Skip`
- optional text input:
  - `Review note`

Suggested persistence model:
- current selected source stored in `localStorage`
- button clicks send decisions to a local-only helper script or write to a local queue artifact
- do not require a backend for local curation

If you want zero backend even locally, simplest path is:
1. admin page renders puzzles from `*-drafts.js`
2. action buttons copy/export a decision block or invoke a tiny local helper
3. helper appends to `moderation-queue.json`

If you want one-click local moderation, best path is:
- add a tiny localhost helper endpoint or CLI bridge that appends queue entries safely

## Push-triggered Action behavior

Run this in the private repo, not the public Pages repo.

Trigger model:
- run on push to the private repo branch that receives moderation queue updates
- optionally expose `workflow_dispatch` for manual re-runs
- do not use a nightly cron unless you later add some independent batch job that truly needs scheduling

Workflow steps:
1. checkout private repo
2. load `en-drafts.js`, `en-puzzles.js`, `en-rejected.js` if present
3. load `jp-drafts.js`, `jp-puzzles.js`, `jp-rejected.js` if present
4. load `moderation-queue.json`
5. collapse queue by puzzle ID, newest decision wins
6. for each `approve`:
   - remove puzzle from `*-drafts.js`
   - add puzzle to `*-puzzles.js` unless already present
   - set `status: 'reviewed'` or `status: 'approved'`
   - stamp `reviewedAt`, `reviewedBy`, `reviewNotes`
7. for each `reject`:
   - remove puzzle from `*-drafts.js`
   - append to `*-rejected.js`
   - set rejection metadata
8. leave skipped puzzles in `*-drafts.js`
9. clear only the applied queue entries from `moderation-queue.json`
10. commit changes in the private repo
11. trigger or rely on the public Pages workflow to rebuild `today.js` / `today-jp.js`

## Important safety checks

Before applying queued decisions:
- fail if duplicate IDs exist inside the same source file
- fail if a puzzle appears in both curated and draft sets before apply
- fail if an approve targets a missing draft puzzle unless it is already curated
- fail if a reject targets a missing draft puzzle unless it is already archived

After apply:
- assert no approved/rejected puzzle remains in drafts
- assert curated and rejected sets remain de-duplicated by `id`
- assert files stay sorted by a stable key (recommended: `id` or `submittedAt`)

## Public repo integration rules

Public repo should keep doing only two things:
- admin pages read draft corpora locally for curation
- `scripts/build-public-daily.js` reads curated `*-puzzles.js` only

This keeps unpublished drafts and moderation state out of the public deploy path.

## Recommended execution order

### Task 1: Finalize file naming and loaders
Objective: ensure the public repo uses curated `*-puzzles.js` for daily generation and `*-drafts.js` for local admin.

Files:
- Modify: `scripts/build-public-daily.js`
- Modify: `apps/web/admin/index.html`
- Modify: `apps/web/jp/admin/index.html`
- Modify: `apps/web/app.js`

### Task 2: Add admin source selection model
Objective: allow admin mode to switch between drafts, curated, and rejected sources.

Files:
- Modify: `apps/web/admin/index.html`
- Modify: `apps/web/jp/admin/index.html`
- Modify: `apps/web/app.js`
- Modify: `packages/game-core/index.js`
- Test: `tests/game-core.test.js`

Implementation notes:
- add a query-string or localStorage-backed source selector
- extend `getPuzzleSetForMode()` to accept `draftCorpusByLocale`, `curatedCorpusByLocale`, and `rejectedCorpusByLocale`
- keep daily mode unchanged

### Task 3: Create moderation queue format and helper script
Objective: append curator decisions without mutating corpora inline.

Files:
- Create (private repo): `content/puzzles/moderation-queue.json`
- Create (private repo): `scripts/apply-moderation-queue.js`
- Optional create (private repo): `scripts/append-moderation-decision.js`

### Task 4: Wire admin approve/reject/skip buttons
Objective: let the local curator record decisions from the admin page.

Files:
- Modify: `apps/web/admin/index.html`
- Modify: `apps/web/jp/admin/index.html`
- Modify: `apps/web/app.js`
- Optional create: local helper bridge script outside public deploy path

### Task 5: Add push-triggered private-repo workflow
Objective: apply queued decisions automatically whenever new moderation results are pushed.

Files:
- Create (private repo): `.github/workflows/apply-moderation-queue.yml`
- Modify (private repo): corpus files under `content/puzzles/`

### Task 6: Add regression tests for corpus transitions
Objective: prove approval/rejection moves puzzles between sets correctly.

Files:
- Create (private repo): `tests/apply-moderation-queue.test.js`

Suggested cases:
- approve moves draft -> curated
- reject moves draft -> rejected
- skip leaves draft untouched
- newest queued decision wins
- duplicate IDs fail loudly

## Verification commands

Public repo:
- `node --check apps/web/app.js`
- `node --check packages/game-core/index.js`
- `node --check scripts/build-public-daily.js`
- `node --test tests/game-core.test.js`

Private repo after moderation tooling exists:
- `node --check scripts/apply-moderation-queue.js`
- `node --test tests/apply-moderation-queue.test.js`

## Recommendation

Start with the naming split and curated-vs-draft loaders first. Then add the source toggle in local admin. Only after that should you add approve/reject buttons and the push-triggered apply job, because queue-based moderation is much easier to audit than directly rewriting corpus files from browser clicks.
