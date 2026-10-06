import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { pageOptimizer } from '../lib/optimize-pages.js';

test('optimized pages include navigation and resolve nested images under the deployment prefix', async () => {
  const previous = process.env.PATH_PREFIX;
  process.env.PATH_PREFIX = '/sweet-edge';
  try {
    const optimizer = pageOptimizer();
    const result = await optimizer.transform('<html><head></head><body><div data-include="../partials/header.html"></div><img src="../images/Synthesis%20Reports.png" alt="Report"><img src="../images/logo-SFOE.png" style="height:60px"><a href="../images/Synthesis%20Reports.png">Download original</a><img src="https://example.org/image.png"></body></html>', '_site/results/test.html');
    const $ = load(result);
    assert.equal($('[data-include]').length, 0);
    assert.equal($('header').length, 1);
    const report = $('img[alt="Report"]');
    assert.equal(report.attr('loading'), 'lazy');
    assert.match(report.attr('src'), /^\/sweet-edge\/assets\/optimized\/.*\.webp$/);
    assert.match(report.attr('srcset'), /640w, .*1600w$/);
    const optimized = await fs.stat('_site' + report.attr('src').replace('/sweet-edge', ''));
    const original = await fs.stat('images/Synthesis Reports.png');
    assert.ok(optimized.size < original.size / 10);
    assert.equal($('img[style]').attr('width'), undefined);
    assert.equal($('a').last().attr('href'), '../images/Synthesis%20Reports.png');
    assert.equal($('img').last().attr('src'), 'https://example.org/image.png');
  } finally {
    if (previous === undefined) delete process.env.PATH_PREFIX; else process.env.PATH_PREFIX = previous;
  }
});
