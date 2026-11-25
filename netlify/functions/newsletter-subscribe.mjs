// Newsletter signup → Brevo (double opt-in).
// Required Netlify environment variables:
//   BREVO_API_KEY           Brevo API v3 key (SMTP & API → API Keys)
//   BREVO_LIST_ID           numeric ID of the newsletter contact list
//   BREVO_DOI_TEMPLATE_ID   numeric ID of the double opt-in confirmation template
// Optional:
//   BREVO_REDIRECT_URL      page shown after the subscriber clicks the confirmation link
//                           (defaults to the site's home page)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The live site (sweet-edge.ch) is hosted on GitHub Pages and calls this function
// cross-origin, so those origins must be allowed explicitly.
const ALLOWED_ORIGINS = ['https://sweet-edge.ch', 'https://www.sweet-edge.ch'];

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

  const { BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, BREVO_REDIRECT_URL, URL } = process.env;
  if (!BREVO_API_KEY || !BREVO_LIST_ID || !BREVO_DOI_TEMPLATE_ID) {
    console.error('Newsletter: missing Brevo environment variables');
    return json(500, { error: 'Newsletter is not configured' });
  }

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

  const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      includeListIds: [Number(BREVO_LIST_ID)],
      templateId: Number(BREVO_DOI_TEMPLATE_ID),
      redirectionUrl: BREVO_REDIRECT_URL || `${URL || 'https://www.sweet-edge.ch'}/`,
    }),
  });

  // 201 = new contact, 204 = existing contact updated. Both are fine.
  if (res.ok) return json(200, { ok: true });

  const detail = await res.text().catch(() => '');
  console.error(`Newsletter: Brevo responded ${res.status}: ${detail}`);
  return json(502, { error: 'Subscription failed' });
};
