// POST /api/my-referrals   Body (JSON): { email, lang? }
//
// Emails a subscriber their referral link and current count. The response is
// the same whether or not the address is on the list, so this can't be used
// to check who has subscribed, and the link only ever goes to the inbox that
// owns it. One email per address per 10 minutes.

import { sendEmail } from '../_lib/resend.js';
import { escapeHtml, jsonResponse, normalizeLang, readJson, referralLink, siteUrl } from '../_lib/http.js';

const RESEND_AFTER_MS = 10 * 60 * 1000;

const COPY = {
  en: {
    ok: "If that email is subscribed, your link is on its way.",
    subject: 'Your Operating Notes referral link',
    body: (link, n) => [`Here is your personal referral link:`, link, `People who have subscribed through it so far: ${n}.`],
  },
  pt: {
    ok: 'Se esse email estiver subscrito, o seu link vai a caminho.',
    subject: 'O seu link de recomendação das Notas Operacionais',
    body: (link, n) => ['Aqui está o seu link pessoal de recomendação:', link, `Pessoas que já subscreveram através dele: ${n}.`],
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
  const copy = COPY[me.lang] || COPY.en;
  const link = referralLink(siteUrl(env, request), me.code, me.lang);
  const lines = copy.body(link, n);

  await env.DB.prepare('UPDATE subscribers SET link_sent_at = ? WHERE email = ?').bind(new Date().toISOString(), email).run();
  waitUntil(
    sendEmail(env, {
      to: email,
      subject: copy.subject,
      text: lines.join('\n\n'),
      html: lines.map((l) => `<p style="font:16px/1.6 Arial,sans-serif;color:#201e1d">${escapeHtml(l)}</p>`).join(''),
    })
  );
  return ok;
}
