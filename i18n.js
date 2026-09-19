// -----------------------------------------------
// SWEET EDGE — Internationalisation (i18n)
// Supported: en (default), fr, de
// Translations live in /translations/{lang}.json
// Language preference is stored in localStorage.
// -----------------------------------------------
(function () {
  'use strict';

  const STORAGE_KEY = 'sweet-edge-lang';
  const SUPPORTED = ['en', 'fr', 'de'];

  // ---- Language detection ----

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || '').split('-')[0].toLowerCase();
    if (SUPPORTED.includes(browser)) return browser;
    return 'en';
  }

  // ---- Page key from URL ----

  function getPageKey(pathname) {
    let key = pathname.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    if (key === '' || key === 'index') return 'index';
    return key; // e.g. "consortium/overview", "results/publications"
  }

  // ---- Translation URL (relative, works locally + on GH Pages) ----

  function translationUrl(lang) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const depth = Math.max(0, segments.length - 1);
    const prefix = '../'.repeat(depth);
    return `${prefix}translations/${lang}.json`;
  }

  // ---- Apply nav translations (target by href, no data-* needed) ----

  function applyNav(t) {
    if (!t.nav) return;
    const map = {
      '/index.html': t.nav.home,
      '/consortium/overview.html': t.nav.overview,
      '/consortium/team.html': t.nav.team,
      '/consortium/partners.html': t.nav.partners,
      '/consortium/work-packages.html': t.nav['work-packages'],
      '/results/synthesis.html': t.nav.synthesis,
      '/results/renewable-energy-outlook.html': t.nav.reo,
      '/results/recommender-tool.html': t.nav.recommender,
      '/results/policy-recommendations.html': t.nav.policy,
      '/results/publications.html': t.nav.publications,
      '/results/media.html': t.nav.media,
      '/news.html': t.nav.news,
      '/contact.html': t.nav.contact,
    };

    document.querySelectorAll('nav a[href]').forEach(function (a) {
      const href = a.getAttribute('href');
      const text = a.textContent.trim();
      const path = href ? new URL(href, window.location.href).pathname : '';
      const mapKey = Object.keys(map).find(function (key) { return path.endsWith(key); });

      if (path.endsWith('/results/media.html') && new URL(href, window.location.href).hash === '#videos-webinars') {
        if (t.nav.videos) a.textContent = t.nav.videos;
      } else if (mapKey) {
        a.textContent = map[mapKey];
      } else if (href === '#' && text === 'Consortium' && t.nav.consortium) {
        a.textContent = t.nav.consortium;
      } else if (href === '#' && text === 'Outputs' && t.nav.results) {
        a.textContent = t.nav.results;
      }
      // Handle already-translated dropdown labels on subsequent switches
      else if (href === '#' && t.nav.consortium &&
        (text === t.nav.consortium || KNOWN_CONSORTIUM_LABELS.includes(text))) {
        a.textContent = t.nav.consortium;
      } else if (href === '#' && t.nav.results &&
        (text === t.nav.results || KNOWN_RESULTS_LABELS.includes(text))) {
        a.textContent = t.nav.results;
      }
    });
  }

  // Labels that the nav dropdown parents can take after translation
  var KNOWN_CONSORTIUM_LABELS = ['Consortium', 'Konsortium'];
  var KNOWN_RESULTS_LABELS = ['Outputs', 'Résultats', 'Ergebnisse'];

  // ---- Apply footer translations ----

  function applyFooter(t) {
    if (!t.footer) return;

    // Column headings (strong tags)
    document.querySelectorAll('.site-footer strong').forEach(function (el) {
      const txt = el.textContent.trim();
      if (txt === 'Quick links' && t.footer['quick-links']) el.textContent = t.footer['quick-links'];
      else if (txt === 'Legal' && t.footer.legal) el.textContent = t.footer.legal;
      else if (txt === 'Contact' && t.footer['contact-col']) el.textContent = t.footer['contact-col'];
      else if ((txt === 'Follow us' || txt === 'Follow SWEET EDGE') && t.footer.follow) el.textContent = t.footer.follow;
    });

    // Stable hooks work on every language switch, including FR -> DE.
    document.querySelectorAll('[data-funding-acknowledgement]').forEach(function (p) {
      if (t.footer.funded) p.textContent = t.footer.funded;
    });
    document.querySelectorAll('[data-sfoe-disclaimer]').forEach(function (p) {
      if (t.footer['sfoe-disclaimer']) p.textContent = t.footer['sfoe-disclaimer'];
    });
    document.querySelectorAll('[data-sweet-link]').forEach(function (a) {
      if (t.footer['sweet-link']) a.textContent = t.footer['sweet-link'];
    });

    // Legal links by href
    document.querySelectorAll('.site-footer a[href]').forEach(function (a) {
      const href = a.getAttribute('href');
      const path = href ? new URL(href, window.location.href).pathname : '';
      if (path.endsWith('/disclaimer.html') && t.footer.disclaimer) a.textContent = t.footer.disclaimer;
      else if (path.endsWith('/impressum.html') && t.footer.impressum) a.textContent = t.footer.impressum;
      else if (path.endsWith('/privacy-policy.html') && t.footer.privacy) a.textContent = t.footer.privacy;
    });

    // Footer-bottom copyright
    const copyright = document.querySelector('.footer-bottom p');
    if (copyright && t.footer.copyright) copyright.textContent = t.footer.copyright;
  }

  // ---- Apply page-specific translations ----

  function applyPageContent(t, pageKey) {
    const pg = t.pages && t.pages[pageKey];
    if (!pg) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const translated = pg[el.dataset.i18n];
      if (translated) el.textContent = translated;
    });

    // Page hero (used by all inner pages)
    const hero = document.querySelector('.page-hero');
    if (hero) {
      const eyebrow = hero.querySelector('.eyebrow');
      const h1 = hero.querySelector('h1');
      const lead = hero.querySelector('.lead');
      if (eyebrow && pg.eyebrow) eyebrow.textContent = pg.eyebrow;
      if (h1 && pg.h1) h1.textContent = pg.h1;
      if (lead && pg.lead) lead.textContent = pg.lead;
    }

    // Home page — special section headings and key text
    if (pageKey === 'index') {
      translateText('.mission-section h1', pg['mission.h1']);
      translateText('.guiding-question h2', pg['guiding.h2']);
      translateText('.guiding-question p', pg['guiding.text']);
      translateText('.sweet-section h1', pg['sweet.h1']);
      translateText('.news-events .section-header h2', pg['news.h2']);
      translateText('.newsletter-signup h2', pg['newsletter.h2']);
      // Newsletter lead paragraph (first <p> inside .newsletter-content)
      const nlLead = document.querySelector('.newsletter-content p');
      if (nlLead && pg['newsletter.p']) nlLead.textContent = pg['newsletter.p'];
    }
  }

  function translateText(selector, value) {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  // ---- Update lang switcher UI ----

  function updateSwitcher(lang) {
    document.querySelectorAll('.lang-switcher a[data-lang]').forEach(function (a) {
      const isActive = a.dataset.lang === lang;
      a.classList.toggle('lang-active', isActive);
      if (isActive) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    document.documentElement.lang = lang === 'fr' ? 'fr' : lang === 'de' ? 'de' : 'en';
  }

  // ---- Core switch function ----

  var cachedTranslations = {};

  async function switchLang(lang) {
    if (!SUPPORTED.includes(lang)) return;

    if (lang === 'en') {
      localStorage.setItem(STORAGE_KEY, 'en');
      // Reload to restore original English HTML
      if (document.documentElement.lang !== 'en') location.reload();
      else updateSwitcher('en');
      return;
    }

    try {
      if (!cachedTranslations[lang]) {
        const res = await fetch(translationUrl(lang));
        if (!res.ok) throw new Error('HTTP ' + res.status);
        cachedTranslations[lang] = await res.json();
      }

      const t = cachedTranslations[lang];
      const pageKey = getPageKey(window.location.pathname);

      applyNav(t);
      applyFooter(t);
      applyPageContent(t, pageKey);
      updateSwitcher(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      console.warn('[i18n] Could not load ' + lang + ' translations:', err.message);
      console.info('[i18n] Make sure you are running a local server (e.g. VS Code Live Server) — fetch() does not work with file:// URLs.');
    }
  }

  // ---- Init ----

  function initI18n() {
    // Wire lang switcher buttons
    document.querySelectorAll('.lang-switcher a[data-lang]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        switchLang(a.dataset.lang);
      });
    });

    // Apply stored/detected language on load
    const lang = detectLang();
    if (lang !== 'en') {
      switchLang(lang);
    } else {
      updateSwitcher('en');
    }
  }

  // Public API
  window.sweetEdgeI18n = { switch: switchLang, detect: detectLang, init: initI18n };
})();
