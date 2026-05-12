const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const readmePath = path.join(repoRoot, 'README.md');
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml');
const englishOutputPath = path.join(repoRoot, 'apps', 'web', 'data', 'today.js');
const japaneseOutputPath = path.join(repoRoot, 'apps', 'web', 'jp', 'data', 'today-jp.js');

function withBackedUpFile(targetPath, fn) {
  const hadOriginal = fs.existsSync(targetPath);
  const originalContent = hadOriginal ? fs.readFileSync(targetPath, 'utf8') : null;

  try {
    return fn();
  } finally {
    if (hadOriginal) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, originalContent);
    } else if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true });
    }
  }
}

test('package scripts, CI, and README expose the daily publish smoke validation path', () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const readme = fs.readFileSync(readmePath, 'utf8');

  assert.equal(pkg.scripts['test:publish'], 'node --test tests/build-public-daily.test.js');
  assert.match(workflow, /npm run test:publish/);
  assert.match(readme, /npm run test:publish/);
});

test('build-public-daily generates both English and Japanese payloads from a local fixture corpus root', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'homonym-publish-fixture-'));
  const puzzlesDir = path.join(fixtureRoot, 'content', 'puzzles');
  const configDir = path.join(fixtureRoot, 'config');
  fs.mkdirSync(puzzlesDir, { recursive: true });
  fs.mkdirSync(configDir, { recursive: true });

  fs.writeFileSync(
    path.join(puzzlesDir, 'en-puzzles.js'),
    `globalThis.HOMONYM_EN_PUZZLES = [\n  { id: 'en-first', clue: 'first clue', answerWords: ['first', 'answer'] },\n  { id: 'en-second', clue: 'second clue', answerWords: ['second', 'answer'] }\n];\n`,
  );
  fs.writeFileSync(
    path.join(puzzlesDir, 'jp-puzzles.js'),
    `globalThis.HOMONYM_JP_PUZZLES = [\n  { id: 'jp-first', clue: '最初のヒント', answerWords: ['記者', '汽車'] },\n  { id: 'jp-second', clue: '二番目のヒント', answerWords: ['機関', '期間'] }\n];\n`,
  );
  fs.writeFileSync(path.join(configDir, 'public-publish.json'), JSON.stringify({ mode: 'manual', offset: 1 }, null, 2));
  fs.writeFileSync(path.join(configDir, 'public-publish-jp.json'), JSON.stringify({ mode: 'manual', offset: 0 }, null, 2));

  try {
    withBackedUpFile(englishOutputPath, () => {
      withBackedUpFile(japaneseOutputPath, () => {
        const result = spawnSync('node', ['scripts/build-public-daily.js', '2026-05-12'], {
          cwd: repoRoot,
          encoding: 'utf8',
          env: {
            ...process.env,
            PRIVATE_CORPUS_ROOT: fixtureRoot,
          },
        });

        assert.equal(result.status, 0, result.stderr || result.stdout);
        const englishOutput = fs.readFileSync(englishOutputPath, 'utf8');
        const japaneseOutput = fs.readFileSync(japaneseOutputPath, 'utf8');

        assert.match(result.stdout, /\[en\] published puzzle id: en-second/);
        assert.match(result.stdout, /\[jp\] published puzzle id: jp-first/);
        assert.match(englishOutput, /HOMONYM_TODAY_PUZZLE/);
        assert.match(englishOutput, /"id": "en-second"/);
        assert.match(japaneseOutput, /HOMONYM_TODAY_PUZZLE_JP/);
        assert.match(japaneseOutput, /"id": "jp-first"/);
      });
    });
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
