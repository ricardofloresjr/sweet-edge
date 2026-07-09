# SWEET EDGE Website — Page-by-Page Build Plan

## Project Overview

**Site:** Replacement for www.sweet-edge.ch  
**Stack:** Vanilla HTML / CSS / JS — static site, no build tool  
**Languages:** English (default), French (`/fr/`), German (`/de/`)  
**Design style:** SWEET programme white-background style with green accents (#70B746), responsive, modern UX  
**Hosting:** TBD (currently local dev)  

---

## Design System

| Token | Value |
|---|---|
| Primary green | `#70B746` |
| Dark green (hover) | `#5da038` |
| Link blue | `#005599` |
| Heading colour | `#111827` |
| Body text | `#444` |
| Light background | `#f7f8fa` |
| Border | `#e8e8e8` |
| Font | Inter (Google Fonts) |
| Border radius (cards) | `12px` |
| Gradient (banners) | red `#ff5e5e` → orange `#ffc94d` → green `#78e051` |

---

## Global Components (shared across all pages)

### Header
- [x] SWEET EDGE logo (links to `/index.html`)
- [x] Hamburger menu button (mobile, ≤768px)
- [x] Navigation: Home | Consortium ▾ | Results ▾ | News & Events | Contact
- [x] Language switcher: EN | FR | DE
- [ ] **TODO:** Add active-page highlight to nav (JS: compare `location.pathname` to each href)
- [ ] **TODO:** Make header shrink on scroll (`header.scrolled` class with smaller height)
- [ ] **TODO:** Add search icon to header (optional)

### Footer
- [x] Logo + SFOE funding note
- [x] Quick links column
- [x] Legal links (Disclaimer, Impressum, Privacy Policy)
- [x] Contact email
- [x] Social links (LinkedIn, BlueSky, YouTube)
- [x] Copyright bar
- [ ] **TODO:** Fill in real Disclaimer, Impressum, and Privacy Policy pages

### Shared CSS (`style.css`)
- [x] CSS bug fixes (margin-top unit, logo height, font consistency)
- [x] Hamburger menu styles + animation
- [x] Language switcher styles
- [x] Page hero reusable component (`.page-hero`)
- [x] Card/team/partner/wp/pub components
- [x] Scroll fade-in animations
- [x] Responsive breakpoints (768px, 900px, 480px)
- [ ] **TODO:** CSS custom properties (variables) for easier theming
- [ ] **TODO:** Dark mode support (optional, low priority)

### Shared JS (`script.js`)
- [x] Carousel (autoplay, touch-friendly dots, prev/next)
- [x] Hamburger toggle + mobile dropdown toggles
- [x] Scroll fade-in (IntersectionObserver)
- [x] News/Events filter (search + type + year)
- [ ] **TODO:** Add touch/swipe support to carousel
- [ ] **TODO:** Active nav item detection (highlight current page)

---

## Multilingual Structure

Plan: English at root (`/`), French at `/fr/`, German at `/de/`.

Each HTML file needs equivalent copies in `/fr/` and `/de/` with translated content.

The language switcher links point to the equivalent page, e.g.:
- `/fr/index.html`, `/fr/consortium/overview.html`, `/fr/news.html`, etc.

**Recommended approach (when content is ready):**
1. Translate all page content into FR and DE
2. Mirror the folder structure under `/fr/` and `/de/`
3. Keep the same CSS/JS by referencing them with absolute paths

---

## Page-by-Page Instructions

---

### 1. Home — `index.html`

**Status:** ✅ Structure complete — needs real content + images  
**Purpose:** Welcome visitors, explain SWEET EDGE mission, show latest news, drive newsletter signups

#### Sections to complete:
1. **Header** ✅ Logo, nav, hamburger, lang switcher
2. **Top gradient banner** ✅ Region icons (Cities, Midlands, Alps, Switzerland)
   - [ ] Verify all 4 icon images load correctly at correct sizes
   - [ ] Consider adding labels below each icon (currently no text)
3. **Carousel** ✅ 4 slides linking to key result pages
   - [ ] Replace placeholder images with designed carousel slides (use real visuals or SVG illustrations)
   - [ ] Add touch/swipe support for mobile
   - [ ] Aria-live region for screen readers
4. **Mission section** ✅ Two paragraphs of project description
   - [ ] Confirm text with PIs — keep to 2–3 short paragraphs
5. **Guiding question** ✅ Highlighted callout
   - [ ] No changes needed — just verify typography looks right
6. **About SWEET programme** ✅ One paragraph on the SFOE programme
7. **News & Events preview** ✅ 3 news cards
   - [ ] Replace with real news items when available
8. **Newsletter signup** ✅ Email form
   - [ ] Connect form to a real email service (Mailchimp, Brevo, etc.)
   - [ ] Add success/error toast message on submit
9. **Bottom gradient banner** ✅
10. **Footer** ✅

#### Outstanding content needed:
- Real carousel slide images (designed assets)
- Real news items (at least 3)
- Confirmed mission text from PIs

---

### 2. Consortium: Overview — `consortium/overview.html`

**Status:** ✅ Structure complete — needs real content  
**Purpose:** Explain the consortium structure, objectives, and coordination

#### Sections to complete:
1. **Page hero** ✅
2. **About SWEET EDGE** — two paragraphs ✅
   - [ ] Confirm text with coordination team
3. **Research objectives** — 5 cards ✅
   - [ ] Verify these 5 objectives match the official project description
   - [ ] Add links to relevant results/WP pages from each card
4. **Coordination** — UNIGE + EPFL ✅
   - [ ] Add actual lab names and PI names
   - [ ] Update project end date (currently 2028 — confirm)

#### Outstanding content needed:
- Official research objectives text
- Correct coordinator names and contacts

---

### 3. Consortium: Team — `consortium/team.html`

**Status:** 🔶 Structure complete — all content is placeholder  
**Purpose:** Introduce the researchers driving the project

#### Sections to complete:
1. **Page hero** ✅
2. **Principal investigators grid** ✅ (6 placeholder cards)
   - [ ] **Replace every card** with real PI: photo, name, role, institution, link to personal page
   - [ ] Decide: photo circle vs. initials avatar — real photos are strongly recommended
3. **Research staff grid** ✅ (3 placeholder cards)
   - [ ] Add all research staff, postdocs, and PhD students
   - [ ] Consider grouping by WP or institution

#### Outstanding content needed:
- [ ] Full list of PIs with bios, photos (JPG/PNG, ~300×300px), institution, role, personal URL
- [ ] Full list of research staff (name, institution, WP)

#### Design note:
- Photo images should be square, ideally 300×300px minimum
- Add a CSS class `.avatar-img` for circular photo display when real photos are added:
  ```css
  .avatar-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; }
  ```

---

### 4. Consortium: Partners — `consortium/partners.html`

**Status:** 🔶 Structure complete — partner logos are placeholders  
**Purpose:** Showcase institutional and industry partners with logos

#### Sections to complete:
1. **Academic partners grid** ✅ (8 placeholder cards: UNIGE, EPFL, ETHZ, ZHAW, UNIL, UNIBE, WSL, PSI)
   - [ ] **Replace placeholder logos** with real SVG/PNG logos for each institution
   - [ ] Add link to each partner's website (logo → click → partner URL)
   - [ ] Verify this list of 8 is complete — add/remove partners as needed
2. **Industry partners grid** ✅ (3 placeholder cards)
   - [ ] Add real industry/utility partners: name, logo, role, URL
3. **Funding block** ✅ (SFOE logo — uses `/images/logo-SFOE.png`)
   - [ ] Verify `logo-SFOE.png` is the correct file and displays correctly

#### Outstanding content needed:
- [ ] List of all partners with: official name, logo file (SVG preferred), website URL, role in project
- [ ] List of all industry partners

---

### 5. Consortium: Work Packages — `consortium/work-packages.html`

**Status:** 🔶 Structure complete — WP descriptions are illustrative placeholders  
**Purpose:** Explain the research structure across 11 work packages

#### Sections to complete:
1. **Page hero** ✅
2. **WP cards grid** ✅ (11 placeholder cards, WP 1–11)
   - [ ] **Replace all WP titles and descriptions** with official content from the project plan
   - [ ] Add WP lead name and institution to each card
   - [ ] Add links to relevant publications or deliverables from each WP

#### Outstanding content needed:
- [ ] Official WP list with: number, title, 2–3 sentence description, lead PI, lead institution

#### Design enhancement (optional):
- Add a visual WP dependency diagram or timeline using CSS or an SVG

---

### 6. Results: Renewable Energy Outlook — `results/renewable-energy-outlook.html`

**Status:** 🔶 Structure complete — placeholder findings and downloads  
**Purpose:** Present the REO scenarios, key findings, and downloadable reports

#### Sections to complete:
1. **Page hero** ✅
2. **About the REO** — 2 paragraphs ✅
   - [ ] Replace with official description of the REO methodology and scope
3. **Key findings** — 3 cards ✅
   - [ ] Replace with actual findings from published REO
   - [ ] Add quantitative results where possible (e.g. "Solar PV could cover 40% of Swiss demand by 2035")
4. **Downloads** — 2 placeholder PDF links ✅
   - [ ] Add real download links (PDF, data files, interactive tools)
5. **Optional additions:**
   - [ ] Embed an interactive chart or scenario visualization (Chart.js, Flourish, or D3)
   - [ ] Add a map showing regional renewable potential

#### Outstanding content needed:
- [ ] REO main report PDF + summary PDF
- [ ] Key findings list (from WP leads)

---

### 7. Results: Recommender Tool — `results/recommender-tool.html`

**Status:** 🔶 Structure + placeholder for tool embed  
**Purpose:** Host or link to the interactive municipal recommender tool

#### Sections to complete:
1. **Page hero** ✅
2. **About the tool** ✅ (2 paragraphs)
   - [ ] Confirm tool description with WP tool developers
3. **Tool embed area** ✅ — dashed placeholder box
   - [ ] **Replace with actual tool:** either `<iframe src="tool-url">` or a direct link button
4. **How it works** — 3-step cards ✅
   - [ ] Verify steps match the actual tool workflow

#### Outstanding content needed:
- [ ] Tool URL or embed code from the tool development team
- [ ] Confirmed "How it works" step descriptions

---

### 8. Results: Policy Recommendations — `results/policy-recommendations.html`

**Status:** 🔶 Structure + illustrative policy briefs  
**Purpose:** Present downloadable policy briefs and key recommendations

#### Sections to complete:
1. **Page hero** ✅
2. **Policy briefs list** ✅ (4 placeholder items)
   - [ ] **Replace with real policy briefs:** title, year, description, PDF link
3. **Key recommendations grid** ✅ (Federal, Cantonal, Municipal)
   - [ ] Replace with official recommendations from WP 9 outputs

#### Outstanding content needed:
- [ ] Full list of policy briefs with: title, authors, date, description, PDF

---

### 9. Results: Publications — `results/publications.html`

**Status:** 🔶 Structure + filter controls + 5 placeholder entries  
**Purpose:** Filterable list of all scientific outputs

#### Sections to complete:
1. **Page hero** ✅
2. **Filter controls** ✅ (search, type, year)
   - [ ] Connect filter JS — currently uses `data-pub-item`, `data-type`, `data-year` attributes — wire up script
3. **Publications list** ✅ (5 placeholder entries)
   - [ ] **Replace with real publications** — each entry needs: year, title, authors, journal/venue, DOI link, type
4. **Empty state message** ✅

#### Filter JS note:
The `initNewsFilters()` function in `script.js` works for `[data-news-item]`. You need a separate `initPubFilters()` function for `[data-pub-item]`, or make the function generic. See `script.js` for reference.

#### Outstanding content needed:
- [ ] Complete list of publications (journal articles, conference papers, reports, deliverables)
- [ ] Agreed citation format

---

### 10. Results: Media — `results/media.html`

**Status:** 🔶 Structure + placeholder press items and video cards  
**Purpose:** Press coverage, interviews, videos, and outreach materials

#### Sections to complete:
1. **Page hero** ✅
2. **Press coverage list** ✅ (2 placeholder items)
   - [ ] Add real press articles: title, outlet, date, summary, URL
3. **Videos & webinars** ✅ (2 placeholder YouTube cards)
   - [ ] **Replace with real YouTube embeds** using `<iframe>`:
     ```html
     <iframe width="100%" height="200"
       src="https://www.youtube.com/embed/VIDEO_ID"
       title="Webinar title"
       allowfullscreen>
     </iframe>
     ```
4. **Press contact** ✅

#### Outstanding content needed:
- [ ] List of press coverage (articles, radio, TV)
- [ ] YouTube video IDs for webinar recordings

---

### 11. News & Events — `news.html`

**Status:** ✅ Structure complete — needs real news items  
**Purpose:** Filterable archive of news articles and upcoming events

#### Sections to complete:
1. **Page hero** ✅
2. **Filter controls** ✅ (search, type, year)
3. **News cards grid** ✅ (6 placeholder items)
   - [ ] **Replace with real news items** — each article is an `<article>` with `data-news-item`, `data-type`, `data-date`, `data-search` attributes
4. **Empty state** ✅

#### Adding a news item (template):
```html
<article class="news-card"
  data-news-item
  data-type="news"          <!-- "news" or "event" -->
  data-date="2025-03-15"    <!-- YYYY-MM-DD for date filtering -->
  data-search="keywords for search">
  <span class="news-date">15 Mar 2025 · News</span>
  <h3><a href="#">Article title here</a></h3>
  <p>Short 1–2 sentence summary.</p>
  <a class="news-more" href="#">Read more →</a>
</article>
```

#### Future improvements:
- [ ] Add individual news article pages (e.g. `news/2025-03-15-article-slug.html`)
- [ ] Add pagination or "Load more" button for long archives
- [ ] Consider a CMS (Contentful, Sanity, Netlify CMS) for easier news management

---

### 12. Contact — `contact.html`

**Status:** ✅ Structure complete — form not yet wired to backend  
**Purpose:** Contact form + direct contact details for the consortium

#### Sections to complete:
1. **Page hero** ✅
2. **Contact details column** ✅ (email, address, social links)
   - [ ] Confirm the Geneva address is correct
   - [ ] Add EPFL address if needed
3. **Contact form** ✅ (name, email, org, subject dropdown, message)
   - [ ] **Wire to a backend:** options include:
     - Netlify Forms (if hosted on Netlify — just add `netlify` attribute to `<form>`)
     - Formspree (`action="https://formspree.io/f/YOUR_ID"`)
     - Custom PHP mailer
   - [ ] Add success/error state handling after submit
4. **Subject dropdown** ✅ (Research, Media, Collaboration, Newsletter, Other)
   - [ ] Confirm subjects with coordination team

---

## Missing Pages to Create

| Page | Priority | Notes |
|---|---|---|
| `disclaimer.html` | Medium | Legal disclaimer — standard for Swiss research sites |
| `impressum.html` | High | Required by Swiss law |
| `privacy-policy.html` | High | GDPR-compliant privacy policy for newsletter/form data |
| `404.html` | Medium | Custom error page with nav back to home |

---

## Multilingual — Content Needed

When translations are ready, mirror the full folder structure under `/fr/` and `/de/`:

```
/fr/index.html
/fr/consortium/overview.html
/fr/consortium/team.html
/fr/consortium/partners.html
/fr/consortium/work-packages.html
/fr/results/renewable-energy-outlook.html
/fr/results/recommender-tool.html
/fr/results/policy-recommendations.html
/fr/results/publications.html
/fr/results/media.html
/fr/news.html
/fr/contact.html
/de/...  (same structure)
```

**Language switcher links** are already in place in every page, pointing to the `/fr/` and `/de/` equivalents.

---

## Technical Improvements (Future)

| Item | Priority | Notes |
|---|---|---|
| Add CSS custom properties (`--color-green`, etc.) | Medium | Makes global theming easier |
| Add `<link rel="icon">` favicons | Medium | Need favicon files from brand assets |
| Add Open Graph meta tags | Medium | Improves social sharing previews |
| Add `<meta name="description">` to all pages | Medium | SEO |
| Add `robots.txt` and `sitemap.xml` | Medium | SEO |
| Consider a static site generator (Eleventy, Hugo) | Low/Future | Eliminates repeated header/footer in every file |
| Add touch/swipe for carousel | Medium | Improves mobile UX |
| Publications filter: separate JS function | Medium | Current news filter uses different data attributes |
| Connect newsletter form to email platform | High | Mailchimp, Brevo, etc. |
| Connect contact form to email backend | High | Netlify Forms, Formspree, or custom |

---

## Image Assets Needed

| Asset | Used in | Notes |
|---|---|---|
| Carousel slide 1–4 (designed) | `index.html` | Replace current PNG/SVG placeholders with polished designs |
| Team photos (per researcher) | `consortium/team.html` | ~300×300px JPG, square crop |
| Partner logos | `consortium/partners.html` | SVG preferred, white/transparent background |
| Hero background images | Inner pages | Optional: light abstract images for page-hero sections |
| Social sharing image | All pages | 1200×630px OG image |

---

*Last updated: May 2026 | Maintained by the SWEET EDGE web team*
