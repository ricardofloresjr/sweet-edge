import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const exec = promisify(execFile);
export async function syncOnce(cwd = process.cwd()) {
  const git = async (...args) => (await exec('git', args, { cwd, timeout: 30000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })).stdout.trim();
  try {
    if (await git('branch', '--show-current') !== 'main') return 'Paused: switch to main to sync published content.';
    if (await git('status', '--porcelain')) return 'Paused: local changes found. Commit or otherwise resolve them before syncing.';
    await git('fetch', 'origin', 'main');
    const local = await git('rev-parse', 'HEAD');
    const remote = await git('rev-parse', 'refs/remotes/origin/main');
    if (local === remote) return 'Up to date.';
    if (await git('merge-base', 'HEAD', 'refs/remotes/origin/main') !== local) return 'Paused: local commits need review; automatic sync only fast-forwards.';
    // Check again after the network request in case editing began meanwhile.
    if (await git('status', '--porcelain')) return 'Paused: local changes found. Commit or otherwise resolve them before syncing.';
    await git('merge', '--ff-only', 'refs/remotes/origin/main');
    return 'Updated local files from GitHub.';
  } catch (error) {
    return `Sync unavailable; local files preserved. ${error.code === 'ENOENT' ? 'Git is not installed.' : 'Check your connection and Git access, or run git pull --ff-only manually.'}`;
  }
}
async function main() {
  let stopping = false, timer, server, last;
  const check = async () => {
    const message = await syncOnce();
    if (message !== last || message.startsWith('Updated')) console.log(`[GitHub sync] ${message}`);
    last = message;
  };
  await check();
  if (process.argv.includes('--once')) return;
  if (process.argv.includes('--dev')) {
    server = spawn(process.execPath, ['node_modules/@11ty/eleventy/cmd.cjs', '--serve'], { stdio: 'inherit' });
    server.on('exit', code => { stopping = true; clearTimeout(timer); process.exitCode = code || 0; });
    server.on('error', error => { console.error(error.message); stopping = true; clearTimeout(timer); process.exitCode = 1; });
  }
  const poll = async () => { await check(); if (!stopping) timer = setTimeout(poll, 30000); };
  timer = setTimeout(poll, 30000);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    stopping = true; clearTimeout(timer); server?.kill(signal);
  });
  console.log('[GitHub sync] Checking every 30 seconds while this command is running. Never pushes local edits.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
