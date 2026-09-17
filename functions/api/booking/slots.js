// GET /api/booking/slots[?id=&t=]  -> { timeZone, slots: [ISO start, ...] }
// With a valid manage token, the booking's own current slot counts as free.
import { availableSlots } from '../../_lib/availability.js';
import { calendarConfigured } from '../../_lib/google-calendar.js';
import { BOOKING } from '../../_lib/booking-config.js';
import { verifyManageToken } from '../../_lib/bookings.js';
import { jsonResponse } from '../../_lib/http.js';

export async function onRequestGet({ request, env }) {
  if (!calendarConfigured(env) || !env.DB) return jsonResponse({ error: 'Booking is temporarily unavailable.' }, 503);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const ignore = id && (await verifyManageToken(env, id, url.searchParams.get('t'))) ? id : null;
  try {
    const slots = await availableSlots(env, { ignoreBookingId: ignore });
    return jsonResponse({ timeZone: BOOKING.timeZone, durationMin: BOOKING.durationMin, slots: slots.map((s) => s.toISOString()) });
  } catch (err) {
    console.error('Availability error:', err);
    return jsonResponse({ error: 'Could not load available times. Try again shortly.' }, 502);
  }
}
