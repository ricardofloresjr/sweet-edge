import { pageOptimizer } from './lib/optimize-pages.js';
import { cards, displayDate, locales, localize, markdown, postUrl, today, safeUrl } from './lib/posts.js';
import fs from 'node:fs';
export default function (config) {
  config.setNunjucksEnvironmentOptions({ autoescape: true });
  // Only publish explicit public assets. Repository documents and source content
  // (including drafts and the confidential proposal) never enter the output.
  for (const item of ['images', 'style.css', 'script.js', 'i18n.js', 'partials', 'files', 'assets/images', 'admin/index.html', 'admin/editor.js']) config.addPassthroughCopy(item);
  config.addPassthroughCopy({ 'translations/de.json': 'translations/de.json', 'translations/fr.json': 'translations/fr.json' });
  for (const file of fs.readdirSync('node_modules/decap-cms/dist').filter(f => /\.(js|css|wasm|txt)$/.test(f))) {
    config.addPassthroughCopy({ [`node_modules/decap-cms/dist/${file}`]: `admin/vendor/${file}` });
  }
  config.addWatchTarget('content/posts');
  config.addShortcode('newsCards', cards);
  config.addFilter('displayDate', displayDate);
  config.addFilter('markdown', value => markdown.render(value || ''));
  config.addFilter('safeUrl', safeUrl);
  config.addFilter('localize', localize);
  config.addFilter('postUrl', postUrl);
  config.addFilter('newsYears', posts => [...new Set(posts.map(p => p.sortDate.slice(0, 4)))].sort().reverse());
  config.addGlobalData('locales', locales);
  config.addGlobalData('today', today());
  config.addGlobalData('siteUrl', process.env.SITE_URL || 'https://www.sweet-edge.ch');
  config.ignores.add('node_modules/**');
  config.ignores.add('admin/**');
  config.ignores.add('partials/**');
  config.ignores.add('tests/**');
  config.ignores.add('docs/**');
  config.ignores.add('.cache/**');
  config.ignores.add('netlify/**');
  const optimizer = pageOptimizer();
  config.on('eleventy.before', () => optimizer.reset());
  config.addWatchTarget('partials');
  config.addTransform('optimize-pages', function (html) {
    return optimizer.transform(html, this.page.outputPath);
  });
  config.addTransform('site-prefix', function (html) {
    if (!this.page.outputPath?.endsWith('.html')) return html;
    const prefix = (process.env.PATH_PREFIX || '').replace(/\/$/, '');
    return prefix ? html.replace(/\b(href|src|action)="(\/(?!\/)[^"]*)"/g, (_, attr, value) => `${attr}="${value.startsWith(prefix + '/') ? value : prefix + value}"`) : html;
  });
  return { dir: { input: '.', includes: '_includes', data: '_data', output: '_site' }, templateFormats: ['html', 'njk', '11ty.js'], htmlTemplateEngine: 'njk' };
}
