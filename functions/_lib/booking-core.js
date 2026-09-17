// Shared by /api/booking (visitor picks a slot) and /api/booking/request
// (Nuno accepts a time the visitor suggested).
import { BOOKING, CHOICES, LABELS } from './booking-config.js';
import { createEvent } from './google-calendar.js';
import { alertOwner, manageLink, sendBookingEmails } from './bookings.js';
import { isValidTimeZone } from './timezone.js';
import { normalizeLang } from './http.js';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ERR = {
  en: { fields: 'Please fill in all required fields.', email: 'Enter a valid email address.', taken: 'That time was just taken. Please pick another.', unavailable: 'Booking is temporarily unavailable. Email support@nabiaedge.com and I will find a time.', rate: 'Too many requests from this connection. Try again later.', times: 'Suggest at least one time in the future.' },
  pt: { fields: 'Preencha todos os campos obrigatórios.', email: 'Introduza um email válido.', taken: 'Essa hora acabou de ser marcada. Escolha outra, por favor.', unavailable: 'As marcações estão temporariamente indisponíveis. Escreva para support@nabiaedge.com e encontramos uma hora.', rate: 'Demasiados pedidos a partir desta ligação. Tente mais tarde.', times: 'Sugira pelo menos uma hora no futuro.' },
};

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

// Validates the qualifying questions. Returns { b } or { error }.
export function parseForm(body) {
  const lang = normalizeLang(body.lang);
  const e = ERR[lang];
  const b = {
    name: clean(body.name, 100),
    email: clean(body.email, 254).toLowerCase(),
    agency: clean(body.agency, 200),
    website: clean(body.website, 200) || null,
    agency_type: clean(body.agencyType, 30),
    team_size: clean(body.teamSize, 10),
    problem: clean(body.problem, 2000),
    urgency: clean(body.urgency, 20),
    heard_from: clean(body.heardFrom, 20) || null,
    lang,
    tz: isValidTimeZone(body.tz) ? body.tz : BOOKING.timeZone,
    source: clean(body.source, 160) || null,
  };
  if (!b.name || !b.agency || !b.problem || !CHOICES.agencyType.includes(b.agency_type) || !CHOICES.teamSize.includes(b.team_size) || !CHOICES.urgency.includes(b.urgency)) {
    return { error: e.fields, lang };
  }
  if (b.heard_from && !CHOICES.heardFrom.includes(b.heard_from)) b.heard_from = null;
  if (!EMAIL_RE.test(b.email)) return { error: e.email, lang };
  return { b, lang };
}

// Reserves the slot in D1, creates the Google Calendar event with a Meet link,
// sends the confirmation and scheduled emails, and alerts the owner.
// Returns { status, body, booking }.
export async function createBooking(env, base, b, start, { ipHash = null, waitUntil } = {}) {
  const e = ERR[b.lang];
  const db = env.DB;
  const booking = {
    ...b,
    id: [...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, '0')).join(''),
    start_utc: start.toISOString(),
    end_utc: new Date(start.getTime() + BOOKING.durationMin * 60000).toISOString(),
  };
  const now = new Date().toISOString();

  try {
    await db.prepare(
      `INSERT INTO bookings (id, status, start_utc, end_utc, name, email, agency, website, agency_type, team_size, problem, urgency, heard_from, lang, tz, source, ip_hash, created_at, updated_at)
       VALUES (?, 'confirmed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(booking.id, booking.start_utc, booking.end_utc, booking.name, booking.email, booking.agency, booking.website, booking.agency_type, booking.team_size, booking.problem, booking.urgency, booking.heard_from, booking.lang, booking.tz, booking.source, ipHash, now, now).run();
  } catch (err) {
    console.error('Slot reservation failed:', err);
    return { status: 409, body: { error: e.taken } };
  }

  const L = LABELS.en;
  try {
    const event = await createEvent(env, {
      start, end: new Date(booking.end_utc), timeZone: BOOKING.timeZone, requestId: booking.id,
      summary: `Discovery call: ${booking.name} (${booking.agency})`,
      attendee: { email: booking.email, displayName: booking.name },
      description: [
        `Agency: ${booking.agency}`, `Website: ${booking.website || '-'}`, `Type: ${L.agencyType[booking.agency_type]}`, `Team size: ${L.teamSize[booking.team_size]}`,
        `Urgency: ${L.urgency[booking.urgency]}`, `Heard from: ${booking.heard_from ? L.heardFrom[booking.heard_from] : '-'}`, '',
        'Problem to fix:', booking.problem, '', `Reschedule or cancel: ${await manageLink(env, base, booking)}`,
      ].join('\n'),
    });
    booking.event_id = event.id;
    booking.meet_link = event.meetLink;
  } catch (err) {
    console.error('Calendar event failed:', err);
    await db.prepare("UPDATE bookings SET status = 'failed', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), booking.id).run();
    return { status: 502, body: { error: e.unavailable } };
  }

  let ids = {};
  try {
    ids = await sendBookingEmails(env, base, booking, 'confirmed');
  } catch (err) {
    console.error('Booking emails failed:', err);
  }
  await db.prepare('UPDATE bookings SET event_id = ?, meet_link = ?, reminder24_id = ?, reminder1_id = ?, followup_id = ?, updated_at = ? WHERE id = ?')
    .bind(booking.event_id, booking.meet_link, ids.reminder24_id ?? null, ids.reminder1_id ?? null, ids.followup_id ?? null, new Date().toISOString(), booking.id).run();

  const alert = alertOwner(env, base, booking, 'confirmed');
  if (waitUntil) waitUntil(alert); else await alert;
  return { status: 200, body: { ok: true, start: booking.start_utc, meetLink: booking.meet_link }, booking };
}
