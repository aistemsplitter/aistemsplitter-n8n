'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function getPackedFiles() {
  const output = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  const [pack] = JSON.parse(output);
  return pack.files.map((file) => file.path);
}

test('npm package only includes n8n runtime files', () => {
  const files = getPackedFiles();
  const forbiddenFiles = files.filter(
    (file) =>
      file.startsWith('pipedream/') ||
      file === 'make-submission.md' ||
      file === 'zapier-submission.md',
  );

  assert.deepEqual(forbiddenFiles, []);
});

test('node icon file reference is included in the package', () => {
  const files = getPackedFiles();
  const { AIStemSplitter } = require('../dist/nodes/AIStemSplitter/AIStemSplitter.node.js');
  const icon = new AIStemSplitter().description.icon;

  assert.equal(typeof icon, 'string');
  assert.ok(icon.startsWith('file:'));

  const iconFile = icon.slice('file:'.length);
  assert.ok(files.includes(`dist/nodes/AIStemSplitter/${iconFile}`));
});
