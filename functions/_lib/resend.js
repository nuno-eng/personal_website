// Thin wrappers around the Resend REST API. The Workers runtime has fetch but
// no Node APIs, so we call the API directly instead of using the resend SDK.
//
// Resend replaced "Audiences" with global Contacts + "Segments" in 2025. Old
// Audience ids were migrated to Segment ids, so RESEND_AUDIENCE_ID is still
// accepted as a fallback for RESEND_SEGMENT_ID.

export function segmentId(env) {
  return env.RESEND_SEGMENT_ID || env.RESEND_AUDIENCE_ID || '';
}

function call(env, path, { method = 'GET', body, headers = {} } = {}) {
  // RESEND_API_URL is only for pointing local dev at a mock server.
  return fetch(`${env.RESEND_API_URL || 'https://api.resend.com'}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// Creates the contact in the newsletter segment, or - if it already exists,
// e.g. someone who unsubscribed and is signing up again - re-subscribes it
// and makes sure it's in the segment. Returns true on success.
export async function upsertContact(env, { email, firstName }) {
  const segment = segmentId(env);
  const created = await call(env, '/contacts', {
    method: 'POST',
    body: {
      email,
      first_name: firstName || undefined,
      unsubscribed: false,
      segments: segment ? [{ id: segment }] : undefined,
    },
  });
  if (created.ok) return true;

  const createError = await created.text();
  const updated = await call(env, `/contacts/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: { unsubscribed: false, ...(firstName ? { first_name: firstName } : {}) },
  });
  if (!updated.ok) {
    console.error('Resend create contact failed:', created.status, createError);
    console.error('Resend update contact failed:', updated.status, await updated.text());
    return false;
  }

  if (segment) {
    const added = await call(
      env,
      `/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segment)}`,
      { method: 'POST' }
    );
    // Already being in the segment is fine; anything else is only logged,
    // because the contact itself exists and is subscribed.
    if (!added.ok) console.error('Resend add to segment:', added.status, await added.text());
  }
  return true;
}

export async function unsubscribeContact(env, email) {
  const res = await call(env, `/contacts/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: { unsubscribed: true },
  });
  if (!res.ok) console.error('Resend unsubscribe failed:', res.status, await res.text());
  return res.ok;
}

// Sends (or schedules, with scheduledAt) one email. Returns the Resend id or null.
export async function sendEmail(env, { to, subject, html, text, scheduledAt, headers, idempotencyKey }) {
  const res = await call(env, '/emails', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: {
      from: env.RESEND_FROM,
      to: [to],
      subject,
      html,
      text,
      reply_to: env.RESEND_REPLY_TO || undefined,
      scheduled_at: scheduledAt,
      headers,
    },
  });
  if (!res.ok) {
    console.error('Resend send failed:', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.id || null;
}

export async function cancelEmail(env, id) {
  const res = await call(env, `/emails/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
  // Already-sent emails can't be cancelled; that's expected, not an error.
  return res.ok;
}
