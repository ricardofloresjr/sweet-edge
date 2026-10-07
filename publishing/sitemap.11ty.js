const escapeXml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[character]);

export default class {
  data() { return { permalink: '/sitemap.xml', eleventyExcludeFromCollections: true }; }
  render({ collections, siteUrl }) {
    const base = siteUrl.replace(/\/$/, '');
    const prefix = (process.env.PATH_PREFIX || '').replace(/\/$/, '');
    const urls = [...new Set(collections.all
      .map(page => page.url)
      .filter(url => url && url !== '/404.html' && !url.startsWith('/admin/') && (url.endsWith('.html') || url.endsWith('/')))
      .map(url => url === '/index.html' ? '/' : url.replace(/\/index\.html$/, '/')))]
      .sort();
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeXml(base + prefix + url)}</loc></url>`).join('\n')}\n</urlset>\n`;
  }
}
