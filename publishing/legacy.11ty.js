import { escape } from '../lib/posts.js';
export default class {
  data() { return { pagination: { data: 'legacyRedirects', size: 1, alias: 'redirect' }, permalink: data => `${data.redirect.from}/index.html`, eleventyExcludeFromCollections: true }; }
  render({ redirect }) {
    const to = (process.env.PATH_PREFIX || '').replace(/\/$/, '') + redirect.to;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${escape(to)}"><title>Page moved — SWEET EDGE</title></head><body><p>This page has moved. <a href="${escape(to)}">Continue to SWEET EDGE</a>.</p></body></html>`;
  }
}
