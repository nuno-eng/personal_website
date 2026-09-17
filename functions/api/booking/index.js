// POST /api/booking  -> creates a discovery call
// Body: { start, name, email, agency, website?, agencyType, teamSize, problem, urgency, heardFrom?, lang, tz, source, honeypot }
import { BOOKING, CHOICES, LABELS } from '../../_lib/booking-config.js';
import { isSlotAvailable } from '../../_lib/availability.js';
import { calendarConfigured, createEvent } from '../../_lib/google-calendar.js';
import { alertOwner, manageLink, sendBookingEmails } from '../../_lib/bookings.js';
import { isValidTimeZone } from '../../_lib/timezone.js';
import { jsonResponse, normalizeLang, readJson, sha256Hex, siteUrl } from '../../_lib/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERR = {
  en: { fields: 'Please fill in all required fields.', email: 'Enter a valid email address.', taken: 'That time was just taken. Please pick another.', unavailable: 'Booking is temporarily unavailable. Email support@nabiaedge.com and I will find a time.', rate: 'Too many bookings from this connection. Try again later.' },
  pt: { fields: 'Preencha todos os campos obrigatórios.', email: 'Introduza um email válido.', taken: 'Essa hora acabou de ser marcada. Escolha outra, por favor.', unavailable: 'As marcações estão temporariamente indisponíveis. Escreva para support@nabiaedge.com e encontramos uma hora.', rate: 'Demasiadas marcações a partir desta ligação. Tente mais tarde.' },
};

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;
  const body = (await readJson(request)) || {};
  const lang = normalizeLang(body.lang);
  const e = ERR[lang];
  if (body.honeypot) return jsonResponse({ ok: true }, 200);

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
    return jsonResponse({ error: e.fields }, 400);
  }
  if (b.heard_from && !CHOICES.heardFrom.includes(b.heard_from)) b.heard_from = null;
  if (!EMAIL_RE.test(b.email)) return jsonResponse({ error: e.email }, 400);
  const start = new Date(body.start);
  if (isNaN(start)) return jsonResponse({ error: e.taken }, 400);
  if (!calendarConfigured(env) || !env.DB || !env.RESEND_API_KEY) return jsonResponse({ error: e.unavailable }, 503);

  const db = env.DB;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = ip ? await sha256Hex(`${ip}:${env.UNSUB_SECRET || ''}`) : null;
  if (ipHash) {
    const since = new Date(Date.now() - 3600000).toISOString();
    const recent = await db.prepare('SELECT COUNT(*) AS n FROM bookings WHERE ip_hash = ? AND created_at > ?').bind(ipHash, since).first();
    if (recent.n >= 3) return jsonResponse({ error: e.rate }, 429);
  }

  try {
    if (!(await isSlotAvailable(env, start))) return jsonResponse({ error: e.taken }, 409);
  } catch (err) {
    console.error('Availability check failed:', err);
    return jsonResponse({ error: e.unavailable }, 502);
  }

  b.id = [...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, '0')).join('');
  b.start_utc = start.toISOString();
  b.end_utc = new Date(start.getTime() + BOOKING.durationMin * 60000).toISOString();
  const now = new Date().toISOString();

  // Reserve the slot first: the partial unique index rejects a double booking.
  try {
    await db.prepare(
      `INSERT INTO bookings (id, status, start_utc, end_utc, name, email, agency, website, agency_type, team_size, problem, urgency, heard_from, lang, tz, source, ip_hash, created_at, updated_at)
       VALUES (?, 'confirmed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(b.id, b.start_utc, b.end_utc, b.name, b.email, b.agency, b.website, b.agency_type, b.team_size, b.problem, b.urgency, b.heard_from, b.lang, b.tz, b.source, ipHash, now, now).run();
  } catch (err) {
    console.error('Slot reservation failed:', err);
    return jsonResponse({ error: e.taken }, 409);
  }

  const base = siteUrl(env, request);
  const L = LABELS.en;
  try {
    const event = await createEvent(env, {
      start, end: new Date(b.end_utc), timeZone: BOOKING.timeZone, requestId: b.id,
      summary: `Discovery call: ${b.name} (${b.agency})`,
      attendee: { email: b.email, displayName: b.name },
      description: [
        `Agency: ${b.agency}`, `Website: ${b.website || '-'}`, `Type: ${L.agencyType[b.agency_type]}`, `Team size: ${L.teamSize[b.team_size]}`,
        `Urgency: ${L.urgency[b.urgency]}`, `Heard from: ${b.heard_from ? L.heardFrom[b.heard_from] : '-'}`, '',
        'Problem to fix:', b.problem, '', `Reschedule or cancel: ${await manageLink(env, base, b)}`,
      ].join('\n'),
    });
    b.event_id = event.id;
    b.meet_link = event.meetLink;
  } catch (err) {
    console.error('Calendar event failed:', err);
    await db.prepare("UPDATE bookings SET status = 'failed', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), b.id).run();
    return jsonResponse({ error: e.unavailable }, 502);
  }

  let ids = {};
  try {
    ids = await sendBookingEmails(env, base, b, 'confirmed');
  } catch (err) {
    console.error('Booking emails failed:', err);
  }
  await db.prepare('UPDATE bookings SET event_id = ?, meet_link = ?, reminder24_id = ?, reminder1_id = ?, followup_id = ?, updated_at = ? WHERE id = ?')
    .bind(b.event_id, b.meet_link, ids.reminder24_id ?? null, ids.reminder1_id ?? null, ids.followup_id ?? null, new Date().toISOString(), b.id).run();

  waitUntil(alertOwner(env, base, b, 'confirmed'));
  return jsonResponse({ ok: true, start: b.start_utc, meetLink: b.meet_link }, 200);
}

