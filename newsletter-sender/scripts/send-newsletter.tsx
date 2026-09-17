// Renders emails/newsletter.tsx and sends it through Resend.
//
//   npm run send:test   sends this issue to TEST_EMAIL only (do this first)
//   npm run send        broadcasts to every subscribed contact in the segment
//
// A broadcast needs READY = true in the template, so an unedited draft can't
// go out.
import 'dotenv/config';
import { render } from '@react-email/components';
import { Resend } from 'resend';
import Newsletter, { ISSUE_NUMBER, PREVIEW_TEXT, READY, SUBJECT } from '../emails/newsletter.js';

const isTest = process.argv.includes('--test');
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
    subject: `[TEST] ${SUBJECT}`,
    html: fill(html),
    text: fill(text),
  });
  if (error) fail(`Test send failed: ${JSON.stringify(error)}`);
  console.log(`Test sent to ${TEST_EMAIL} (${data!.id}).`);
} else {
  const { data, error } = await resend.broadcasts.create({
    segmentId: SEGMENT_ID!,
    name: `Issue #${ISSUE_NUMBER}: ${SUBJECT}`,
    from: RESEND_FROM!,
    replyTo: RESEND_REPLY_TO || undefined,
    subject: SUBJECT,
    previewText: PREVIEW_TEXT,
    html,
    text,
    send: true,
  });
  if (error) fail(`Broadcast failed: ${JSON.stringify(error)}`);
  console.log(`Broadcast ${data!.id} is sending. Track it in Resend > Broadcasts.`);
}
