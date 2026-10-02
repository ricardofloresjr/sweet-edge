export default class {
  data() { return { permalink: '/_redirects', eleventyExcludeFromCollections: true }; }
  render({ legacyRedirects }) { return legacyRedirects.map(r => `${r.from} ${r.to} 301!`).join('\n') + '\n'; }
}
