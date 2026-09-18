// Suggested times, for visitors who can't find a slot that works.
//
// POST /api/booking/request  { ...booking questions, options: [ISO, ISO, ISO], note?, lang, tz }
//   -> stores the request, acknowledges it to the visitor, and emails Nuno one
//      "Book this time" link per suggested time.
// GET  /api/booking/request?r=&t=                 -> request details for /book/approve/ (owner)
// POST /api/booking/request  { r, t, action: 'accept', option }  -> books that time
import { BOOKING } from '../../_lib/booking-config.js';
import { busyIntervals, calendarConfigured } from '../../_lib/google-calendar.js';
import { ERR, createBooking, parseForm } from '../../_lib/booking-core.js';
import { renderRequestAck, renderRequestAlert } from '../../_lib/booking-emails.js';
import { sendEmail } from '../../_lib/resend.js';
import { signToken, verifyToken } from '../../_lib/unsubscribe-token.js';
import { escapeHtml, jsonResponse, readJson, sha256Hex, siteUrl } from '../../_lib/http.js';

const DAY = 86400000;
const tokenFor = (env, id) => signToken(`request:${id}`, env.UNSUB_SECRET);

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('r');
  if (!env.DB || !id || !(await verifyToken(`request:${id}`, url.searchParams.get('t'), env.UNSUB_SECRET))) {
    return jsonResponse({ error: 'This link is invalid.' }, 404);
  }
  const r = await env.DB.prepare('SELECT * FROM booking_requests WHERE id = ?').bind(id).first();
  if (!r) return jsonResponse({ error: 'This link is invalid.' }, 404);
  const options = JSON.parse(r.options);
  let conflicts = options.map(() => null);
  if (calendarConfigured(env)) {
    try {
      const starts = options.map((o) => new Date(o).getTime());
      const busy = await busyIntervals(env, new Date(Math.min(...starts) - 3600000), new Date(Math.max(...starts) + 2 * 3600000));
      conflicts = starts.map((s) => busy.some((b) => s < b.end.getTime() && s + BOOKING.durationMin * 60000 > b.start.getTime()));
    } catch (err) {
      console.error('Conflict check failed:', err);
    }
  }
  return jsonResponse({
    kind: r.kind || 'discovery', status: r.status, acceptedOption: r.accepted_option, name: r.name, email: r.email, agency: r.agency, website: r.website,
    agencyType: r.agency_type, teamSize: r.team_size, urgency: r.urgency, problem: r.problem, note: r.note, tz: r.tz,
    options: options.map((o, i) => ({ start: o, past: new Date(o) < new Date(), conflict: conflicts[i] })),
  });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const body = (await readJson(request)) || {};
  if (body.action === 'accept') return accept({ request, env, waitUntil }, body);
  if (body.honeypot) return jsonResponse({ ok: true }, 200);

  const { b, error, lang } = parseForm(body);
  const e = ERR[lang];
  if (error) return jsonResponse({ error }, 400);
  const now = Date.now();
  const options = (Array.isArray(body.options) ? body.options : [])
    .map((o) => new Date(o))
    .filter((d) => !isNaN(d) && d.getTime() > now + 3600000 && d.getTime() < now + 90 * DAY)
    .map((d) => d.toISOString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);
  if (!options.length) return jsonResponse({ error: e.times }, 400);
  if (!env.DB || !env.RESEND_API_KEY) return jsonResponse({ error: e.unavailable }, 503);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = ip ? await sha256Hex(`${ip}:${env.UNSUB_SECRET || ''}`) : null;
  if (ipHash) {
    const since = new Date(now - 3600000).toISOString();
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM booking_requests WHERE ip_hash = ? AND created_at > ?').bind(ipHash, since).first();
    if (recent.n >= 3) return jsonResponse({ error: e.rate }, 429);
  }

  const id = [...crypto.getRandomValues(new Uint8Array(8))].map((x) => x.toString(16).padStart(2, '0')).join('');
  const note = String(body.note ?? '').trim().slice(0, 1000) || null;
  await env.DB.prepare(
    `INSERT INTO booking_requests (id, kind, status, name, email, agency, website, agency_type, team_size, problem, urgency, heard_from, lang, tz, source, options, note, ip_hash, created_at)
     VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, b.kind, b.name, b.email, b.agency, b.website, b.agency_type, b.team_size, b.problem, b.urgency, b.heard_from, b.lang, b.tz, b.source, JSON.stringify(options), note, ipHash, new Date(now).toISOString()).run();

  const base = siteUrl(env, request);
  const t = await tokenFor(env, id);
  const req = { ...b, id, options, note };
  waitUntil(sendEmail(env, { to: b.email, ...renderRequestAck(req) }));
  if (env.NOTIFY_EMAIL) {
    waitUntil(sendEmail(env, {
      to: env.NOTIFY_EMAIL,
      ...renderRequestAlert(req, { approveLink: (i) => `${base}/book/approve/?r=${id}&t=${t}&o=${i}` }),
    }));
  }
  return jsonResponse({ ok: true });
}

async function accept({ request, env, waitUntil }, body) {
  const id = body.r;
  if (!env.DB || !id || !(await verifyToken(`request:${id}`, body.t, env.UNSUB_SECRET))) return jsonResponse({ error: 'This link is invalid.' }, 404);
  const r = await env.DB.prepare('SELECT * FROM booking_requests WHERE id = ?').bind(id).first();
  if (!r) return jsonResponse({ error: 'This link is invalid.' }, 404);
  if (r.status !== 'pending') return jsonResponse({ error: 'This request has already been booked.' }, 409);
  const options = JSON.parse(r.options);
  const start = new Date(options[Number(body.option)]);
  if (isNaN(start)) return jsonResponse({ error: 'Pick one of the suggested times.' }, 400);
  if (start < new Date()) return jsonResponse({ error: 'That time has already passed.' }, 400);
  if (!calendarConfigured(env)) return jsonResponse({ error: 'Google Calendar is not connected.' }, 503);

  // Claim the request first so a double click can't book twice.
  const claim = await env.DB.prepare("UPDATE booking_requests SET status = 'accepting' WHERE id = ? AND status = 'pending'").bind(id).run();
  if (!claim.meta?.changes) return jsonResponse({ error: 'This request has already been booked.' }, 409);

  const b = {
    kind: r.kind || 'discovery',
    name: r.name, email: r.email, agency: r.agency, website: r.website, agency_type: r.agency_type, team_size: r.team_size,
    problem: r.problem, urgency: r.urgency, heard_from: r.heard_from, lang: r.lang, tz: r.tz, source: `${r.source || ''} (suggested time)`,
  };
  const result = await createBooking(env, siteUrl(env, request), b, start, { waitUntil });
  if (result.status !== 200) {
    await env.DB.prepare("UPDATE booking_requests SET status = 'pending' WHERE id = ?").bind(id).run();
    return jsonResponse(result.body, result.status);
  }
  await env.DB.prepare("UPDATE booking_requests SET status = 'accepted', accepted_option = ?, booking_id = ? WHERE id = ?").bind(Number(body.option), result.booking.id, id).run();
  return jsonResponse({ ok: true, start: result.booking.start_utc, meetLink: result.booking.meet_link, email: escapeHtml(r.email) });
}
