import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

export const locales = ['en', 'de', 'fr'];
export const markdown = new MarkdownIt({ html: false, linkify: true, breaks: false });
export const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date());
export function safeUrl(value = '') {
  if (!value) return '';
  if (/^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value)) return value;
  try { const u = new URL(value); return ['https:', 'http:', 'mailto:'].includes(u.protocol) ? value : ''; } catch { return ''; }
}
export function validatePost(post, slug) {
  const en = post.en;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid post slug: ${slug}`);
  if (!en || !en.title?.trim() || !en.body?.trim() || !en.summary?.trim()) throw new Error(`${slug}: English title, summary and body are required`);
  if (!['news', 'event'].includes(en.kind)) throw new Error(`${slug}: invalid kind`);
  for (const field of ['date', 'event_date', 'event_end_date']) {
    const value = en[field];
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error(`${slug}: invalid ${field}`);
  }
  if (en.kind === 'news' && !en.date) throw new Error(`${slug}: news needs a publication date`);
  if (en.kind === 'event' && !en.event_date) throw new Error(`${slug}: event needs a start date`);
  if (en.event_end_date && en.event_end_date < en.event_date) throw new Error(`${slug}: event ends before it starts`);
  if (en.event_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(en.event_time)) throw new Error(`${slug}: invalid event time`);
  try { new Intl.DateTimeFormat('en', { timeZone: en.timezone || 'Europe/Zurich' }); } catch { throw new Error(`${slug}: invalid timezone`); }
  for (const field of ['image', 'registration_url', 'source_url']) if (en[field] && !safeUrl(en[field])) throw new Error(`${slug}: invalid ${field} URL`);
  if (en.draft !== undefined && typeof en.draft !== 'boolean') throw new Error(`${slug}: draft must be boolean`);
  return post;
}
export function readPosts(directory = 'content/posts', now = today()) {
  return fs.readdirSync(directory).filter(f => f.endsWith('.json')).map(file => {
    const slug = path.basename(file, '.json');
    const data = validatePost(JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')), slug);
    return { ...data, slug, sortDate: data.en.kind === 'event' ? data.en.event_date : data.en.date };
  }).filter(p => !p.en.draft && (!p.en.date || p.en.date <= now))
    .sort((a, b) => b.sortDate.localeCompare(a.sortDate) || a.slug.localeCompare(b.slug));
}
export const postUrl = (post, lang = 'en') => `/news/${lang === 'en' ? '' : lang + '/'}${post.slug}/`;
export const displayDate = (value, lang = 'en') => value ? new Intl.DateTimeFormat({ en: 'en-GB', de: 'de-CH', fr: 'fr-CH' }[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)) : '';
export function localize(post, lang) {
  const translated = lang === 'en' || Boolean(post[lang]?.title?.trim() && post[lang]?.summary?.trim() && post[lang]?.body?.trim());
  const text = translated ? post[lang] : post.en;
  return { ...post.en, ...text, language: translated ? lang : 'en', fallback: !translated };
}
const labels = {
  en: { news: 'News', event: 'Event', more: 'Read more →', missing: 'Available in English', empty: 'News and events will appear here when published.', upcoming: 'Upcoming event', past: 'Past event' },
  de: { news: 'Neuigkeiten', event: 'Veranstaltung', more: 'Weiterlesen →', missing: 'Auf Englisch verfügbar', empty: 'Neuigkeiten und Veranstaltungen erscheinen hier nach der Veröffentlichung.', upcoming: 'Bevorstehende Veranstaltung', past: 'Vergangene Veranstaltung' },
  fr: { news: 'Actualités', event: 'Événement', more: 'Lire la suite →', missing: 'Disponible en anglais', empty: 'Les actualités et événements apparaîtront ici après publication.', upcoming: 'Événement à venir', past: 'Événement passé' }
};
export function cards(posts, limit) {
  const selected = limit ? posts.slice(0, Number(limit)) : posts;
  if (!selected.length) return locales.map(lang => `<p data-content-lang="${lang}" translate="no"${lang === 'en' ? '' : ' hidden'}>${labels[lang].empty}</p>`).join('');
  return selected.map(post => `<article class="news-card" data-news-item data-type="${post.en.kind}" data-date="${post.sortDate}">${locales.map(lang => {
    const item = localize(post, lang), label = labels[lang];
    const date = post.en.kind === 'event' ? post.en.event_date : post.en.date;
    const status = post.en.kind === 'event' ? ((post.en.event_end_date || date) < today() ? label.past : label.upcoming) : label.news;
    return `<div data-content-lang="${lang}" translate="no"${lang === 'en' ? '' : ' hidden'}>
      ${item.image ? `<a href="${postUrl(post, lang)}" tabindex="-1" aria-hidden="true"><img class="news-cover" src="${escape(safeUrl(item.image))}" alt="" loading="lazy" width="640" height="360"></a>` : ''}
      <span class="news-date"><time datetime="${date}">${displayDate(date, lang)}</time> · ${status}</span>
      <h3 lang="${item.language}"><a href="${postUrl(post, lang)}">${escape(item.title)}</a></h3>
      <p lang="${item.language}">${escape(item.summary)}</p>
      ${item.fallback ? `<p class="translation-note">${label.missing}</p>` : ''}
      <a class="news-more" href="${postUrl(post, lang)}">${label.more}</a>
    </div>`;
  }).join('')}</article>`).join('\n');
}
