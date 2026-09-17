import { renderSequenceEmail } from './email-templates.js';
import { signToken } from './unsubscribe-token.js';
import { sendEmail } from './resend.js';

const DAY = 24 * 60 * 60 * 1000;

// Sends the welcome email now and schedules day 3 and day 7 through Resend's
// scheduled_at (Resend holds them, so no cron is needed). Returns the ids of
// the scheduled sends so an unsubscribe can cancel them.
export async function sendWelcomeSequence({ env, base, email, code, name, lang, referralLink }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM - skipping welcome sequence.');
    return { day3EmailId: null, day7EmailId: null };
  }

  const unsubLink = await buildUnsubLink(env, base, code, lang);
  // RFC 8058 one-click unsubscribe: Gmail and Yahoo require it for bulk
  // senders and show an "Unsubscribe" button next to the sender.
  const headers = unsubLink
    ? { 'List-Unsubscribe': `<${unsubLink}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
    : undefined;

  const send = (kind, scheduledAt) => {
    const rendered = renderSequenceEmail(kind, { lang, name, referralLink, unsubLink });
    return sendEmail(env, {
      to: email,
      ...rendered,
      scheduledAt,
      headers,
      idempotencyKey: `${kind}:${code}`,
    });
  };

  const [, day3EmailId, day7EmailId] = await Promise.all([
    send('welcome'),
    send('day3', new Date(Date.now() + 3 * DAY).toISOString()),
    send('day7', new Date(Date.now() + 7 * DAY).toISOString()),
  ]);

  return { day3EmailId, day7EmailId };
}

// Keyed by the subscriber's code rather than their address, so emails never
// sit in URLs or access logs. The HMAC stops anyone guessing a valid link
// from a (public) referral code.
export async function buildUnsubLink(env, base, code, lang) {
  if (!env.UNSUB_SECRET) return null;
  const token = await signToken(code, env.UNSUB_SECRET);
  return `${base}/api/unsubscribe?c=${code}&t=${token}&lang=${lang}`;
}
