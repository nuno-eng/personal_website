export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function siteUrl(env, request) {
  return (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

export function normalizeLang(lang) {
  return lang === 'pt' ? 'pt' : 'en';
}

// Referral links land on the signup page in the referrer's language, so the
// ref code is picked up by the form there.
export function referralLink(base, code, lang) {
  return `${base}${lang === 'pt' ? '/pt' : ''}/subscribe/?ref=${code}`;
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
