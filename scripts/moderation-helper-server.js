const http = require('node:http');
const path = require('node:path');

const {
  resolveSourceRoot,
  moderationQueuePathForSourceRoot,
  appendModerationDecision,
  readModerationQueue,
} = require('./moderation-helper.js');

const port = Number(process.env.MODERATION_HELPER_PORT || 8765);
const repoRoot = path.resolve(__dirname, '..');

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function getQueuePath() {
  const sourceRoot = resolveSourceRoot({ repoRoot });
  if (!sourceRoot) {
    throw new Error('Could not resolve private source repo. Check .local/source-repo-path.txt or PRIVATE_CORPUS_ROOT.');
  }
  return {
    sourceRoot,
    queuePath: moderationQueuePathForSourceRoot(sourceRoot),
  };
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    writeJson(response, 204, {});
    return;
  }

  try {
    if (request.method === 'GET' && request.url === '/health') {
      const { sourceRoot, queuePath } = getQueuePath();
      writeJson(response, 200, {
        ok: true,
        sourceRoot,
        queuePath,
        queueLength: readModerationQueue(queuePath).length,
      });
      return;
    }

    if (request.method === 'POST' && request.url === '/queue') {
      const { queuePath } = getQueuePath();
      const body = await readRequestBody(request);
      const payload = body ? JSON.parse(body) : {};
      const entry = appendModerationDecision(queuePath, payload);
      writeJson(response, 200, {
        ok: true,
        entry,
        queueLength: readModerationQueue(queuePath).length,
      });
      return;
    }

    writeJson(response, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    writeJson(response, 500, { ok: false, error: error.message });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Moderation helper listening on http://127.0.0.1:${port}`);
});
