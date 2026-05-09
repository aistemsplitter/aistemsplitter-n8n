import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AIStemSplitterIntegrationError,
  createSplit,
  getCredits,
  getSplit,
  normalizeConfig,
} from '../shared/aistemsplitter-api.mjs';

test('normalizeConfig trims API base URL', () => {
  assert.deepEqual(
    normalizeConfig({
      apiKey: 'ast_test_123',
      apiBaseUrl: 'https://api.example.test/v1/',
    }),
    {
      apiKey: 'ast_test_123',
      apiBaseUrl: 'https://api.example.test/v1',
    },
  );
});

test('getCredits calls credits endpoint', async () => {
  const requests = [];
  const credits = await getCredits(
    {
      apiKey: 'ast_test_123',
      apiBaseUrl: 'https://api.example.test/v1',
    },
    async (url, init) => {
      requests.push({ url, init });
      return jsonResponse({
        success: true,
        data: { balance: 6200, unit: 'seconds' },
      });
    },
  );

  assert.equal(credits.balance, 6200);
  assert.equal(requests[0].url, 'https://api.example.test/v1/credits');
  assert.equal(requests[0].init.headers.Authorization, 'Bearer ast_test_123');
});

test('createSplit posts direct URL request', async () => {
  const requests = [];
  const split = await createSplit(
    {
      apiKey: 'ast_test_123',
      apiBaseUrl: 'https://api.example.test/v1',
      audioUrl: 'https://example.com/song.mp3',
      stemModel: '6s',
      outputFormat: 'mp3',
    },
    async (url, init) => {
      requests.push({ url, init });
      return jsonResponse({
        success: true,
        data: { id: 'split_123', status: 'queued', creditsUsed: 214 },
      });
    },
  );

  assert.equal(split.id, 'split_123');
  assert.equal(requests[0].url, 'https://api.example.test/v1/audio/splits');
  assert.equal(requests[0].init.headers.Authorization, 'Bearer ast_test_123');
  assert.deepEqual(JSON.parse(requests[0].init.body), {
    input: {
      type: 'direct_url',
      url: 'https://example.com/song.mp3',
    },
    stemModel: '6s',
    outputFormat: 'mp3',
  });
});

test('getSplit reads split status', async () => {
  const split = await getSplit(
    {
      apiKey: 'ast_test_123',
      apiBaseUrl: 'https://api.example.test/v1',
      splitId: 'split_123',
    },
    async (url, init) => {
      assert.equal(url, 'https://api.example.test/v1/audio/splits/split_123');
      assert.equal(init.headers.Authorization, 'Bearer ast_test_123');
      return jsonResponse({
        success: true,
        data: { id: 'split_123', status: 'succeeded' },
      });
    },
  );

  assert.equal(split.status, 'succeeded');
});

test('API errors raise typed errors', async () => {
  await assert.rejects(
    getSplit(
      {
        apiKey: 'ast_test_123',
        apiBaseUrl: 'https://api.aistemsplitter.org/v1',
        splitId: 'split_123',
      },
      async () =>
        jsonResponse(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Missing or invalid API key',
            },
          },
          401,
        ),
    ),
    (error) =>
      error instanceof AIStemSplitterIntegrationError &&
      error.status === 401 &&
      error.code === 'UNAUTHORIZED',
  );
});

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
  };
}
