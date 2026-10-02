"""Browser regression checks. Run: python3 scripts/test_i18n.py (requires Playwright)."""
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(str(p.relative_to(ROOT)) for folder in ['', 'consortium', 'results']
               for p in (ROOT / folder).glob('*.html'))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path.startswith('/preview/'):
            self.path = self.path[len('/preview'):]
        try:
            super().do_GET()
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, *args):
        pass

@contextmanager
def server():
    httpd = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{httpd.server_port}'
    finally:
        httpd.shutdown()
        httpd.server_close()

SNAPSHOT = """() => ({
  title: document.title,
  body: document.body.textContent,
  attrs: [...document.querySelectorAll('[alt], [title], [placeholder], [aria-label]')]
    .map(el => ['alt','title','placeholder','aria-label'].map(a => el.getAttribute(a))),
  links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')),
  controls: [...document.querySelectorAll('input, select, textarea')].map(el => el.value)
})"""

def switch(page, lang):
    assert page.evaluate('(lang) => window.sweetEdgeI18n.switch(lang)', lang)
    assert page.locator('html').get_attribute('lang') == lang
    assert page.locator('.lang-switcher [aria-current="true"]').get_attribute('data-lang') == lang

def open_page(page, url):
    page.goto(url, wait_until='domcontentloaded')
    page.wait_for_selector('.lang-switcher')
    page.wait_for_function('!!window.sweetEdgeI18n')
    switch(page, 'en')

def run():
    dictionaries = {lang: json.loads((ROOT / f'translations/{lang}.json').read_text())['strings']
                    for lang in ['de', 'fr']}
    assert dictionaries['de'].keys() == dictionaries['fr'].keys()
    assert all(value.strip() for data in dictionaries.values() for value in data.values())
    with server() as base, sync_playwright() as p:
        options = {}
        chrome = os.environ.get('CHROME_EXECUTABLE', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        if Path(chrome).exists():
            options['executable_path'] = chrome
        browser = p.chromium.launch(**options)
        context = browser.new_context(locale='en-GB', viewport={'width': 1440, 'height': 1000})
        # No external services are contacted and no real forms are submitted.
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        for prefix in ['', '/preview']:
            for path in PAGES:
                open_page(page, f'{base}{prefix}/{path}?lang=en')
                original = page.evaluate(SNAPSHOT)
                for lang in ['de', 'fr', 'de', 'en']:
                    switch(page, lang)
                    current = page.evaluate(SNAPSHOT)
                    assert current['links'] == original['links'], (path, lang, 'links changed')
                    assert current['controls'] == original['controls'], (path, lang, 'control values changed')
                    if lang != 'en':
                        assert current['title'] == dictionaries[lang][original['title']], (path, lang)
                        assert current['body'] != original['body'], (path, lang, 'not translated')
                assert page.evaluate(SNAPSHOT) == original, (path, 'English not restored exactly')
        print(f'PASS: {len(PAGES)} pages × root/subfolder × DE/FR/DE/EN, links and form values preserved')

        open_page(page, base + '/contact.html')
        page.locator('#contact-name').fill('Test User')
        page.locator('#contact-message').fill('Keep this message')
        switch(page, 'fr')
        assert page.locator('#contact-name').input_value() == 'Test User'
        assert page.locator('#contact-message').input_value() == 'Keep this message'
        assert page.locator('#contact-name').get_attribute('placeholder') == 'Votre nom complet'
        assert page.locator('label[for="contact-name"] span').text_content() == '*'
        page.locator('#contact-email').fill('test@example.org')
        page.locator('#contact-subject').select_option('research')
        page.route('https://formspree.io/**', lambda route: route.fulfill(status=500, body='{}'))
        page.locator('button[type="submit"]').click()
        page.wait_for_selector('.form-error:visible')
        assert page.locator('button[type="submit"]').text_content() == 'Envoyer le message'
        switch(page, 'de')
        assert page.locator('button[type="submit"]').text_content() == 'Nachricht senden'
        assert page.locator('.form-error a').get_attribute('href') == 'mailto:info@sweet-edge.ch'
        page.unroute('https://formspree.io/**')
        print('PASS: contact placeholders, required markers, typed input, translated form errors')

        open_page(page, base + '/results/policy-recommendations.html')
        category = page.locator('#policy-category option').nth(1).get_attribute('value')
        page.locator('#policy-category').select_option(category)
        count = page.locator('[data-policy-recommendations-grid] .card:visible').count()
        assert count > 0
        for lang in ['fr', 'de', 'en']:
            switch(page, lang)
            assert page.locator('[data-policy-recommendations-grid] .card:visible').count() == count
            assert page.locator('#policy-category').input_value() == category
        print('PASS: category filters survive language changes')

        open_page(page, base + '/news.html')
        switch(page, 'fr')
        page.locator('#news-search').fill('communes')
        assert page.locator('[data-news-item]:visible').count() == 2
        switch(page, 'de')
        assert page.locator('[data-news-item]:visible').count() == 0
        page.locator('#news-search').fill('Gemeinden')
        assert page.locator('[data-news-item]:visible').count() == 2
        print('PASS: search includes translated content and refreshes after switching')

        page.goto(base + '/contact.html', wait_until='domcontentloaded')
        page.wait_for_function("document.documentElement.lang === 'de'")
        assert page.locator('h1').text_content() == 'Kontakt'
        print('PASS: saved language persists across navigation')

        # Blocked localStorage must not prevent rendering or switching.
        isolated = browser.new_context(locale='fr-CH')
        isolated.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
        isolated.add_init_script("Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });")
        storage_page = isolated.new_page()
        storage_page.goto(base + '/contact.html', wait_until='domcontentloaded')
        storage_page.wait_for_function("document.documentElement.lang === 'fr'")
        switch(storage_page, 'de')
        switch(storage_page, 'en')
        isolated.close()
        print('PASS: browser language detection and blocked storage')

        # Hold both responses and deliver the earlier language last.
        race = context.new_page()
        open_page(race, base + '/contact.html?lang=en')
        held = {}
        race.route('**/translations/*.json', lambda route: held.update({Path(route.request.url).stem: route}))
        race.evaluate("() => { window.sweetEdgeI18n.switch('de'); window.sweetEdgeI18n.switch('fr'); }")
        for _ in range(100):
            if len(held) == 2:
                break
            race.wait_for_timeout(20)
        assert len(held) == 2
        held['fr'].fulfill(json={'strings': dictionaries['fr']})
        race.wait_for_function("document.documentElement.lang === 'fr'")
        held['de'].fulfill(json={'strings': dictionaries['de']})
        race.wait_for_timeout(100)
        assert race.locator('html').get_attribute('lang') == 'fr'
        race.close()
        print('PASS: out-of-order downloads keep the latest language selection')

        failed = context.new_page()
        open_page(failed, base + '/contact.html?lang=en')
        failed.route('**/translations/de.json', lambda route: route.fulfill(status=503, body='Unavailable'))
        assert not failed.evaluate("window.sweetEdgeI18n.switch('de')")
        assert failed.locator('html').get_attribute('lang') == 'en'
        assert failed.locator('#language-status').is_visible()
        failed.unroute('**/translations/de.json')
        switch(failed, 'de')
        assert failed.locator('#language-status').count() == 0
        failed.close()
        print('PASS: failed download retains English, shows an error and can retry')

        overflow = []
        for width in [1440, 390]:
            page.set_viewport_size({'width': width, 'height': 900})
            for path in PAGES:
                open_page(page, f'{base}/{path}?lang=en')
                for lang in ['de', 'fr']:
                    switch(page, lang)
                    if page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'):
                        overflow.append((path, lang, width))
            open_page(page, base + '/consortium/partners.html')
            switch(page, 'de')
            page.wait_for_timeout(700)
            page.screenshot(path=f'/tmp/sweet-edge-partners-de-{width}.png')
            page.evaluate('window.scrollTo(0, 550)')
            page.wait_for_timeout(700)
            page.screenshot(path=f'/tmp/sweet-edge-partners-cards-de-{width}.png')
        assert not overflow, ('Horizontal overflow', overflow)
        assert not errors, errors
        browser.close()
        print('PASS: all pages fit desktop and mobile widths; no JavaScript errors')
        print(f'PASS: {len(dictionaries["de"])} matching translation entries per language')

if __name__ == '__main__':
    run()
