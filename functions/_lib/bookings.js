// Shared booking helpers: manage-link tokens and the scheduled email set.
import { signToken, verifyToken } from './unsubscribe-token.js';
import { cancelEmail, sendEmail } from './resend.js';
import { renderBookingEmail, renderOwnerAlert } from './booking-emails.js';
import { KINDS, kindOf } from './booking-config.js';

const HOUR = 3600000;

export async function manageLink(env, base, booking) {
  const t = await signToken(`booking:${booking.id}`, env.UNSUB_SECRET);
  return `${base}${booking.lang === 'pt' ? '/pt' : ''}/book/manage/?id=${booking.id}&t=${t}`;
}

export function verifyManageToken(env, id, token) {
  return Boolean(id && token && env.UNSUB_SECRET) && verifyToken(`booking:${id}`, token, env.UNSUB_SECRET);
}

// Confirmation (or reschedule notice) now; reminders (and, for discovery calls, a follow-up) scheduled in Resend.
export async function sendBookingEmails(env, base, booking, kind = 'confirmed') {
  const link = await manageLink(env, base, booking);
  const start = new Date(booking.start_utc).getTime();
  const end = new Date(booking.end_utc).getTime();
  const now = Date.now();
  const send = (k, scheduledAt) =>
    sendEmail(env, {
      to: booking.email,
      ...renderBookingEmail(k, { booking, base, manageLink: link }),
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      idempotencyKey: `booking:${booking.id}:${k}:${booking.start_utc}`,
    });

  const [, r24, r1, fu] = await Promise.all([
    send(kind),
    start - 24 * HOUR > now + 5 * 60000 ? send('reminder24', start - 24 * HOUR) : null,
    start - HOUR > now + 5 * 60000 ? send('reminder1', start - HOUR) : null,
    KINDS[kindOf(booking.kind)].followup ? send('followup', end + 24 * HOUR) : null,
  ]);
  return { reminder24_id: r24, reminder1_id: r1, followup_id: fu };
}

export async function cancelBookingEmails(env, booking) {
  await Promise.all([booking.reminder24_id, booking.reminder1_id, booking.followup_id].filter(Boolean).map((id) => cancelEmail(env, id)));
}

export async function alertOwner(env, base, booking, kind) {
  if (!env.NOTIFY_EMAIL) return;
  const link = await manageLink(env, base, booking);
  await sendEmail(env, { to: env.NOTIFY_EMAIL, ...renderOwnerAlert(kind, { booking, manageLink: link }) }).catch((err) =>
    console.error('Booking alert error:', err)
  );
}
