import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { syncOnce } from '../scripts/sync-github.mjs';

test('sync downloads published files and preserves dirty, divergent and feature work', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-sync-'));
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: 'pipe' }).toString().trim();
  const author = ['-c', 'user.name=Sync Test', '-c', 'user.email=sync@example.test'];
  try {
    git(root, 'init', '--bare', '--initial-branch=main', 'remote');
    git(root, 'clone', path.join(root, 'remote'), 'editor');
    const editor = path.join(root, 'editor'), local = path.join(root, 'local');
    const publish = text => {
      fs.writeFileSync(path.join(editor, 'article.txt'), text);
      git(editor, 'add', '.'); git(editor, ...author, 'commit', '-m', text); git(editor, 'push', 'origin', 'main');
    };
    publish('First article'); git(root, 'clone', path.join(root, 'remote'), 'local');
    publish('Updated article');
    assert.match(await syncOnce(local), /^Updated/);
    assert.equal(fs.readFileSync(path.join(local, 'article.txt'), 'utf8'), 'Updated article');
    fs.writeFileSync(path.join(local, 'article.txt'), 'Local edits'); publish('Remote edits');
    assert.match(await syncOnce(local), /^Paused: local changes/);
    assert.equal(fs.readFileSync(path.join(local, 'article.txt'), 'utf8'), 'Local edits');
    git(local, 'add', '.'); git(local, ...author, 'commit', '-m', 'Local work');
    assert.match(await syncOnce(local), /^Paused: local commits/);
    assert.equal(fs.readFileSync(path.join(local, 'article.txt'), 'utf8'), 'Local edits');
    git(local, 'switch', '-c', 'feature');
    assert.match(await syncOnce(local), /^Paused: switch to main/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
