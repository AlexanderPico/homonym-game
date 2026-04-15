const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getDailyPuzzleIndex, selectPublicPuzzle } = require('../packages/game-core/index.js');

const repoRoot = path.resolve(__dirname, '..');
const envPrivateCorpusPath = process.env.PRIVATE_CORPUS_PATH;
const envPrivateCorpusRoot = process.env.PRIVATE_CORPUS_ROOT;
const localSourcePathFile = path.join(repoRoot, 'content', 'private', 'source-repo-path.txt');
const localPrivateCorpusPath = path.join(repoRoot, 'content', 'private', 'daily-corpus.js');

function resolveSourceRoot() {
  if (envPrivateCorpusRoot) {
    return path.resolve(envPrivateCorpusRoot);
  }

  if (fs.existsSync(localSourcePathFile)) {
    const pointedPath = fs.readFileSync(localSourcePathFile, 'utf8').trim();
    if (pointedPath) {
      return path.resolve(repoRoot, pointedPath);
    }
  }

  return null;
}

function resolvePrivateCorpusPath(locale) {
  if (locale === 'en' && envPrivateCorpusPath) {
    return envPrivateCorpusPath;
  }

  const sourceRoot = resolveSourceRoot();
  if (sourceRoot) {
    const corpusFile = locale === 'jp' ? 'jp-draft.js' : 'draft-40.js';
    const repoCorpus = path.join(sourceRoot, 'content', 'puzzles', corpusFile);
    if (fs.existsSync(repoCorpus) && fs.statSync(repoCorpus).isFile()) {
      return repoCorpus;
    }
  }

  return localPrivateCorpusPath;
}

function publishConfigPathFor(corpusPath, locale) {
  const configFile = locale === 'jp' ? 'public-publish-jp.json' : 'public-publish.json';
  return path.resolve(path.dirname(corpusPath), '..', '..', 'config', configFile);
}

function loadCorpus(corpusPath, globalName) {
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(corpusPath, 'utf8'), context, { filename: corpusPath });
  const corpus = context.globalThis[globalName];
  if (!Array.isArray(corpus) || !corpus.length) {
    throw new Error(`Corpus ${globalName} missing or empty in ${corpusPath}`);
  }
  return corpus;
}

function loadPublishOverride(publishConfigPath) {
  if (!fs.existsSync(publishConfigPath)) {
    return null;
  }
  try {
    const config = JSON.parse(fs.readFileSync(publishConfigPath, 'utf8'));
    if (config && config.mode === 'manual' && typeof config.puzzle_id === 'string' && config.puzzle_id.trim()) {
      return config.puzzle_id.trim();
    }
  } catch (error) {
    console.warn(`Ignoring unreadable publish config: ${publishConfigPath}`);
  }
  return null;
}

function buildLocale(locale, options) {
  const globalName = locale === 'jp' ? 'HOMONYM_JP_DRAFT_PUZZLES' : 'HOMONYM_DRAFT_PUZZLES';
  const outputDir = locale === 'jp' ? path.join(repoRoot, 'apps', 'web', 'jp', 'data') : path.join(repoRoot, 'apps', 'web', 'data');
  const outputFile = locale === 'jp' ? 'today-jp.js' : 'today.js';
  const globalOutputName = locale === 'jp' ? 'HOMONYM_TODAY_PUZZLE_JP' : 'HOMONYM_TODAY_PUZZLE';

  const corpusPath = resolvePrivateCorpusPath(locale);
  if (!fs.existsSync(corpusPath)) {
    throw new Error(`Missing private corpus for ${locale}: ${corpusPath}`);
  }

  const corpus = loadCorpus(corpusPath, globalName);
  const publishOverride = loadPublishOverride(publishConfigPathFor(corpusPath, locale));
  const puzzle = selectPublicPuzzle(corpus, options.dateString, publishOverride);

  fs.mkdirSync(outputDir, { recursive: true });
  const payload = `(function (root) {\n  root.${globalOutputName} = ${JSON.stringify(puzzle, null, 2)};\n})(typeof globalThis !== 'undefined' ? globalThis : this);\n`;
  fs.writeFileSync(path.join(outputDir, outputFile), payload);

  console.log(`[${locale}] corpus: ${corpusPath}`);
  console.log(`[${locale}] override puzzle id: ${publishOverride || '<none>'}`);
  console.log(`[${locale}] published puzzle id: ${puzzle.id}`);
}

const dateArg = process.argv[2];
const now = new Date();
const dateString = dateArg || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

console.log(`Date: ${dateString}`);
buildLocale('en', { dateString });
buildLocale('jp', { dateString });
