# Image and page delivery

Eleventy optimizes local PNG/JPEG images referenced by page images or inline
background styles. `lib/optimize-pages.js` generates WebP variants up to 640 and
1600 pixels wide without enlarging originals. Responsive image URLs include the
GitHub Pages path prefix. Identical images share generated files and processing
within a build; filenames change when image content changes.

Original uploads remain unchanged and downloadable. Future CMS uploads under
`images/` or `assets/images/` receive the same optimization when the site builds.
External images, SVGs and animated images retain their original formats.
Images outside the initial content load lazily. Header and footer fragments are
inserted at build time, avoiding two extra fetches and rendering delays. The
JavaScript include fallback still supports unbuilt HTML previews.

Measured output on 6 October 2026, largest generated variant:

| Homepage image | Original | WebP |
| --- | ---: | ---: |
| Synthesis Reports | 10,275,159 bytes | 74,890 bytes |
| Meet the Consortium | 1,243,461 bytes | 116,784 bytes |
| Renewable Energy Outlooks | 796,359 bytes | 59,650 bytes |

These are image transfer-size reductions, not measured page-load-time guarantees.
Actual loading still depends on the connection, device, hosting and external fonts.

Validate with `npm test`, `npm run build`, `npm run check:build` and
`python3 scripts/test_i18n.py`. For deployment-path checks, build and validate with
`PATH_PREFIX=/sweet-edge` set for both commands.
