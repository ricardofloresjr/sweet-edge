import YAML from 'yaml';
export function cmsConfig(env = process.env) {
  const field = (name, label, widget = 'string', options = {}) => ({ name, label, widget, i18n: true, ...options });
  const shared = (name, label, widget, options = {}) => field(name, label, widget, { i18n: 'duplicate', ...options });
  const config = {
    backend: { name: 'github', repo: 'ricardofloresjr/sweet-edge', branch: env.CMS_BRANCH || env.BRANCH || 'main', base_url: 'https://api.netlify.com', auth_endpoint: 'auth', squash_merges: true },
    local_backend: true,
    publish_mode: 'editorial_workflow',
    media_folder: 'images/uploads', public_folder: '/images/uploads',
    site_url: env.DEPLOY_PRIME_URL || env.SITE_URL || env.URL || 'https://www.sweet-edge.ch',
    display_url: env.SITE_URL || 'https://www.sweet-edge.ch',
    logo_url: '/images/sweet-edge-logo.png',
    i18n: { structure: 'single_file', locales: ['en', 'de', 'fr'], default_locale: 'en' },
    collections: [{
      name: 'posts', label: 'News & Events', label_singular: 'Post', folder: 'content/posts', create: true,
      format: 'json', extension: 'json', i18n: true, slug: '{{slug}}',
      preview_path: 'news/{{slug}}/',
      summary: '{{title}} · {{kind}}',
      sortable_fields: ['title', 'date', 'event_date'],
      fields: [
        field('title', 'Title'),
        shared('kind', 'Type', 'select', { options: [{ label: 'News', value: 'news' }, { label: 'Event', value: 'event' }], default: 'news' }),
        shared('draft', 'Hide from website', 'boolean', { default: false, hint: 'Use Save draft for work in progress. Turn this on only to keep a published entry off the public website.' }),
        shared('date', 'Publication date', 'datetime', { required: false, date_format: 'YYYY-MM-DD', time_format: false, format: 'YYYY-MM-DD', default: '', hint: 'Required for news. For imported events this is blank when the original publication date is unknown. Future news appears after the next build on or after this date.' }),
        field('summary', 'Card summary', 'text', { hint: 'A short introduction shown on the homepage and News & Events page.' }),
        field('image', 'Cover image', 'image', { required: false, choose_url: false }),
        field('image_alt', 'Image description', 'string', { required: false }),
        field('image_credit', 'Image credit', 'string', { required: false }),
        field('body', 'Article', 'markdown'),
        shared('event_date', 'Event start date', 'datetime', { required: false, date_format: 'YYYY-MM-DD', time_format: false, format: 'YYYY-MM-DD', default: '', hint: 'Required for events; leave blank for news.' }),
        shared('event_end_date', 'Event last date (optional)', 'datetime', { required: false, date_format: 'YYYY-MM-DD', time_format: false, format: 'YYYY-MM-DD', default: '', hint: 'For separate sessions, describe the individual dates in the article.' }),
        shared('event_time', 'Event start time', 'string', { required: false, pattern: ['^([01][0-9]|2[0-3]):[0-5][0-9]$', 'Use 24-hour time, such as 11:30.'] }),
        shared('timezone', 'Event timezone', 'string', { default: 'Europe/Zurich', required: false }),
        field('event_location', 'Event location', 'string', { required: false }),
        shared('registration_url', 'Registration link', 'string', { required: false, pattern: ['^https://', 'Enter an HTTPS URL.'] }),
        shared('source_url', 'Original source URL', 'hidden', { required: false }),
        shared('legacy_paths', 'Original URLs', 'hidden', { required: false })
      ]
    }]
  };
  const domain = env.CMS_SITE_DOMAIN || (env.URL ? new URL(env.URL).hostname : '');
  if (domain) config.site_domain = domain;
  return config;
}
export default class {
  data() { return { permalink: '/admin/config.yml', eleventyExcludeFromCollections: true }; }
  render() { return YAML.stringify(cmsConfig()); }
}
