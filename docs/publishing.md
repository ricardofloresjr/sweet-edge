# Publishing SWEET EDGE news and events

The website is built with Eleventy. Decap CMS edits one JSON file per post in
`content/posts/`. Article text is Markdown inside the JSON file. The original
site design and existing `.html` page URLs are preserved.

## What is ready

- 69 news articles and 14 event entries imported from the previous website.
- All 84 current entries have complete French and German versions. The original
  8 French and 10 German versions were retained; 150 missing versions were added
  through machine-assisted translation and targeted review. See
  `archive-translations.json` for the inventory.
- 74 local media/download assets copied from the original site. External services,
  such as YouTube and Google Drive, retain their original links.
- Individual EN/DE/FR article URLs; untranslated articles display their English
  content with an explicit notice. Fallback copies are not indexed separately.
- Automatic homepage cards, category/year filters, localized search, event details,
  old-URL redirects and a separate admin editor.
- GitHub Actions builds and validates changes; publishing to GitHub Pages is disabled
  until explicitly enabled. Netlify configuration is also included for a preview.

See `content-migration.json` for the source inventory and import exceptions. One
source image was already missing (HTTP 404); its event renders without a cover.
Event publication dates are left blank because the source did not provide them.
Events with separate sessions retain those dates in their article text.

## Preview locally

Use Node.js 22 or newer. In the repository:

```sh
npm ci
npm run dev
```

Open the URL printed by Eleventy (normally `http://localhost:8080`). Live Server
on the source HTML is no longer appropriate: Eleventy must render the templates.

In a second terminal, start the local editor proxy:

```sh
npm run cms
```

Open `http://localhost:8080/admin/` and click **Login**. Local mode edits files in
this checkout; it does not publish to GitHub. The proxy binds only to `127.0.0.1`.
Stop it when finished. Local mode uses immediate saves; the draft/review workflow
is provided by the GitHub backend online.

## Activate online login (account owner)

The implementation uses Decap's supported GitHub backend and Netlify's hosted
OAuth service. No custom authentication server or secret in the repository is
needed. GitHub repository permissions control who can edit; keep repository write
access limited to your account if you are the only editor.

1. Create a Netlify account at <https://app.netlify.com/signup> using GitHub,
   authorize access to this repository, then import `ricardofloresjr/sweet-edge` from GitHub. For the initial
   preview, select branch `feat/news-publishing`. Netlify reads `netlify.toml`:
   build command `npm run build`, publish directory `_site`, Node.js 22.
   Keep the existing production domain and DNS unchanged during review.
2. Open the deployed preview and `/admin/`. Note the project's stable
   `your-project.netlify.app` address.
3. Create a GitHub OAuth App at <https://github.com/settings/developers>.
   - Application name: `SWEET EDGE Editor`
   - Homepage URL: the Netlify project URL
   - Authorization callback URL: `https://api.netlify.com/auth/done`
4. In Netlify **Project configuration → Security → OAuth → Install provider**,
   select GitHub and enter the app's Client ID and Client Secret. Enter the secret
   only in Netlify's protected provider settings, never in a file or chat message.
5. Return to `/admin/` and sign in with your GitHub account. The generated config
   uses Netlify's stable project hostname for authentication. On a feature-branch
   preview, Decap publishes only to that branch (`BRANCH` supplied by Netlify).
6. Verify a draft and preview before merging the implementation into `main`.
   After approval, change Netlify's production branch to `main` if using Netlify.

Official references:
- <https://decapcms.org/docs/github-backend/>
- <https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/>
- <https://decapcms.org/docs/editorial-workflows/>

Online OAuth remains unverified until these account settings are connected.
Neither an account nor production DNS is created/changed by the repository build.

## Publish an article

1. Open `/admin/`, choose **News & Events**, and click **Post**.
2. Fill in the title, type, short summary and article. Add a cover image, its
   description and credit when available.
3. For news, set the publication date. For events, set the start date, optional
   last date/time, timezone, location and registration URL. Describe distinct
   sessions in the article when dates are not a continuous event.
4. Use **Save draft**, review the preview, then mark ready and publish. The online
   editorial workflow stores drafts on separate Git branches. Publishing merges
   the post into the configured content branch and triggers a site build.
5. Check the deployment result. Changes appear on the public site after a successful
   build, not immediately when clicking Publish.

**Hide from website** is an additional withdrawal switch: a published entry with
this enabled produces no article pages or cards. Saving ordinary work in progress
should use the draft workflow instead. Because the repository is public, Git
history and draft branches are public; do not use drafts for confidential material.

The homepage takes the three most recent entries by news publication date or event
start date. Upcoming events can therefore lead the list. Past events remain in the
archive; their dedicated registration button disappears and they are marked as past.
Registration links inside historical article text remain part of the source archive.

Future-dated news is omitted until a build on or after that date. GitHub Actions
runs a daily build at 04:15 UTC. If hosting on Netlify instead, schedule a daily
build hook there to enable automatic scheduled publication, or publish manually.

## Languages

Use Decap's **Writing in EN/DE/FR** control to edit language versions. Complete the
translated title, summary and body before publishing a translation. A partially
translated entry falls back to the full English article, with a notice, rather
than mixing translated headings with an untranslated body. Shared dates/type/flags
are duplicated from English; translations do not need separate event metadata.

Post text lives with the post, not in the interface translation dictionaries.
Keep filenames (URL slugs) stable after publication. Imported `legacy_paths` and
`source_url` are hidden editor fields used for redirects and migration provenance.

## Deployment choices

### Keep GitHub Pages

After the branch is reviewed and merged:

1. In repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Add repository Actions variable `DEPLOY_GITHUB_PAGES=true`.
3. Set `SITE_URL` to the final public origin, e.g. `https://www.sweet-edge.ch`.
4. For a project URL under `/sweet-edge`, set `PATH_PREFIX=/sweet-edge`; for a
   custom domain, leave `PATH_PREFIX` empty. Include the prefix in `SITE_URL` too.
5. Set `CMS_SITE_DOMAIN` to the stable Netlify project hostname configured for OAuth.
6. Run the **Build and publish website** workflow. Connect the custom domain only
   after reviewing the output and planning the production switchover.

GitHub Pages serves static redirect pages for old URLs. Netlify uses server-side
301 redirects from `_redirects` instead. Only `_site` is deployed; source documents,
content JSON, drafts, credentials and repository tooling are not copied to it.

### Host on Netlify

Keep the connected Netlify project, switch the production branch to `main` after
approval, and configure the final domain there when ready. Do not enable the GitHub
Pages deployment variable if Netlify is your production host. GitHub Actions still
checks builds independently.

## Technical verification

```sh
npm test
npm run build
npm run check:build
python3 scripts/test_i18n.py
```

The last check uses Python Playwright and an installed Chromium browser. It serves
`_site` and simulates form responses; no real forms are submitted.

`npm run migrate` is a source-import utility, not part of normal publishing. It
fetches the approved original source URLs, uses `.cache/migration` for HTML, and
skips existing post files to preserve subsequent edits. Review its report and any
changed source structure before running another migration.

## Keep VS Code files synchronized

`npm run dev` checks GitHub immediately and every 30 seconds while the local
preview runs. On a clean `main` checkout, it downloads published updates using a
fast-forward merge; Eleventy then rebuilds the preview. Drafts on CMS branches
are not copied into `main`.

For syncing without the preview server, run `npm run sync`. For one check, run
`npm run sync:once`. Stop either continuous command with Ctrl+C. Nothing runs
when these commands are stopped or the computer is asleep.

Sync pauses if there are uncommitted files, you are on another branch, or local
commits cannot be fast-forwarded. It never stashes, discards, or pushes local work.
Resolve the local changes first; the next check retries automatically. Read the
terminal's `[GitHub sync]` messages if an update does not arrive.
