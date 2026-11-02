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
// ISO week of the send date (Tue 1 Dec 2026 is week 49).
export const WEEK_NUMBER = 49;
export const SUBJECT = "Why you're always the first to notice";
export const PREVIEW_TEXT = 'If problems only surface when you look, you are the reporting system.';

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
    'When I managed Prime Now delivery stations at Amazon, one meeting never moved. Every week we went through the concessions: the refunds and credits we\'d given customers when something went wrong.',
    'Not when a customer complained loudly. Not when the numbers looked bad. Every week, whether things looked fine or not.',
    'That routine is how we found root causes instead of firefighting the same problems, and customer satisfaction went up.',
  ],
  sections: [
    {
      heading: 'Why it happens',
      paragraphs: [
        "In most founder-led businesses, the reporting system is the founder. You notice the late job, the unhappy client, the slow month, usually because you happened to look. By then it's a fire, and you're the one holding the hose.",
        "A fixed slot with the same few numbers changes that. Problems show up because the routine finds them, not because you were lucky. And once the team runs the routine, it doesn't need you to be the one who looks.",
      ],
    },
    {
      heading: 'Try this: the Monday numbers slot',
      paragraphs: [
        <>1. <b>Pick five numbers, no more.</b> A good starting set: money in (cash received), work in (new enquiries or confirmed jobs), work out (delivered on time), quality (rework or complaints) and capacity (hours booked against hours available).</>,
        <>2. <b>Give each one a target and an owner.</b> The owner brings the number. You don&apos;t.</>,
        <>3. <b>Same 30 minutes every week,</b> even when nothing looks wrong. That&apos;s the point.</>,
        <>4. <b>Green or red only.</b> Green numbers get no discussion.</>,
        <>5. <b>Every red leaves with one owner and one date,</b> checked at the next meeting.</>,
        "After four weeks, miss one on purpose. If it runs without you, it's working.",
        'Most founders get stuck on step 1. Pick imperfect numbers and improve them later. Five rough numbers looked at every week beat a perfect dashboard nobody opens.',
      ],
    },
    {
      heading: 'The bigger picture',
      paragraphs: [
        "At Amazon the weekly review wasn't a reporting exercise. It was how a large operation stayed close to the customer without depending on any one manager's instinct. A 10-person agency needs the same thing for the same reason. You can't scale your attention, but you can scale a routine.",
        'Setting up the slot takes 30 minutes. Choosing numbers that actually tell you where the business is going, and getting the team to run the meeting without you, is the work I do with founders.',
      ],
    },
  ],
  cta: {
    lead: "If that's where you are, book a 30-minute call. You'll leave with the first fix, whether or not we work together.",
    label: 'Book a 30-minute call',
    href: 'https://www.nunofontoura.com/book/?utm_source=newsletter&utm_content=week-49',
  },
  reply: (
    <>
      <b>Your turn:</b> if you could only see five numbers every Monday, which would they be? Hit reply. I read every answer.
    </>
  ),
  ps: (
    <>
      <b>P.S.</b> In two weeks: why most changes in a small business fade by week six, and the one-hour job to do before you log off for Christmas.
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
