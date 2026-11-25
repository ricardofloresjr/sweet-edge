// Newsletter signup → Brevo (double opt-in), with a confirmation email in the visitor's language.
//
// Netlify environment variables:
//   BREVO_API_KEY              Brevo API v3 key (required)
//   BREVO_LIST_ID              default contact list ID
//   BREVO_DOI_TEMPLATE_ID      default double opt-in template ID
// Per language (each falls back to the default above; every language needs one or the other):
//   BREVO_DOI_TEMPLATE_ID_EN / _DE / _FR   double opt-in template for that language
//   BREVO_LIST_ID_EN / _DE / _FR           separate list for that language
//   BREVO_REDIRECT_URL_EN / _DE / _FR      page shown after confirming
// Optional:
//   BREVO_REDIRECT_URL         default page shown after confirming (defaults to https://sweet-edge.ch/)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGES = ['en', 'de', 'fr'];

// The live site (sweet-edge.ch) is hosted on GitHub Pages and calls this function
// cross-origin, so those origins must be allowed explicitly.
const ALLOWED_ORIGINS = ['https://sweet-edge.ch', 'https://www.sweet-edge.ch'];

// Per-language setting, falling back to the default one.
const setting = (name, lang) => process.env[`${name}_${lang.toUpperCase()}`] || process.env[name];

export default async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = ALLOWED_ORIGINS.includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        Vary: 'Origin',
      }
    : {};
  const json = (status, body) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let data;
  try {
    data = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  // Honeypot: bots fill the hidden field. Pretend success so they don't retry.
  if (data._gotcha) return json(200, { ok: true });

  const email = String(data.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json(400, { error: 'Invalid email address' });
  }

  const requested = String(data.lang || '').slice(0, 2).toLowerCase(); // "de-CH" → "de"
  const lang = LANGUAGES.includes(requested) ? requested : 'en';

  const { BREVO_API_KEY } = process.env;
  const listId = setting('BREVO_LIST_ID', lang);
  const templateId = setting('BREVO_DOI_TEMPLATE_ID', lang);
  const missing = [
    !BREVO_API_KEY && 'BREVO_API_KEY',
    !listId && `BREVO_LIST_ID_${lang.toUpperCase()} (or BREVO_LIST_ID)`,
    !templateId && `BREVO_DOI_TEMPLATE_ID_${lang.toUpperCase()} (or BREVO_DOI_TEMPLATE_ID)`,
  ].filter(Boolean);
  if (missing.length) {
    console.error(`Newsletter (${lang}): missing Netlify environment variable(s): ${missing.join(', ')}`);
    return json(500, { error: 'Newsletter is not configured', missing });
  }

  const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      includeListIds: [Number(listId)],
      templateId: Number(templateId),
      redirectionUrl: setting('BREVO_REDIRECT_URL', lang) || 'https://sweet-edge.ch/',
    }),
  });

  // 201 = new contact, 204 = existing contact updated. Both are fine.
  if (res.ok) return json(200, { ok: true });

  const detail = await res.text().catch(() => '');
  console.error(`Newsletter (${lang}): Brevo responded ${res.status}: ${detail}`);
  return json(502, { error: 'Subscription failed' });
};
