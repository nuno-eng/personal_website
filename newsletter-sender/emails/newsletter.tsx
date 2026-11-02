import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';
import { BUTTON, SITE } from '../transactional/brand.js';

// ─── Edit this block for each issue ────────────────────────────────────────
// scripts/send-newsletter.tsx refuses to broadcast while READY is false, so
// the example issue below can't go out by accident.

export const READY = false;
// ISO week of the send date (Tue 15 Dec 2026 is week 51).
export const WEEK_NUMBER = 51;
export const SUBJECT = 'Why most changes die in week six';
export const PREVIEW_TEXT = 'The sprint took four weeks. The results took five months.';

// Paragraphs can hold <b> and <A> (inline link) as well as plain text.
type IssueSection = { heading: string; paragraphs: ReactNode[] };
const ISSUE: {
  intro: ReactNode[];
  sections: IssueSection[];
  cta: { lead: ReactNode; label: string; href: string };
  // Optional sections after the call box, e.g. a seasonal note.
  closing?: IssueSection[];
  reply: ReactNode;
  // Defaults to "Nuno"; e.g. <>Happy new year,<br />Nuno</> for a seasonal issue.
  signoff?: ReactNode;
  ps?: ReactNode;
} = {
  intro: [
    'With the 25-person brand activation agency from my first issue, the main build was a four-week sprint. We put in the basics: a client briefing, one owner per stage, quality checks before production, and the first set of written procedures.',
    "The results didn't arrive in those four weeks. They built up over the next five months: 30% fewer decisions reached the director, he got about 10 hours a week back, and rework on what they manufacture fell by 20%.",
    "The procedures didn't keep themselves going. What kept them going was the last thing the sprint set up: a weekly, monthly and quarterly review rhythm, with a small set of numbers, that the team ran.",
  ],
  sections: [
    {
      heading: 'Why it happens',
      paragraphs: [
        "Most changes in a small business don't fail. They fade. Week one, everyone uses the new process. By week six, a busy client has pulled attention elsewhere, nobody checks, and the old habits are back.",
        'A rhythm is what makes a change survive after your attention moves on. Every week someone looks at the numbers. Every month someone asks if the process still works. Every quarter the priorities get reset. None of it depends on you remembering.',
      ],
    },
    {
      heading: 'Try this: book 2027 before you log off',
      paragraphs: [
        'One hour, before 31 December:',
        <>1. <b>Weekly:</b> book the 30-minute Monday numbers slot from the last issue as a recurring meeting for the whole year. Name who chairs it, ideally not you.</>,
        <>2. <b>Monthly:</b> pick a fixed date, such as the first Tuesday, for the monthly review: cash, margin, how the five numbers are trending, and one thing to change.</>,
        <>3. <b>Quarterly:</b> book four half-days now. Each one sets no more than three priorities, with one owner each.</>,
        <>4. <b>This year:</b> write down three things that worked, three that didn&apos;t, and the one constraint that held the business back most. That last one is your first priority for Q1.</>,
        "A rhythm that isn't in the calendar is a wish. Put it in before the holidays, while January is still empty.",
        "Booking the meetings takes an hour. Keeping them going through a busy quarter, so they don't stop the first time a client crisis lands, is where most founders want help. That's the work I do.",
      ],
    },
  ],
  cta: {
    lead: "If that's where you are, book a 30-minute call for January. You'll leave with the first fix, whether or not we work together.",
    label: 'Book a 30-minute call',
    href: 'https://www.nunofontoura.com/book/?utm_source=newsletter&utm_content=week-51',
  },
  reply: (
    <>
      <b>Your turn:</b> what&apos;s the one constraint that held your business back most this year? Hit reply. I read every answer, holidays included.
    </>
  ),
  ps: (
    <>
      <b>P.S.</b> The next issue lands between Christmas and New Year, and it&apos;s a short one: why the money you&apos;re owed is a process problem, not a client problem.
    </>
  ),
};
// ───────────────────────────────────────────────────────────────────────────

function renderSection(section: IssueSection) {
  return (
    <Section key={section.heading} style={sectionStyle}>
      <Heading as="h2" style={h2}>
        {section.heading}
      </Heading>
      {section.paragraphs.map((p, i) => (
        <Text key={i} style={paragraph}>
          {p}
        </Text>
      ))}
    </Section>
  );
}

export default function Newsletter() {
  return (
    <Html lang="en">
      <Head />
      <Preview>{PREVIEW_TEXT}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Row style={kickerRow}>
            <Column style={{ width: '36px', verticalAlign: 'middle' }}>
              <Link href={SITE}>
                <Img src={`${SITE}/assets/email/mark.png`} width="28" height="28" alt="Nuno Fontoura" style={{ display: 'block' }} />
              </Link>
            </Column>
            <Column style={{ verticalAlign: 'middle' }}>
              <Text style={kicker}>Operating Notes &middot; Week {WEEK_NUMBER}</Text>
            </Column>
          </Row>
          <Heading as="h1" style={h1}>
            {SUBJECT}
          </Heading>

          {/* Resend fills in the contact's first name in broadcasts. */}
          <Text style={paragraph}>{'Hi {{{contact.first_name|there}}},'}</Text>
          {ISSUE.intro.map((p, i) => (
            <Text key={i} style={paragraph}>
              {p}
            </Text>
          ))}

          {ISSUE.sections.map(renderSection)}

          <Section style={ctaSection}>
            <Text style={paragraph}>{ISSUE.cta.lead}</Text>
            <Button href={ISSUE.cta.href} style={ctaButton}>
              {ISSUE.cta.label}
            </Button>
          </Section>

          {ISSUE.closing?.map(renderSection)}

          <Text style={paragraph}>{ISSUE.reply}</Text>
          <Text style={paragraph}>{ISSUE.signoff ?? 'Nuno'}</Text>
          {ISSUE.ps && <Text style={paragraph}>{ISSUE.ps}</Text>}

          <Hr style={hr} />

          <Text style={footer}>
            You are receiving this because you subscribed at{' '}
            <Link href="https://www.nunofontoura.com" style={footerLink}>
              nunofontoura.com
            </Link>
            . Know a founder who would find this useful? Forward it on.{' '}
            {/* Resend replaces this with each contact's unsubscribe link.
                It must use triple braces. */}
            <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={footerLink}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Inline styles: most email clients strip <style> blocks. Colours and font
// match the website's design system.
const color = { bg: '#f3f2f2', surface: '#ffffff', text: '#201e1d', muted: '#7d7979', accent: '#0F1D3D', rule: '#d7d3d3' };
const font = "Archivo, 'Helvetica Neue', Arial, sans-serif";

const main = { backgroundColor: color.bg, fontFamily: font, padding: '32px 16px' };
const container = {
  backgroundColor: color.surface,
  borderTop: `4px solid ${color.accent}`,
  margin: '0 auto',
  maxWidth: '580px',
  padding: '28px 32px',
};
const kicker = {
  color: color.accent,
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  margin: 0,
};
const kickerRow = { margin: '0 0 14px' };
const h1 = { color: color.text, fontSize: '30px', fontWeight: 800, lineHeight: '36px', letterSpacing: '-0.015em', margin: '0 0 24px' };
const h2 = { color: color.text, fontSize: '19px', fontWeight: 800, lineHeight: '26px', margin: '0 0 8px' };
const sectionStyle = { margin: '8px 0 12px' };
const paragraph = { color: color.text, fontSize: '16px', lineHeight: '26px', margin: '0 0 18px' };
const ctaSection = { borderLeft: `4px solid ${color.accent}`, backgroundColor: color.bg, padding: '18px 20px 22px', margin: '8px 0 26px' };
const ctaButton = BUTTON;
const hr = { borderColor: color.rule, margin: '24px 0 16px' };
const footer = { color: color.muted, fontSize: '12px', lineHeight: '18px', margin: 0 };
const footerLink = { color: color.muted, textDecoration: 'underline' };
const inlineLink = { color: color.accent, textDecoration: 'underline' };

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={inlineLink}>
      {children}
    </Link>
  );
}
