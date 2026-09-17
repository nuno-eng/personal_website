// GET  /api/booking/manage?id=&t=               -> booking summary for the manage page
// POST /api/booking/manage { id, t, action: 'cancel' | 'reschedule', start? }
import { BOOKING } from '../../_lib/booking-config.js';
import { isSlotAvailable } from '../../_lib/availability.js';
import { calendarConfigured, deleteEvent, moveEvent } from '../../_lib/google-calendar.js';
import { alertOwner, cancelBookingEmails, sendBookingEmails, verifyManageToken } from '../../_lib/bookings.js';
import { renderBookingEmail } from '../../_lib/booking-emails.js';
import { sendEmail } from '../../_lib/resend.js';
import { jsonResponse, readJson, siteUrl } from '../../_lib/http.js';

async function load(env, id, token) {
  if (!env.DB || !(await verifyManageToken(env, id, token))) return null;
  return env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const booking = await load(env, url.searchParams.get('id'), url.searchParams.get('t'));
  if (!booking) return jsonResponse({ error: 'This link is invalid.' }, 404);
  return jsonResponse({ status: booking.status, start: booking.start_utc, tz: booking.tz, lang: booking.lang, name: booking.name, meetLink: booking.meet_link, past: new Date(booking.start_utc) < new Date() });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const body = (await readJson(request)) || {};
  const booking = await load(env, body.id, body.t);
  if (!booking) return jsonResponse({ error: 'This link is invalid.' }, 404);
  const pt = booking.lang === 'pt';
  if (booking.status !== 'confirmed') return jsonResponse({ error: pt ? 'Esta chamada já foi cancelada.' : 'This call has already been cancelled.' }, 409);
  if (new Date(booking.start_utc) < new Date()) return jsonResponse({ error: pt ? 'Esta chamada já passou.' : 'This call has already taken place.' }, 409);
  if (!calendarConfigured(env)) return jsonResponse({ error: 'Temporarily unavailable. Email support@nabiaedge.com.' }, 503);
  const base = siteUrl(env, request);
  const now = new Date().toISOString();

  if (body.action === 'cancel') {
    try { if (booking.event_id) await deleteEvent(env, booking.event_id); } catch (err) { console.error('Delete event failed:', err); }
    await cancelBookingEmails(env, booking);
    await env.DB.prepare("UPDATE bookings SET status = 'cancelled', updated_at = ? WHERE id = ?").bind(now, booking.id).run();
    waitUntil(sendEmail(env, { to: booking.email, ...renderBookingEmail('cancelled', { booking, base, manageLink: '' }) }));
    waitUntil(alertOwner(env, base, booking, 'cancelled'));
    return jsonResponse({ ok: true, status: 'cancelled' });
  }

  if (body.action === 'reschedule') {
    const start = new Date(body.start);
    if (isNaN(start)) return jsonResponse({ error: 'Pick a time.' }, 400);
    if (!(await isSlotAvailable(env, start, { ignoreBookingId: booking.id }))) {
      return jsonResponse({ error: pt ? 'Essa hora já não está disponível.' : 'That time is no longer available.' }, 409);
    }
    const end = new Date(start.getTime() + BOOKING.durationMin * 60000);
    try {
      await env.DB.prepare('UPDATE bookings SET start_utc = ?, end_utc = ?, updated_at = ? WHERE id = ?').bind(start.toISOString(), end.toISOString(), now, booking.id).run();
    } catch (err) {
      return jsonResponse({ error: pt ? 'Essa hora já não está disponível.' : 'That time is no longer available.' }, 409);
    }
    try {
      await moveEvent(env, booking.event_id, { start, end, timeZone: BOOKING.timeZone });
    } catch (err) {
      console.error('Move event failed:', err);
      await env.DB.prepare('UPDATE bookings SET start_utc = ?, end_utc = ?, updated_at = ? WHERE id = ?').bind(booking.start_utc, booking.end_utc, now, booking.id).run();
      return jsonResponse({ error: 'Temporarily unavailable. Email support@nabiaedge.com.' }, 502);
    }
    await cancelBookingEmails(env, booking);
    const moved = { ...booking, start_utc: start.toISOString(), end_utc: end.toISOString() };
    const ids = await sendBookingEmails(env, base, moved, 'rescheduled');
    await env.DB.prepare('UPDATE bookings SET reminder24_id = ?, reminder1_id = ?, followup_id = ? WHERE id = ?')
      .bind(ids.reminder24_id ?? null, ids.reminder1_id ?? null, ids.followup_id ?? null, booking.id).run();
    waitUntil(alertOwner(env, base, moved, 'rescheduled'));
    return jsonResponse({ ok: true, status: 'confirmed', start: moved.start_utc });
  }

  return jsonResponse({ error: 'Unknown action.' }, 400);
}
