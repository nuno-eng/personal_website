import { BOOKING } from './booking-config.js';
import { zonedDate, zonedToUtc } from './timezone.js';
import { busyIntervals } from './google-calendar.js';

const MIN = 60000;

function candidateSlots(now) {
  const { timeZone, durationMin, stepMin, minNoticeHours, daysAhead, hours } = BOOKING;
  const earliest = new Date(now.getTime() + minNoticeHours * 60 * MIN);
  const slots = [];
  const today = zonedDate(now, timeZone);
  for (let i = 0; i <= daysAhead; i++) {
    // walk calendar days in Lisbon; noon avoids DST edge cases
    const noon = zonedToUtc(today.year, today.month, today.day + i, 12, 0, timeZone);
    const d = zonedDate(noon, timeZone);
    for (const [from, to] of hours[d.isoWeekday] || []) {
      const [fh, fm] = from.split(':').map(Number);
      const [th, tm] = to.split(':').map(Number);
      for (let m = fh * 60 + fm; m + durationMin <= th * 60 + tm; m += stepMin) {
        const start = zonedToUtc(d.year, d.month, d.day, Math.floor(m / 60), m % 60, timeZone);
        if (start < earliest) continue;
        slots.push({ start, end: new Date(start.getTime() + durationMin * MIN), dateKey: d.dateKey });
      }
    }
  }
  return slots;
}

// Available slot starts (Date[]). `ignoreBookingId` lets a reschedule ignore its own current slot.
export async function availableSlots(env, { now = new Date(), ignoreBookingId = null } = {}) {
  const candidates = candidateSlots(now);
  if (!candidates.length) return [];
  const from = new Date(candidates[0].start.getTime() - BOOKING.bufferMin * MIN);
  const to = new Date(candidates.at(-1).end.getTime() + BOOKING.bufferMin * MIN);

  let busy = await busyIntervals(env, from, to);
  const { results: booked } = await env.DB
    .prepare("SELECT id, start_utc, end_utc FROM bookings WHERE status = 'confirmed' AND start_utc >= ? AND start_utc <= ?")
    .bind(from.toISOString(), to.toISOString())
    .all();
  const perDay = {};
  for (const b of booked) {
    if (b.id === ignoreBookingId) {
      const s = new Date(b.start_utc).getTime(), e = new Date(b.end_utc).getTime();
      busy = busy.filter((x) => !(x.start.getTime() === s && x.end.getTime() === e));
      continue;
    }
    const key = zonedDate(new Date(b.start_utc), BOOKING.timeZone).dateKey;
    perDay[key] = (perDay[key] || 0) + 1;
    // our own bookings count as busy even before Google Calendar reflects them
    busy.push({ start: new Date(b.start_utc), end: new Date(b.end_utc) });
  }

  const buffer = BOOKING.bufferMin * MIN;
  return candidates
    .filter((s) => (perDay[s.dateKey] || 0) < BOOKING.maxPerDay)
    .filter((s) => !busy.some((b) => s.start.getTime() - buffer < b.end.getTime() && s.end.getTime() + buffer > b.start.getTime()))
    .map((s) => s.start);
}

export async function isSlotAvailable(env, start, opts) {
  const slots = await availableSlots(env, opts);
  return slots.some((s) => s.getTime() === start.getTime());
}
