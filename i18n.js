// English HTML is the source of truth. Dictionaries translate individual text
// nodes and selected attributes, preserving links, icons, form values and markup.
(function () {
  'use strict';

  const STORAGE_KEY = 'sweet-edge-lang';
  const SUPPORTED = ['en', 'fr', 'de'];
  // Resolve against this script, including on project sites hosted in a subfolder.
  const baseUrl = new URL('.', document.currentScript.src);
  const originals = new WeakMap();
  const originalAttributes = new WeakMap();
  const dictionaries = { en: {} };
  const pending = {};
  const attributes = ['alt', 'title', 'placeholder', 'aria-label'];
  const excluded = 'script, style, noscript, [translate="no"], .notranslate';
  let currentLang = 'en';
  let requestId = 0;
  let initialized = false;

  const normalize = (text) => text.replace(/\s+/g, ' ').trim();

  function detectLang() {
    const pageLanguage = document.documentElement.dataset.pageLanguage;
    if (SUPPORTED.includes(pageLanguage)) return pageLanguage;
    const requested = new URL(location.href).searchParams.get('lang');
    if (SUPPORTED.includes(requested)) return requested;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) { /* Language switching also works when storage is disabled. */ }
    const browser = (navigator.language || '').split('-')[0].toLowerCase();
    return SUPPORTED.includes(browser) ? browser : 'en';
  }

  function translate(source) {
    const key = normalize(source);
    const dictionary = dictionaries[currentLang];
    if (!Object.prototype.hasOwnProperty.call(dictionary, key)) return source;
    // Retain boundary whitespace around inline links and emphasized text.
    return source.match(/^\s*/)[0] + dictionary[key] + source.match(/\s*$/)[0];
  }

  function applyText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest(excluded)) continue;
      if (!normalize(node.nodeValue)) continue;
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      node.nodeValue = translate(originals.get(node));
    }
  }

  function applyAttributes() {
    document.querySelectorAll('[alt], [title], [placeholder], [aria-label], meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').forEach((el) => {
      if (el.closest(excluded)) return;
      if (!originalAttributes.has(el)) originalAttributes.set(el, {});
      const source = originalAttributes.get(el);
      const names = el.tagName === 'META' ? ['content'] : attributes;
      names.forEach((name) => {
        if (!el.hasAttribute(name)) return;
        if (!(name in source)) source[name] = el.getAttribute(name);
        el.setAttribute(name, translate(source[name]));
      });
    });
  }

  // Use this for text created by JavaScript, such as form submission states.
  function setText(element, source) {
    if (!element) return;
    element.textContent = source;
    applyText(element);
  }

  function updateSwitcher() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-content-lang]').forEach(el => { el.hidden = el.dataset.contentLang !== currentLang; });
    document.querySelectorAll('.lang-switcher a[data-lang]').forEach((link) => {
      const active = link.dataset.lang === currentLang;
      link.classList.toggle('lang-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function showError() {
    let status = document.getElementById('language-status');
    if (!status) {
      status = document.createElement('p');
      status.id = 'language-status';
      status.setAttribute('role', 'alert');
      document.querySelector('header')?.after(status);
    }
    setText(status, 'Unable to load this language. Please try again.');
  }

  async function switchLang(lang) {
    if (!SUPPORTED.includes(lang)) return false;
    const pageLanguage = document.documentElement.dataset.pageLanguage;
    if (pageLanguage && pageLanguage !== lang) {
      const alternate = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (alternate) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
        location.assign(alternate.href);
        return true;
      }
    }
    const id = ++requestId;
    try {
      if (!dictionaries[lang]) {
        if (!pending[lang]) {
          pending[lang] = fetch(new URL(`translations/${lang}.json`, baseUrl))
            .then((response) => {
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return response.json();
            })
            .then((data) => {
              if (!data.strings || typeof data.strings !== 'object' ||
                  !Object.values(data.strings).every((value) => typeof value === 'string')) {
                throw new Error('Invalid translation dictionary');
              }
              dictionaries[lang] = data.strings;
            })
            .finally(() => { delete pending[lang]; });
        }
        await pending[lang];
      }
      // A slow download must never overwrite a newer language selection.
      if (id !== requestId) return false;
      currentLang = lang;
      document.getElementById('language-status')?.remove();
      applyText(document.documentElement);
      applyAttributes();
      updateSwitcher();
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* Optional. */ }
      // Preserve explicitly shared language URLs without changing paths or hashes.
      const url = new URL(location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', lang);
        history.replaceState(history.state, '', url);
      }
      document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
      return true;
    } catch (error) {
      if (id === requestId) showError();
      console.warn(`[i18n] Could not load ${lang} translations:`, error.message);
      return false;
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    document.querySelectorAll('.lang-switcher a[data-lang]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        switchLang(link.dataset.lang);
      });
    });
    return switchLang(detectLang());
  }

  window.sweetEdgeI18n = { switch: switchLang, detect: detectLang, init, t: translate, setText };
})();
