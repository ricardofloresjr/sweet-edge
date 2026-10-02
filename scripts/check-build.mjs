import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { readPosts, postUrl } from '../lib/posts.js';
const root = path.resolve('_site');
const prefix = (process.env.PATH_PREFIX || '').replace(/\/$/, '');
let pages = 0, links = 0;
const errors = [];
function checkFile(file) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const $ = load(fs.readFileSync(file, 'utf8'));
  const base = new URL(relative, 'http://site.test/');
  for (const node of $('[href], [src], [data-include]').toArray()) {
    for (const attr of ['href', 'src', 'data-include']) {
      const value = $(node).attr(attr); if (!value || value.startsWith('#')) continue;
      let url; try { url = new URL(value, base); } catch { errors.push(`${relative}: invalid ${value}`); continue; }
      if (url.origin !== base.origin) continue;
      let local = path.join(root, decodeURIComponent(prefix && url.pathname.startsWith(prefix + '/') ? url.pathname.slice(prefix.length) : url.pathname));
      if (fs.existsSync(local) && fs.statSync(local).isDirectory()) local = path.join(local, 'index.html');
      if (!fs.existsSync(local)) errors.push(`${relative}: missing ${value}`);
      links++;
    }
  }
  if (!relative.startsWith('admin/')) assert.ok(!$('script[src*="decap"]').length, relative);
  pages++;
}
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  const file = path.join(dir, entry.name);
  if (entry.isDirectory()) walk(file); else if (file.endsWith('.html')) checkFile(file);
} }
walk(root);
for (const forbidden of ['content', 'docs', '.git', '.env', 'node_modules', 'EDGE_Proposal_complete_CONFIDENTIAL (1).pdf']) assert.ok(!fs.existsSync(path.join(root, forbidden)), forbidden);
const news = load(fs.readFileSync('_site/news.html', 'utf8'));
assert.equal(news('[data-news-item]').length, readPosts().length);
const home = load(fs.readFileSync('_site/index.html', 'utf8'));
assert.equal(home('[data-news-item]').length, Math.min(3, readPosts().length));
for (const post of readPosts()) for (const lang of ['en','de','fr']) assert.ok(fs.existsSync(path.join(root, postUrl(post, lang), 'index.html')));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${pages} generated HTML pages, ${links} local links, publication counts and public-output boundaries`);
