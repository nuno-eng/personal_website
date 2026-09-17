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
  const from = new Date(candidates[0].start.getTime() - BOOKING.bufferAfterMin * MIN);
  const to = new Date(candidates.at(-1).end.getTime() + BOOKING.bufferAfterMin * MIN);

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
    busy.push({ start: new Date(b.start_utc), end: new Date(b.end_utc), call: true });
  }

  const before = BOOKING.bufferBeforeMin * MIN;
  const after = BOOKING.bufferAfterMin * MIN;
  return candidates
    .filter((s) => (perDay[s.dateKey] || 0) < BOOKING.maxPerDay)
    // the slot needs `after` free before the next busy block, and `before` free after the
    // previous one (or `after`, when the previous block is another discovery call)
    .filter((s) => !busy.some((b) => s.start.getTime() - (b.call ? Math.max(before, after) : before) < b.end.getTime() && s.end.getTime() + after > b.start.getTime()))
    .filter((s) => leavesLunch(s, busy))
    .map((s) => s.start);
}

// True if, with this slot booked, a free block of BOOKING.lunch.minutes still
// fits inside that day's lunch window.
function leavesLunch(slot, busy) {
  const { window: [from, to], minutes } = BOOKING.lunch;
  const d = zonedDate(slot.start, BOOKING.timeZone);
  const at = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return zonedToUtc(d.year, d.month, d.day, h, m, BOOKING.timeZone).getTime(); };
  const winStart = at(from), winEnd = at(to);
  if (slot.end.getTime() <= winStart || slot.start.getTime() >= winEnd) return true;
  const blocks = [...busy, slot]
    .map((b) => [Math.max(b.start.getTime(), winStart), Math.min(b.end.getTime(), winEnd)])
    .filter(([a, b]) => a < b)
    .sort((x, y) => x[0] - y[0]);
  let cursor = winStart;
  for (const [a, b] of blocks) {
    if (a - cursor >= minutes * MIN) return true;
    cursor = Math.max(cursor, b);
  }
  return winEnd - cursor >= minutes * MIN;
}

export async function isSlotAvailable(env, start, opts) {
  const slots = await availableSlots(env, opts);
  return slots.some((s) => s.getTime() === start.getTime());
}
