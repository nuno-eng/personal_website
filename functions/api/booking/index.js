// POST /api/booking  -> creates a discovery call
// Body: { start, name, email, agency, website?, agencyType, teamSize, problem, urgency, heardFrom?, lang, tz, source, honeypot }
import { isSlotAvailable } from '../../_lib/availability.js';
import { calendarConfigured } from '../../_lib/google-calendar.js';
import { ERR, createBooking, parseForm } from '../../_lib/booking-core.js';
import { jsonResponse, readJson, sha256Hex, siteUrl } from '../../_lib/http.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const body = (await readJson(request)) || {};
  if (body.honeypot) return jsonResponse({ ok: true }, 200);
  const { b, error, lang } = parseForm(body);
  const e = ERR[lang];
  if (error) return jsonResponse({ error }, 400);
  const start = new Date(body.start);
  if (isNaN(start)) return jsonResponse({ error: e.taken }, 400);
  if (!calendarConfigured(env) || !env.DB || !env.RESEND_API_KEY) return jsonResponse({ error: e.unavailable }, 503);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = ip ? await sha256Hex(`${ip}:${env.UNSUB_SECRET || ''}`) : null;
  if (ipHash) {
    const since = new Date(Date.now() - 3600000).toISOString();
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM bookings WHERE ip_hash = ? AND created_at > ?').bind(ipHash, since).first();
    if (recent.n >= 3) return jsonResponse({ error: e.rate }, 429);
  }

  try {
    if (!(await isSlotAvailable(env, start))) return jsonResponse({ error: e.taken }, 409);
  } catch (err) {
    console.error('Availability check failed:', err);
    return jsonResponse({ error: e.unavailable }, 502);
  }

  const result = await createBooking(env, siteUrl(env, request), b, start, { ipHash, waitUntil });
  return jsonResponse(result.body, result.status);
}
