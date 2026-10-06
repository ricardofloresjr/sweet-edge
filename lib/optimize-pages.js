import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { load } from 'cheerio';

// Originals remain available for downloads and CMS editing. Only displayed images
// use generated, content-addressed assets. Reset per build for Eleventy watch mode.
export function pageOptimizer() {
  const images = new Map();
  const prefix = (process.env.PATH_PREFIX || '').replace(/\/$/, '');
  async function optimize(src, outputPath) {
    if (!src || /^(?:[a-z]+:|\/\/|#)/i.test(src)) return null;
    const page = path.relative(path.resolve('_site'), path.resolve(outputPath));
    const url = new URL(src, `https://local.test/${page}`);
    const relative = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (!/^(?:images|assets\/images)\/.*\.(?:png|jpe?g)$/i.test(relative) || relative.includes('..')) return null;
    if (!images.has(relative)) images.set(relative, (async () => {
      const input = await fs.readFile(relative);
      const meta = await sharp(input).metadata();
      if (meta.pages > 1) return null;
      const hash = createHash('sha256').update(input).update('webp-v1-82-1600').digest('hex').slice(0, 20);
      await fs.mkdir('_site/assets/optimized', { recursive: true });
      const variants = [];
      for (const width of [...new Set([Math.min(640, meta.width), Math.min(1600, meta.width)])]) {
        const name = `${hash}-${width}.webp`;
        const info = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`_site/assets/optimized/${name}`);
        variants.push({ url: `${prefix}/assets/optimized/${name}`, width: info.width, height: info.height });
      }
      return variants;
    })());
    return images.get(relative);
  }
  return {
    reset() { images.clear(); },
    async transform(html, outputPath) {
      if (!outputPath?.endsWith('.html')) return html;
      const $ = load(html);
      for (const node of $('[data-include]').toArray()) {
        const name = $(node).attr('data-include').match(/(?:^|\/)partials\/(header|footer)\.html$/)?.[1];
        if (name) $(node).replaceWith(await fs.readFile(`partials/${name}.html`, 'utf8'));
      }
      for (const node of $('img[src]').toArray()) {
        const img = $(node);
        const variants = await optimize(img.attr('src'), outputPath);
        if (variants) {
          const largest = variants.at(-1);
          img.attr('src', largest.url);
          if (variants.length > 1) {
            img.attr('srcset', variants.map(v => `${v.url} ${v.width}w`).join(', '));
            img.attr('sizes', '(max-width: 640px) 100vw, 800px');
          }
          if (!img.attr('width') && !img.attr('height') && !/(?:width|height)\s*:/.test(img.attr('style') || '')) img.attr({ width: largest.width, height: largest.height });
        }
        img.attr('decoding', 'async');
        const aboveFold = img.closest('header, .hero').length || img.hasClass('article-cover') || img.closest('.slide').is($('.slide').first());
        if (!aboveFold && !img.attr('loading')) img.attr('loading', 'lazy');
      }
      for (const node of $('[style]').toArray()) {
        let style = $(node).attr('style');
        for (const match of [...style.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)]) {
          const variants = await optimize(match[1], outputPath);
          if (variants) style = style.replace(match[0], `url('${variants.at(-1).url}')`);
        }
        $(node).attr('style', style);
      }
      return $.html();
    }
  };
}
