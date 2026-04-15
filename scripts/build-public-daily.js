const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getDailyPuzzleIndex } = require('../packages/game-core/index.js');

const repoRoot = path.resolve(__dirname, '..');
const envPrivateCorpusPath = process.env.PRIVATE_CORPUS_PATH;
const localSourcePathFile = path.join(repoRoot, 'content', 'private', 'source-repo-path.txt');
const localPrivateCorpusPath = path.join(repoRoot, 'content', 'private', 'daily-corpus.js');

function resolvePrivateCorpusPath() {
  if (envPrivateCorpusPath) {
    return envPrivateCorpusPath;
  }

  if (fs.existsSync(localSourcePathFile)) {
    const pointedPath = fs.readFileSync(localSourcePathFile, 'utf8').trim();
    if (pointedPath) {
      const resolved = path.resolve(repoRoot, pointedPath);
      const asFile = resolved;
      const asRepoCorpus = path.join(resolved, 'content', 'puzzles', 'draft-40.js');
      if (fs.existsSync(asFile) && fs.statSync(asFile).isFile()) {
        return asFile;
      }
      if (fs.existsSync(asRepoCorpus) && fs.statSync(asRepoCorpus).isFile()) {
        return asRepoCorpus;
      }
    }
  }

  return localPrivateCorpusPath;
}

const privateCorpusPath = resolvePrivateCorpusPath();
const outputDir = path.join(repoRoot, 'apps', 'web', 'data');
const outputPath = path.join(outputDir, 'today.js');

if (!fs.existsSync(privateCorpusPath)) {
  console.error(`Missing private corpus: ${privateCorpusPath}`);
  process.exit(1);
}

const context = { globalThis: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(privateCorpusPath, 'utf8'), context, { filename: privateCorpusPath });

const corpus = context.globalThis.HOMONYM_DRAFT_PUZZLES;
if (!Array.isArray(corpus) || !corpus.length) {
  console.error('Private corpus did not define HOMONYM_DRAFT_PUZZLES');
  process.exit(1);
}

const dateArg = process.argv[2];
const now = new Date();
const dateString = dateArg || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const index = getDailyPuzzleIndex(dateString, corpus.length);
const puzzle = corpus[index];

fs.mkdirSync(outputDir, { recursive: true });
const payload = `(function (root) {\n  root.HOMONYM_TODAY_PUZZLE = ${JSON.stringify(puzzle, null, 2)};\n})(typeof globalThis !== 'undefined' ? globalThis : this);\n`;
fs.writeFileSync(outputPath, payload);

console.log(`Wrote ${outputPath}`);
console.log(`Date: ${dateString}`);
console.log(`Puzzle index: ${index}`);
console.log(`Puzzle id: ${puzzle.id}`);
