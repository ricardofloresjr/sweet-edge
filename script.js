// -----------------------------------------------
// SWEET EDGE — Main Script
// -----------------------------------------------

// -----------------------------------------------
// 1. SHARED HTML INCLUDES
// -----------------------------------------------
function getSiteBasePath() {
  const script = document.querySelector('script[src$="script.js"]');
  if (!script) return '/';

  const scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  return new URL('.', scriptUrl).pathname;
}

function toSiteUrl(path) {
  if (!path || !path.startsWith('/')) return path;
  return `${getSiteBasePath()}${path.slice(1)}`;
}

function rewriteRootRelativeUrls(scope) {
  scope.querySelectorAll('[href^="/"], [src^="/"], [action^="/"]').forEach((el) => {
    ['href', 'src', 'action'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value?.startsWith('/')) el.setAttribute(attr, toSiteUrl(value));
    });
  });
}

async function loadIncludes() {
  const includeTargets = Array.from(document.querySelectorAll('[data-include]'));
  if (!includeTargets.length) return;

  await Promise.all(includeTargets.map(async (target) => {
    const url = target.dataset.include;
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      target.outerHTML = await response.text();
    } catch (err) {
      console.warn(`[includes] Could not load ${url}:`, err.message);
    }
  }));

  rewriteRootRelativeUrls(document);
}

// -----------------------------------------------
// 2. CAROUSEL
// -----------------------------------------------
let currentSlide = 0;
let autoplayInterval = null;

const slideContainer = document.querySelector('.slides');
const slides = slideContainer ? slideContainer.querySelectorAll('.slide') : [];
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;

if (slideContainer && totalSlides > 0) {
  slideContainer.style.width = `${totalSlides * 100}%`;
  const slideWidth = 100 / totalSlides;
  slides.forEach((slide) => {
    slide.style.flex = `0 0 ${slideWidth}%`;
  });
}

function updateSlide() {
  if (!slideContainer || totalSlides === 0) return;
  const offset = -(100 / totalSlides) * currentSlide;
  slideContainer.style.transform = `translateX(${offset}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function changeSlide(direction) {
  if (totalSlides === 0) return;
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateSlide();
}

function goToSlide(index) {
  if (index < 0 || index >= totalSlides) return;
  currentSlide = index;
  updateSlide();
}

function startAutoplay() {
  if (totalSlides === 0) return;
  stopAutoplay();
  autoplayInterval = setInterval(() => changeSlide(1), 5000);
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
}

// -----------------------------------------------
// 3. HAMBURGER MENU
// -----------------------------------------------
function initHamburger() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
    const topLink = dropdown.querySelector(':scope > a');
    topLink?.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle('is-open');
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
    }
  });
}

// -----------------------------------------------
// 4. SCROLL FADE-IN ANIMATIONS
// -----------------------------------------------
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.homepage-section, .news-card, .page-hero, .card, .pub-item, .partner-card'
  );
  if (!targets.length) return;

  targets.forEach((el) => el.classList.add('fade-in-ready'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  targets.forEach((el) => observer.observe(el));
}

// -----------------------------------------------
// 5. NEWS & EVENTS FILTERS
// -----------------------------------------------
function initNewsFilters() {
  const cards = Array.from(document.querySelectorAll('[data-news-item]'));
  if (!cards.length) return;

  const searchInput = document.querySelector('#news-search');
  const typeSelect = document.querySelector('#filter-type');
  const dateSelect = document.querySelector('#filter-date');
  const emptyState = document.querySelector('.news-empty-state');

  function applyFilters() {
    const selectedType = typeSelect ? typeSelect.value : 'all';
    const selectedDate = dateSelect ? dateSelect.value : 'any';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const itemType = card.dataset.type || 'news';
      const itemDate = card.dataset.date || '';
      const searchText = (card.dataset.search || card.textContent || '').toLowerCase();

      const matchesType = selectedType === 'all' || itemType === selectedType;
      const matchesDate = selectedDate === 'any' || itemDate.startsWith(selectedDate);
      const matchesSearch = !query || searchText.includes(query);

      const visible = matchesType && matchesDate && matchesSearch;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  searchInput?.addEventListener('input', applyFilters);
  typeSelect?.addEventListener('change', applyFilters);
  dateSelect?.addEventListener('change', applyFilters);

  applyFilters();
}

// -----------------------------------------------
// 6. PUBLICATIONS FILTERS
// -----------------------------------------------
function initPubFilters() {
  const items = Array.from(document.querySelectorAll('[data-pub-item]'));
  if (!items.length) return;

  const searchInput = document.querySelector('#pub-search');
  const typeSelect = document.querySelector('#pub-type');
  const yearSelect = document.querySelector('#pub-year');
  const emptyState = document.querySelector('.pub-empty-state');

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const type = typeSelect ? typeSelect.value : 'all';
    const year = yearSelect ? yearSelect.value : 'any';
    let count = 0;

    items.forEach((item) => {
      const searchText = (item.dataset.search || item.textContent || '').toLowerCase();
      const matchesSearch = !query || searchText.includes(query);
      const matchesType = type === 'all' || item.dataset.type === type;
      const matchesYear = year === 'any' || item.dataset.year === year;
      const visible = matchesSearch && matchesType && matchesYear;
      item.style.display = visible ? '' : 'none';
      if (visible) count++;
    });

    if (emptyState) emptyState.hidden = count !== 0;
  }

  searchInput?.addEventListener('input', applyFilters);
  typeSelect?.addEventListener('change', applyFilters);
  yearSelect?.addEventListener('change', applyFilters);

  applyFilters();
}

// -----------------------------------------------
// 7. POLICY RECOMMENDATION FILTERS
// -----------------------------------------------
function initPolicyRecommendationFilters() {
  const grid = document.querySelector('[data-policy-recommendations-grid]');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.card'));
  const categorySelect = document.querySelector('#policy-category');
  const emptyState = document.querySelector('.policy-empty-state');
  if (!cards.length || !categorySelect) return;

  const sourceLinks = [
    { count: 16, url: 'https://boris-portal.unibe.ch/server/api/core/bitstreams/e70c289b-2e23-4890-bda1-c1c054dcc97f/content' },
    { count: 15, url: 'https://doi.org/10.1016/j.enpol.2025.114939' },
    { count: 5, url: 'https://sl1nk.com/hyk0ws7' },
    { count: 2, url: 'https://doi.org/10.3929/ethz-b-000596612' },
  ];
  const cardSourceUrls = sourceLinks.flatMap((source) => Array(source.count).fill(source.url));

  cards.forEach((card, index) => {
    if (card.querySelector('.card-read-more')) return;

    const sourceUrl = cardSourceUrls[index];
    if (!sourceUrl) return;

    const title = card.querySelector('h3')?.textContent.trim() || 'this recommendation';
    const link = document.createElement('a');
    link.className = 'card-read-more';
    link.href = sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `Read more about ${title}`);
    link.textContent = 'Read more';
    card.append(link);
  });

  const categories = [...new Set(cards.map((card) => {
    const tag = card.querySelector('.card-tag');
    return tag ? tag.textContent.trim() : '';
  }).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  });

  function applyFilters() {
    const selectedCategory = categorySelect.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const tag = card.querySelector('.card-tag');
      const category = tag ? tag.textContent.trim() : '';
      const visible = selectedCategory === 'all' || category === selectedCategory;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  categorySelect.addEventListener('change', applyFilters);
  applyFilters();
}

// -----------------------------------------------
// 8. ACTIVE NAV DETECTION
// -----------------------------------------------
function initActiveNav() {
  const path = window.location.pathname;
  const normalize = (s) => s.replace(/\/$/, '').split('?')[0];

  document.querySelectorAll('nav a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    if (normalize(path) === normalize(href)) {
      link.classList.add('active');
      const dropdown = link.closest('.dropdown');
      if (dropdown) dropdown.querySelector(':scope > a')?.classList.add('active');
    }
  });
}

// -----------------------------------------------
// 9. CONTACT FORM (Formspree AJAX)
// -----------------------------------------------
function initContactForm() {
  const form = document.querySelector('[data-form="contact"]');
  if (!form) return;

  const successMsg = document.querySelector('.form-success');
  const errorMsg = document.querySelector('.form-error');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    if (errorMsg) errorMsg.hidden = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      form.reset();
      form.hidden = true;
      if (successMsg) successMsg.hidden = false;
    } catch {
      if (errorMsg) errorMsg.hidden = false;
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
    }
  });
}

// -----------------------------------------------
// 10. NEWSLETTER FORM (Formspree AJAX)
// -----------------------------------------------
function initNewsletterForm() {
  const form = document.querySelector('[data-form="newsletter"]');
  if (!form) return;

  const successMsg = document.querySelector('.newsletter-success');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Subscribing…'; }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      form.style.display = 'none';
      if (successMsg) successMsg.hidden = false;
    } catch {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Subscribe'; }
      alert('Something went wrong. Please try again or email us at info@sweet-edge.ch');
    }
  });
}

// -----------------------------------------------
// 11. INIT ON DOM READY
// -----------------------------------------------
window.addEventListener('DOMContentLoaded', async () => {
  await loadIncludes();

  if (totalSlides > 0) {
    updateSlide();
    startAutoplay();
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
    }
  }

  initHamburger();
  initScrollAnimations();
  initNewsFilters();
  initPubFilters();
  initPolicyRecommendationFilters();
  initActiveNav();
  window.sweetEdgeI18n?.init();
  initContactForm();
  initNewsletterForm();
});
