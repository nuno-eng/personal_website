// POST /api/resource
//
// Body (JSON): { email, resource, newsletter?: boolean, source?, honeypot? }
//
// Emails the requested free resource (see _lib/resources.js), records the
// request in D1 and alerts NOTIFY_EMAIL. The person is only added to the
// newsletter when they ticked the opt-in box; that goes through the normal
// /api/subscribe flow, including the welcome sequence.

import { RESOURCES } from '../_lib/resources.js';
import { renderResourceEmail } from '../_lib/email-templates.js';
import { sendEmail } from '../_lib/resend.js';
import { ownerAlert } from '../_lib/emails.js';
import { jsonResponse, readJson, sha256Hex, siteUrl } from '../_lib/http.js';
import { onRequestPost as subscribe } from './subscribe.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_IP_PER_HOUR = 10;

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;
  const body = await readJson(request);
  if (!body) return jsonResponse({ error: 'Enter a valid email address.' }, 400);

  const email = String(body.email || '').trim().toLowerCase();
  const resource = RESOURCES[body.resource];
  const newsletter = body.newsletter === true;
  const source = String(body.source || '').trim().slice(0, 160) || null;

  if (body.honeypot) return jsonResponse({ ok: true }, 200);
  if (!resource) return jsonResponse({ error: 'That resource is not available.' }, 400);
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: 'Enter a valid email address.' }, 400);
  }
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM.');
    return jsonResponse({ error: 'Sending is temporarily unavailable. Try again later.' }, 500);
  }

  const db = env.DB;
  let ipHash = null;
  if (db) {
    const ip = request.headers.get('CF-Connecting-IP') || '';
    ipHash = ip ? await sha256Hex(`${ip}:${env.UNSUB_SECRET || ''}`) : null;
    if (ipHash) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recent = await db
        .prepare('SELECT COUNT(*) AS n FROM resource_requests WHERE ip_hash = ? AND created_at > ?')
        .bind(ipHash, since)
        .first();
      if (recent.n >= MAX_PER_IP_PER_HOUR) {
        return jsonResponse({ error: 'Too many requests from this connection. Try again later.' }, 429);
      }
    }
  }

  const id = await sendEmail(env, {
    to: email,
    ...renderResourceEmail(resource, { base: siteUrl(env, request) }),
    idempotencyKey: `resource:${body.resource}:${email}:${new Date().toISOString().slice(0, 13)}`,
  });
  if (!id) return jsonResponse({ error: 'Could not send the email right now. Try again shortly.' }, 502);

  if (db) {
    await db
      .prepare('INSERT INTO resource_requests (email, resource, newsletter, source, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(email, body.resource, newsletter ? 1 : 0, source, ipHash, new Date().toISOString())
      .run();
  }

  if (newsletter) {
    // Reuse the subscribe endpoint so opt-ins get exactly the same treatment.
    const headers = new Headers(request.headers);
    headers.delete('content-length');
    const subscribeRequest = new Request(new URL('/api/subscribe', request.url), {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, lang: 'en', source: `${source || '/free-resources/'}#${body.resource}` }),
    });
    const res = await subscribe({ ...context, request: subscribeRequest });
    if (!res.ok) console.error('Newsletter opt-in from resource request failed:', res.status, await res.text());
  }

  if (env.NOTIFY_EMAIL) {
    waitUntil(
      sendEmail(env, {
        to: env.NOTIFY_EMAIL,
        ...ownerAlert({
          title: `Free resource request: ${resource.title}`,
          heading: 'Free resource request',
          intro: `${email} asked for ${resource.title}.`,
          rows: [['Email', email], ['Resource', resource.title], ['Newsletter opt-in', newsletter ? 'yes' : 'no'], ['Page', source || '-']],
        }),
      }).catch((err) => console.error('Owner notification error:', err))
    );
  }

  return jsonResponse({ ok: true }, 200);
}
