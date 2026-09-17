// POST /api/my-referrals   Body (JSON): { email, lang? }
//
// Emails a subscriber their referral link and current count. The response is
// the same whether or not the address is on the list, so this can't be used
// to check who has subscribed, and the link only ever goes to the inbox that
// owns it. One email per address per 10 minutes.

import { sendEmail } from '../_lib/resend.js';
import { jsonResponse, normalizeLang, readJson, referralLink, siteUrl } from '../_lib/http.js';
import { renderEmail } from '../_lib/emails.js';

const RESEND_AFTER_MS = 10 * 60 * 1000;

const COPY = {
  en: {
    ok: "If that email is subscribed, your link is on its way.",
  },
  pt: {
    ok: 'Se esse email estiver subscrito, o seu link vai a caminho.',
  },
};

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.DB) return jsonResponse({ error: 'Referral tracking is not set up yet.' }, 503);

  const body = (await readJson(request)) || {};
  const lang = normalizeLang(body.lang);
  const email = String(body.email || '').trim().toLowerCase();
  const ok = jsonResponse({ ok: true, message: COPY[lang].ok }, 200);
  if (!email) return ok;

  const me = await env.DB
    .prepare('SELECT code, lang, link_sent_at FROM subscribers WHERE email = ? AND unsubscribed_at IS NULL')
    .bind(email)
    .first();
  if (!me) return ok;
  if (me.link_sent_at && Date.now() - Date.parse(me.link_sent_at) < RESEND_AFTER_MS) return ok;

  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM subscribers WHERE referred_by_code = ?').bind(me.code).first();
  const link = referralLink(siteUrl(env, request), me.code, me.lang);
  await env.DB.prepare('UPDATE subscribers SET link_sent_at = ? WHERE email = ?').bind(new Date().toISOString(), email).run();
  waitUntil(sendEmail(env, { to: email, ...renderEmail(`referral-link-${me.lang === 'pt' ? 'pt' : 'en'}`, { referralLink: link, count: String(n) }) }));
  return ok;
}
