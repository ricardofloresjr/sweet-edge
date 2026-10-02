import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readPosts, validatePost, localize, cards, markdown, safeUrl } from '../lib/posts.js';
import { cmsConfig } from '../publishing/cms-config.11ty.js';
const sample = (overrides = {}) => ({ en: { title: 'Example <title>', summary: 'A summary', body: 'Real **content**.', kind: 'news', date: '2026-01-01', draft: false, ...overrides } });

test('withdrawn and scheduled posts are excluded; events can be advertised in advance', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-posts-'));
  try {
    for (const [name, overrides] of Object.entries({ published: {}, hidden: { draft: true }, scheduled: { date: '2026-12-01' }, event: { kind: 'event', date: '', event_date: '2026-11-11' } })) fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(sample(overrides)));
    assert.deepEqual(readPosts(dir, '2026-10-02').map(p => p.slug), ['event', 'published']);
    assert.equal(readPosts(dir, '2026-12-02').length, 3);
  } finally { fs.rmSync(dir, { recursive: true }); }
});
test('invalid dates, reversed event intervals and unsafe URLs fail before deployment', () => {
  for (const overrides of [{ date: '2026-02-31' }, { kind: 'event', event_date: '' }, { kind: 'event', event_date: '2026-02-10', event_end_date: '2026-02-09' }, { image: 'javascript:alert(1)' }, { registration_url: '//evil.example' }, { timezone: 'Invalid/Zone' }, { draft: 'false' }]) assert.throws(() => validatePost(sample(overrides), 'test-post'));
  assert.equal(safeUrl('https://example.com/register'), 'https://example.com/register');
  assert.equal(safeUrl('/images/example.jpg'), '/images/example.jpg');
  assert.equal(safeUrl('/\\evil.example'), '');
});
test('unpublished translations fall back as a whole, with a visible language notice', () => {
  const post = { ...sample(), slug: 'example', sortDate: '2026-01-01', fr: { title: 'Titre' } };
  assert.equal(localize(post, 'fr').language, 'en');
  assert.equal(localize(post, 'fr').title, post.en.title);
  assert.match(cards([post]), /Disponible en anglais/);
  post.fr = { title: 'Titre', summary: 'Résumé', body: 'Article' };
  assert.equal(localize(post, 'fr').language, 'fr');
  assert.equal(localize(post, 'fr').fallback, false);
});
test('editor-controlled content is escaped and Markdown cannot inject active HTML', () => {
  assert.match(cards([{ ...sample(), slug: 'example', sortDate: '2026-01-01' }]), /Example &lt;title&gt;/);
  const html = markdown.render('<script>alert(1)</script>\n\n[bad](javascript:alert(1))');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('href="javascript:'));
  assert.match(markdown.render('[Reference](https://example.com)'), /href="https:\/\/example.com"/);
});
test('the import report accounts for the source content and current local covers exist', () => {
  const posts = readPosts('content/posts', '9999-12-31');
  const report = JSON.parse(fs.readFileSync('docs/content-migration.json', 'utf8'));
  assert.equal(report.news.length, 69);
  assert.equal(report.events.length, 14);
  for (const post of posts) for (const lang of ['en', 'de', 'fr']) {
    assert.equal(typeof post[lang], 'object', `${post.slug}: ${lang} locale required by CMS serializer`);
    const image = post[lang]?.image;
    if (image?.startsWith('/')) assert.ok(fs.existsSync(decodeURIComponent(image.slice(1))), image);
  }
});
test('CMS uses the correct repository, locale schema and preview branch without secrets', () => {
  const c = cmsConfig({ BRANCH: 'feat/news-publishing', URL: 'https://example.netlify.app' });
  assert.equal(c.backend.repo, 'ricardofloresjr/sweet-edge');
  assert.equal(c.backend.branch, 'feat/news-publishing');
  assert.equal(c.site_domain, 'example.netlify.app');
  assert.equal(c.publish_mode, 'editorial_workflow');
  assert.equal(c.i18n.structure, 'single_file');
  assert.deepEqual(c.i18n.locales, ['en', 'de', 'fr']);
  assert.ok(!JSON.stringify(c).includes('client_secret'));
});
