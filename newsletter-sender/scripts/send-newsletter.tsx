// Renders emails/newsletter.tsx and sends it through Resend.
//
//   npm run send:test   sends this issue to TEST_EMAIL only (do this first)
//   npm run send        schedules it for the next send slot (see below)
//   npm run send -- --date 2026-11-17   schedules it for a specific Tuesday instead
//
// Operating Notes goes out every other Tuesday at 11:00 UK time, starting
// Tuesday 3 Nov 2026. `npm run send` books the issue into Resend for the next
// slot; Resend sends it then, and it can be cancelled in Resend > Broadcasts
// until it goes. WEEK_NUMBER must match the ISO week of that Tuesday, so an
// issue can't go out on the wrong date by accident.
//
// A broadcast needs READY = true in the template, so an unedited draft can't
// go out.
import 'dotenv/config';
import { render } from '@react-email/components';
import { Resend } from 'resend';
import Newsletter, { PREVIEW_TEXT, READY, SUBJECT, WEEK_NUMBER } from '../emails/newsletter.js';

const isTest = process.argv.includes('--test');
const dateArg = process.argv.includes('--date') ? process.argv[process.argv.indexOf('--date') + 1] : null;

// ─── Schedule: every other Tuesday, 11:00 UK time ─────────────────────────
const FIRST_SEND = '2026-11-03'; // a Tuesday; every slot is a multiple of 14 days from here
const SEND_TIME = { hour: 11, minute: 0, timeZone: 'Europe/London' };
const DAY_MS = 86_400_000;

// The UTC instant of hh:mm on a calendar date in a time zone (handles GMT/BST).
function zonedInstant(date: string, hour: number, minute: number, timeZone: string): Date {
  const guess = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(guess).map((p) => [p.type, p.value]),
  );
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess.getTime() - (shown - guess.getTime()));
}

function isoWeek(date: string): number {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - firstThursday.getTime()) / DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

function nextSlot(after: Date): string {
  let t = new Date(`${FIRST_SEND}T00:00:00Z`).getTime();
  while (zonedInstant(new Date(t).toISOString().slice(0, 10), SEND_TIME.hour, SEND_TIME.minute, SEND_TIME.timeZone) <= after) t += 14 * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}
const { RESEND_API_KEY, RESEND_FROM, RESEND_REPLY_TO, TEST_EMAIL } = process.env;
const SEGMENT_ID = process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (!RESEND_API_KEY || !RESEND_FROM) fail('Missing RESEND_API_KEY or RESEND_FROM. Check your .env.');
if (isTest && !TEST_EMAIL) fail('Set TEST_EMAIL in .env to send a test.');
if (!isTest && !SEGMENT_ID) fail('Missing RESEND_SEGMENT_ID. Check your .env.');
if (!isTest && !READY) fail('READY is false in emails/newsletter.tsx. Edit the issue, send a test, then set READY = true.');

const resend = new Resend(RESEND_API_KEY);
const html = await render(<Newsletter />);
const text = await render(<Newsletter />, { plainText: true });

if (isTest) {
  // Resend only fills {{{...}}} placeholders in broadcasts, so use readable
  // stand-ins in the test copy.
  const fill = (s: string) =>
    s.replaceAll('{{{contact.first_name|there}}}', 'there').replaceAll('{{{RESEND_UNSUBSCRIBE_URL}}}', '#unsubscribe');
  const { data, error } = await resend.emails.send({
    from: RESEND_FROM!,
    to: TEST_EMAIL!,
    replyTo: RESEND_REPLY_TO || undefined,
    // A time in the subject keeps each test in its own Gmail thread. Identical
    // tests in one thread get collapsed behind "Show quoted text".
    subject: `[TEST ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })}] ${SUBJECT}`,
    html: fill(html),
    text: fill(text),
  });
  if (error) fail(`Test send failed: ${JSON.stringify(error)}`);
  console.log(`Test sent to ${TEST_EMAIL} (${data!.id}).`);
} else {
  if (dateArg && !/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) fail('Use --date YYYY-MM-DD, e.g. --date 2026-11-17.');
  // At least 15 minutes ahead, so there's time to cancel a mistake in Resend.
  const sendDate = dateArg || nextSlot(new Date(Date.now() + 15 * 60_000));
  const sendAt = zonedInstant(sendDate, SEND_TIME.hour, SEND_TIME.minute, SEND_TIME.timeZone);
  if (sendAt.getTime() < Date.now() + 5 * 60_000) fail(`${sendDate} 11:00 has already passed (or is under 5 minutes away).`);
  if (isoWeek(sendDate) !== WEEK_NUMBER) {
    fail(`This issue says WEEK_NUMBER = ${WEEK_NUMBER}, but ${sendDate} is week ${isoWeek(sendDate)}. Fix WEEK_NUMBER (or pass --date) and run again.`);
  }
  const { data: list } = await resend.broadcasts.list();
  // Resend reports a booked broadcast as "scheduled" ("queued" kept in case
  // older broadcasts use it). Matching only "queued" let week 45 be booked twice.
  const clash = list?.data?.find((b) => ['scheduled', 'queued'].includes(String(b.status)) && b.scheduled_at && Math.abs(new Date(b.scheduled_at).getTime() - sendAt.getTime()) < 60_000);
  if (clash) fail(`"${clash.name}" is already scheduled for ${sendDate} 11:00. Cancel it in Resend > Broadcasts first.`);

  const { data, error } = await resend.broadcasts.create({
    segmentId: SEGMENT_ID!,
    name: `Week ${WEEK_NUMBER}: ${SUBJECT}`,
    from: RESEND_FROM!,
    replyTo: RESEND_REPLY_TO || undefined,
    subject: SUBJECT,
    previewText: PREVIEW_TEXT,
    html,
    text,
    send: true,
    scheduledAt: sendAt.toISOString(),
  });
  if (error) fail(`Broadcast failed: ${JSON.stringify(error)}`);
  const when = sendAt.toLocaleString('en-GB', { timeZone: SEND_TIME.timeZone, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  console.log(`Week ${WEEK_NUMBER}: "${SUBJECT}" is scheduled for ${when} (broadcast ${data!.id}).`);
  console.log('To change or cancel it before then: Resend > Broadcasts.');
  console.log(`Next slot after that: ${nextSlot(new Date(sendAt.getTime() + 60_000))}.`);
}
