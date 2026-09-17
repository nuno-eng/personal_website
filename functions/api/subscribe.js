// POST /api/subscribe
//
// Body (JSON): { email, name?, lang?: 'en'|'pt', ref?, source?, honeypot? }
//
// 1. Drops honeypot-filled bot submissions and validates the email.
// 2. Adds (or re-subscribes) the contact in the Resend newsletter segment.
// 3. With the D1 binding DB: gives new subscribers a referral code, credits
//    the referrer, records which page they signed up on, sends the welcome
//    email and schedules day 3 / day 7, and (with NOTIFY_EMAIL) emails you
//    about the new lead.
//
// Environment: see NEWSLETTER-SETUP.md.

import { generateReferralCode } from '../_lib/referral.js';
import { sendWelcomeSequence } from '../_lib/send-sequence.js';
import { segmentId, sendEmail, upsertContact } from '../_lib/resend.js';
import { jsonResponse, normalizeLang, readJson, referralLink, sha256Hex, siteUrl } from '../_lib/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NEW_PER_IP_PER_HOUR = 5;

const ERRORS = {
  en: {
    invalid: 'Enter a valid email address.',
    unavailable: 'Subscriptions are temporarily unavailable.',
    failed: 'Could not subscribe you right now. Try again shortly.',
    rateLimited: 'Too many signups from this connection. Try again later.',
  },
  pt: {
    invalid: 'Introduza um email válido.',
    unavailable: 'As subscrições estão temporariamente indisponíveis.',
    failed: 'Não foi possível subscrever agora. Tente novamente dentro de momentos.',
    rateLimited: 'Demasiadas subscrições a partir desta ligação. Tente mais tarde.',
  },
};

export async function onRequestPost({ request, env, waitUntil }) {
  const body = await readJson(request);
  if (!body) return jsonResponse({ error: ERRORS.en.invalid }, 400);

  const lang = normalizeLang(body.lang);
  const errors = ERRORS[lang];
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 60);
  const ref = String(body.ref || '').trim().slice(0, 32);
  const source = String(body.source || '').trim().slice(0, 160) || null;

  // Bots fill the hidden field; pretend it worked so they move on.
  if (body.honeypot) return jsonResponse({ ok: true }, 200);

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: errors.invalid }, 400);
  }

  if (!env.RESEND_API_KEY || !segmentId(env)) {
    console.error('Missing RESEND_API_KEY or RESEND_SEGMENT_ID.');
    return jsonResponse({ error: errors.unavailable }, 500);
  }

  const base = siteUrl(env, request);
  const db = env.DB;
  let existing = null;
  let ipHash = null;

  if (db) {
    existing = await db
      .prepare('SELECT code, lang, unsubscribed_at FROM subscribers WHERE email = ?')
      .bind(email)
      .first();

    if (!existing) {
      const ip = request.headers.get('CF-Connecting-IP') || '';
      ipHash = ip ? await sha256Hex(`${ip}:${env.UNSUB_SECRET || ''}`) : null;
      if (ipHash) {
        const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const recent = await db
          .prepare('SELECT COUNT(*) AS n FROM subscribers WHERE ip_hash = ? AND created_at > ?')
          .bind(ipHash, since)
          .first();
        if (recent.n >= MAX_NEW_PER_IP_PER_HOUR) {
          return jsonResponse({ error: errors.rateLimited }, 429);
        }
      }
    }
  }

  const subscribed = await upsertContact(env, { email, firstName: name });
  if (!subscribed) return jsonResponse({ error: errors.failed }, 502);

  if (!db) return jsonResponse({ ok: true, referralLink: null }, 200);

  if (existing) {
    // Signing up again: re-activate if they had unsubscribed, but don't
    // replay the welcome sequence.
    if (existing.unsubscribed_at) {
      await db.prepare('UPDATE subscribers SET unsubscribed_at = NULL WHERE email = ?').bind(email).run();
    }
    return jsonResponse({ ok: true, referralLink: referralLink(base, existing.code, existing.lang) }, 200);
  }

  const code = await generateUniqueCode(db);
  const referredBy = ref
    ? (await db.prepare('SELECT code FROM subscribers WHERE code = ?').bind(ref).first())?.code || null
    : null;
  const link = referralLink(base, code, lang);

  await db
    .prepare(
      `INSERT INTO subscribers (email, code, referred_by_code, display_name, lang, source, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(email, code, referredBy, name || null, lang, source, ipHash, new Date().toISOString())
    .run();

  // Everything below is additive: the person is subscribed either way.
  try {
    const { day3EmailId, day7EmailId } = await sendWelcomeSequence({
      env,
      base,
      email,
      code,
      name,
      lang,
      referralLink: link,
    });
    await db
      .prepare('UPDATE subscribers SET day3_email_id = ?, day7_email_id = ? WHERE email = ?')
      .bind(day3EmailId, day7EmailId, email)
      .run();
  } catch (err) {
    console.error('Welcome sequence error:', err);
  }

  if (env.NOTIFY_EMAIL) {
    waitUntil(notifyOwner(env, { email, name, lang, source, referredBy }));
  }

  return jsonResponse({ ok: true, referralLink: link }, 200);
}

async function generateUniqueCode(db) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const clash = await db.prepare('SELECT 1 FROM subscribers WHERE code = ?').bind(code).first();
    if (!clash) return code;
  }
  return `${generateReferralCode()}${generateReferralCode()}`;
}

function notifyOwner(env, { email, name, lang, source, referredBy }) {
  const lines = [
    `Email: ${email}`,
    `Name: ${name || '-'}`,
    `Language: ${lang}`,
    `Signed up on: ${source || '-'}`,
    `Referred by code: ${referredBy || '-'}`,
  ];
  return sendEmail(env, {
    to: env.NOTIFY_EMAIL,
    subject: `New newsletter subscriber: ${email}`,
    text: lines.join('\n'),
    html: `<pre style="font:14px/1.6 monospace">${lines.map((l) => l.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))).join('\n')}</pre>`,
  }).catch((err) => console.error('Owner notification error:', err));
}
