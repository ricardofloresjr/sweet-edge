import { readPosts, postUrl } from './posts.js';
export function redirects() {
  const map = new Map([['/en/newslist', '/news.html'], ['/en/events', '/news.html'], ['/fr/actualites', '/news.html?lang=fr'], ['/de/news', '/news.html?lang=de']]);
  for (const post of readPosts()) for (const old of post.en.legacy_paths || []) {
    if (!/^\/(en|de|fr)\/news\/[a-z0-9/-]+$/.test(old)) throw new Error(`Invalid legacy path: ${old}`);
    map.set(old, postUrl(post, old.startsWith('/fr/') ? 'fr' : old.startsWith('/de/') ? 'de' : 'en'));
  }
  return [...map].map(([from, to]) => ({ from, to }));
}
