'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { NodeApiError } = require('n8n-workflow');
const {
  AIStemSplitter,
} = require('../dist/nodes/AIStemSplitter/AIStemSplitter.node.js');

function makeContext({ operation, params = {}, continueOnFail = false }) {
  const baseParams = {
    operation,
    audioUrl: 'https://example.com/song.mp3',
    stemModel: '6s',
    splitId: 'split_test',
    ...params,
  };
  return {
    getInputData: () => [{ json: {} }],
    getCredentials: async () => ({
      apiKey: 'ast_test_key',
      apiBaseUrl: 'https://api.example.test/v1',
    }),
    getNodeParameter: (name) => baseParams[name],
    getNode: () => ({ name: 'AIStemSplitter', type: 'AIStemSplitter' }),
    continueOnFail: () => continueOnFail,
  };
}

function installFetchMock(handler) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  return () => {
    globalThis.fetch = original;
  };
}

test('execute returns split data on getCredits success', async () => {
  const restore = installFetchMock(
    async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { balance: 1200, unit: 'seconds' },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
  );

  try {
    const node = new AIStemSplitter();
    const ctx = makeContext({ operation: 'getCredits' });
    const [items] = await node.execute.call(ctx);
    assert.equal(items.length, 1);
    assert.deepEqual(items[0].json, { balance: 1200, unit: 'seconds' });
  } finally {
    restore();
  }
});

test('execute wraps HTTP failures as NodeApiError', async () => {
  const restore = installFetchMock(
    async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid request' },
        }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      ),
  );

  try {
    const node = new AIStemSplitter();
    const ctx = makeContext({ operation: 'getCredits' });
    await assert.rejects(
      async () => node.execute.call(ctx),
      (err) => err instanceof NodeApiError,
    );
  } finally {
    restore();
  }
});

test('execute respects continueOnFail by emitting error item', async () => {
  const restore = installFetchMock(
    async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid request' },
        }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      ),
  );

  try {
    const node = new AIStemSplitter();
    const ctx = makeContext({
      operation: 'getCredits',
      continueOnFail: true,
    });
    const [items] = await node.execute.call(ctx);
    assert.equal(items.length, 1);
    assert.ok(items[0].json.error, 'expected error field in json output');
  } finally {
    restore();
  }
});
