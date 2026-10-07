export default class {
  data() { return { permalink: '/robots.txt', eleventyExcludeFromCollections: true }; }
  render({ siteUrl }) {
    const prefix = (process.env.PATH_PREFIX || '').replace(/\/$/, '');
    return `User-agent: *\nDisallow: ${prefix}/admin/\n\nSitemap: ${siteUrl.replace(/\/$/, '')}${prefix}/sitemap.xml\n`;
  }
}
