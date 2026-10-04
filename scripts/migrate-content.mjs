// One-time, repeatable import. Existing edited posts are never overwritten.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import Turndown from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
const origin = 'https://www.sweet-edge.ch/';
const cache = '.cache/migration';
await fs.mkdir(cache, { recursive: true });
await fs.mkdir('content/posts', { recursive: true });
const report = { sources: [origin + 'en/newslist', origin + 'en/events'], news: [], events: [], assets: [], warnings: [] };
const downloaded = new Map();
const created = new Set();
const hash = s => createHash('sha256').update(s).digest('hex').slice(0, 16);
const exists = async p => fs.access(p).then(() => true, () => false);
async function get(url) {
  const file = `${cache}/${hash(url)}.html`;
  if (await exists(file)) return fs.readFile(file, 'utf8');
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const html = await response.text(); await fs.writeFile(file, html); return html;
}
async function asset(url) {
  const u = new URL(url, origin);
  if (!['www.sweet-edge.ch', 'sweet-edge.ch'].includes(u.hostname)) return u.href;
  if (u.searchParams.has('file')) return asset(u.searchParams.get('file'));
  if (!/^\/(files\/|assets\/images\/)/.test(u.pathname)) return u.href;
  if (!/\.(png|jpe?g|gif|webp|svg|pdf|docx?|pptx?|xlsx?|zip)$/i.test(u.pathname)) return u.href;
  const relative = decodeURIComponent(u.pathname).slice(1);
  if (relative.split('/').some(s => s === '..') || relative.includes('\\')) throw new Error('Unsafe asset path');
  if (!downloaded.has(relative)) downloaded.set(relative, (async () => {
    if (!(await exists(relative))) {
      const res = await fetch(new URL(u.pathname, origin), { signal: AbortSignal.timeout(60000) });
      if (!res.ok) throw new Error(`Asset ${res.status}: ${u.href}`);
      const data = Buffer.from(await res.arrayBuffer());
      if (data.length > 90 * 1024 * 1024) throw new Error(`Asset too large: ${u.href}`);
      await fs.mkdir(path.dirname(relative), { recursive: true }); await fs.writeFile(relative, data);
    }
    report.assets.push('/' + relative);
    return '/' + relative.split('/').map(encodeURIComponent).join('/');
  })());
  try { return await downloaded.get(relative); } catch (e) { report.warnings.push(e.message); return u.href; }
}
const td = new Turndown({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });td.use(gfm);
td.addRule('iframe-link', { filter: 'iframe', replacement: (_, node) => `\n\n[Watch the video](${node.getAttribute('src') || ''})\n\n` });
const clean = text => text.replace(/\s+/g, ' ').trim();
async function convert(html, title, source) {
  const $ = load(`<main>${html}</main>`), root = $('main');
  root.find('script,style,form,.back').remove();
  root.find('h1,h2,h3,h4,h5,h6').each((_, n) => { if (!clean($(n).text()) || /^_+$/.test(clean($(n).text()))) $(n).remove(); });
  const firstImage = root.find('img').first();
  const image = firstImage.length ? await asset(firstImage.attr('src')) : '';
  const image_alt = firstImage.attr('alt') || title;
  // Keep attribution/captions in the article body, even when moving its cover.
  const image_credit = firstImage.closest('figure').find('figcaption').text().trim();
  if (firstImage.length) {
    const parent = firstImage.parent();
    firstImage.remove();
    if (parent.is('a') && !parent.text().trim()) parent.remove();
  }
  for (const node of root.find('[href],[src]').toArray()) {
    for (const attr of ['href', 'src']) {
      const value = $(node).attr(attr); if (!value || value.startsWith('#')) continue;
      let u; try { u = new URL(value, origin); } catch { continue; }
      if (!['http:', 'https:', 'mailto:'].includes(u.protocol)) { $(node).removeAttr(attr); continue; }
      $(node).attr(attr, await asset(u.href));
    }
  }
  // Old editors sometimes used h5 elements for entire paragraphs.
  root.find('h5').each((_, n) => { const node = $(n); node.replaceWith(`<p>${node.html()}</p>`); });
  const prose = root.find('p').toArray().map(n => clean($(n).text())).find(t => t.length > 50) || clean(root.text());
  let summary = prose.slice(0, 260); if (prose.length > 260) summary = summary.replace(/\s+\S*$/, '') + '…';
  return { title, summary, image, image_alt, image_credit, body: td.turndown(root.html()).trim(), source_url: source };
}
const list = load(await get(origin + 'en/newslist'));
if (list('.pagination a').length) throw new Error('Pagination found: extend importer before proceeding');
const links = list('.layout_fulledge').toArray().map(n => {
  const el = list(n);
  return { source: new URL(el.find('a[href*="en/news/"]').last().attr('href'), origin).href, date: el.find('time').attr('datetime')?.slice(0, 10) };
});
async function importNews(record) {
  const $ = load(await get(record.source));
  const root = $('.mod_newsreader .layout_full');
  if (!root.length) throw new Error('Missing article body: ' + record.source);
  const title = clean(root.find('h1').first().text());
  const slug = new URL(record.source).pathname.split('/').pop();
  const data = { en: { ...await convert(root.find('.ce_text,.ce_image,.ce_download,.ce_downloads,.ce_youtube,.ce_gallery').toArray().filter(n => !$(n).parents('.ce_text').length).map(n => $.html(n)).join('\n'), title, record.source), kind: 'news', date: record.date, draft: false, legacy_paths: [new URL(record.source).pathname] } };
  for (const lang of ['de', 'fr']) {
    const alternate = $(`.mod_changelanguage a[hreflang="${lang}"]:not(.nofallback)`).attr('href');
    if (!alternate) continue;
    try {
      const target = new URL(alternate, origin).href;
      const l = load(await get(target)), reader = l('.mod_newsreader .layout_full');
      if (!reader.length) continue;
      const localized = await convert(reader.find('.ce_text,.ce_image,.ce_download,.ce_downloads,.ce_youtube,.ce_gallery').toArray().filter(n => !l(n).parents('.ce_text').length).map(n => l.html(n)).join('\n'), clean(reader.find('h1').first().text()), target);
      if (localized.title && localized.body) { data[lang] = localized; data.en.legacy_paths.push(new URL(target).pathname); }
    } catch (error) { report.warnings.push(error.message); }
  }
  // Decap's single-file serializer requires an object for every configured locale.
  data.de ||= {};
  data.fr ||= {};
  const file = `content/posts/${slug}.json`;
  if (!(await exists(file))) { await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n'); created.add(file); }
  report.news.push({ slug, source: record.source, date: record.date, languages: Object.keys(data).filter(lang => data[lang].body) });
}
// Limit load on the old site while fetching independent articles.
for (let i = 0; i < links.length; i += 4) {
  await Promise.all(links.slice(i, i + 4).map(importNews));
  console.log(`Imported ${Math.min(i + 4, links.length)}/${links.length} news articles`);
}
// Event metadata is transcribed from the source; publication dates are unknown.
// Events with separate sessions remain one entry, with session details in the body.
const eventMeta = [
  ['2026-11-11', '', '', 'Welle 7, Bern'],
  ['2026-09-09', '', '11:30', 'Online'],
  ['2026-06-08', '', '11:30', 'Online'],
  ['2026-03-12', '', '11:30', 'Online'],
  ['2026-02-10', '', '11:30', 'Online'],
  ['2026-01-19', '', '11:40', 'Online'],
  ['2025-09-04', '2025-09-05', '', 'Wädenswil'],
  ['2025-05-22', '', '', 'Sorell Hotel Ador, Bern', 'Second Swiss Conference on Decentralized Energy'],
  ['2025-01-08', '2025-01-15', '18:00', 'Café Gavroche, Boulevard James-Fazy 4, 1201 Geneva', 'Energy Drinks in Geneva — 8 and 15 January 2025'],
  ['2024-08-22', '2024-08-23', '', 'Lucerne'],
  ['2024-06-24', '2024-06-25', '', ''],
  ['2024-05-22', '2024-05-23', '18:00', 'The Alehouse, Zurich'],
  ['2023-08-22', '', '', 'Bern'],
  ['2023-08-21', '2023-08-23', '', 'Bern']
];
const events = load(await get(origin + 'en/events'));
const blocks = events('.mod_article .ce_text').toArray();
if (blocks.length !== eventMeta.length) throw new Error('Event source changed: review metadata mapping');
for (const [index, node] of blocks.entries()) {
  const el = events(node).clone(), meta = eventMeta[index];
  const heading = el.find('h2,h3').first();
  const title = meta[4] || clean(heading.text());
  if (clean(heading.text()) === title) heading.remove();
  const slug = 'event-' + meta[0] + '-' + title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 130).replace(/-$/, '');
  const data = { en: { ...await convert(el.html(), title, origin + 'en/events'), kind: 'event', draft: false, event_date: meta[0], event_end_date: meta[1], event_time: meta[2], timezone: 'Europe/Zurich', event_location: meta[3], registration_url: el.find('a[href*="forms."]').first().attr('href') || '' } };
  // Decap's single-file serializer requires an object for every configured locale.
  data.de ||= {};
  data.fr ||= {};
  const file = `content/posts/${slug}.json`;
  if (!(await exists(file))) { await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n'); created.add(file); }
  report.events.push({ slug, source: origin + 'en/events', date: meta[0], title });
}
// Rewrite legacy article links only after every target has been discovered.
const redirects = Object.fromEntries(report.news.flatMap(n => [[new URL(n.source).pathname, `/news/${n.slug}/`]]));
for (const file of await fs.readdir('content/posts')) {
  const full = `content/posts/${file}`;
  if (!created.has(full)) continue;
  let text = await fs.readFile(full, 'utf8');
  text = text.replace(/https?:\/\/(?:www\.)?sweet-edge\.ch\/[^\s"<>)]*/g, raw => {
    try { const u = new URL(raw); return redirects[u.pathname] ? redirects[u.pathname] + u.hash : raw; } catch { return raw; }
  });
  // Keep provenance URLs intact after rewriting links inside Markdown.
  const data = JSON.parse(text), original = JSON.parse(await fs.readFile(full, 'utf8'));
  for (const lang of ['en', 'de', 'fr']) if (original[lang]?.source_url) data[lang].source_url = original[lang].source_url;
  await fs.writeFile(full, JSON.stringify(data, null, 2) + '\n');
}
report.assets.sort();report.news.sort((a,b) => b.date.localeCompare(a.date));
await fs.mkdir('docs', { recursive: true });
await fs.writeFile('docs/content-migration.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ news: report.news.length, events: report.events.length, assets: report.assets.length, warnings: report.warnings }, null, 2));
