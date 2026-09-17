// Google Calendar API over fetch (no SDK in Workers). Uses an OAuth refresh
// token for nuno@nabiaedge.com, created once with tools/google-calendar-setup.mjs.
// GOOGLE_API_URL / GOOGLE_TOKEN_URL exist only for pointing local tests at a mock.

let cached = { token: null, expires: 0 };

async function accessToken(env) {
  if (cached.token && Date.now() < cached.expires - 60000) return cached.token;
  const res = await fetch(env.GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google token error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

async function call(env, path, { method = 'GET', query = {}, body } = {}) {
  const url = new URL(`${env.GOOGLE_API_URL || 'https://www.googleapis.com'}/calendar/v3${path}`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${await accessToken(env)}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Google Calendar ${method} ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

export function calendarConfigured(env) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);
}

const calendarId = (env) => encodeURIComponent(env.GOOGLE_CALENDAR_ID || 'primary');

export async function busyIntervals(env, timeMin, timeMax) {
  const data = await call(env, '/freeBusy', {
    method: 'POST',
    body: { timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: env.GOOGLE_CALENDAR_ID || 'primary' }] },
  });
  const cal = Object.values(data.calendars || {})[0] || {};
  if (cal.errors?.length) throw new Error(`freeBusy error: ${JSON.stringify(cal.errors)}`);
  return (cal.busy || []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

export async function createEvent(env, { start, end, summary, description, attendee, requestId, timeZone }) {
  const event = await call(env, `/calendars/${calendarId(env)}/events`, {
    method: 'POST',
    query: { conferenceDataVersion: '1', sendUpdates: 'all' },
    body: {
      summary,
      description,
      start: { dateTime: start.toISOString(), timeZone },
      end: { dateTime: end.toISOString(), timeZone },
      attendees: [attendee],
      conferenceData: { createRequest: { requestId, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      reminders: { useDefault: true },
    },
  });
  const meet = event.hangoutLink || event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri || null;
  return { id: event.id, meetLink: meet };
}

export function moveEvent(env, eventId, { start, end, timeZone }) {
  return call(env, `/calendars/${calendarId(env)}/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    query: { sendUpdates: 'all' },
    body: { start: { dateTime: start.toISOString(), timeZone }, end: { dateTime: end.toISOString(), timeZone } },
  });
}

export function deleteEvent(env, eventId) {
  return call(env, `/calendars/${calendarId(env)}/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    query: { sendUpdates: 'all' },
  });
}
