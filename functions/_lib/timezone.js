// Time zone helpers built on Intl (available in Workers and browsers).

function parts(date, timeZone) {
  const out = {};
  for (const p of new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short',
  }).formatToParts(date)) out[p.type] = p.value;
  return out;
}

export function offsetMinutes(date, timeZone) {
  const p = parts(date, timeZone);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

// Local wall-clock time in `timeZone` -> UTC Date
export function zonedToUtc(year, month, day, hour, minute, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let utc = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  const second = guess - offsetMinutes(new Date(utc), timeZone) * 60000;
  if (second !== utc) utc = second;
  return new Date(utc);
}

// { year, month, day, isoWeekday, dateKey } of a UTC instant in `timeZone`
export function zonedDate(date, timeZone) {
  const p = parts(date, timeZone);
  const isoWeekday = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[p.weekday];
  return { year: +p.year, month: +p.month, day: +p.day, isoWeekday, dateKey: `${p.year}-${p.month}-${p.day}` };
}

export function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function formatWhen(date, timeZone, lang) {
  const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
  const day = new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const time = new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  const zone = timeZone.replace(/_/g, ' ');
  return { day, time, zone, full: lang === 'pt' ? `${day}, às ${time} (${zone})` : `${day} at ${time} (${zone})` };
}
