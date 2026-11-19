import { readPosts, postUrl } from './posts.js';
export function redirects() {
  const map = new Map([['/en/newslist', '/news.html'], ['/en/events', '/news.html'], ['/fr/actualites', '/news.html?lang=fr'], ['/de/news', '/news.html?lang=de']]);
  for (const post of readPosts()) for (const old of post.en.legacy_paths || []) {
    // Old-site paths (/en/news/…) and retired post URLs on this site (/news/[de|fr/]slug).
    if (!/^\/(?:(?:en|de|fr)\/news|news)\/[a-z0-9/-]+$/.test(old)) throw new Error(`Invalid legacy path: ${old}`);
    const lang = old.match(/^\/(?:news\/)?(de|fr)\//)?.[1] || 'en';
    map.set(old, postUrl(post, lang));
  }
  return [...map].map(([from, to]) => ({ from, to }));
}
