import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';
import { BUTTON } from '../transactional/brand.js';

// ─── Edit this block for each issue ────────────────────────────────────────
// scripts/send-newsletter.tsx refuses to broadcast while READY is false, so
// the example issue below can't go out by accident.

export const READY = false;
// ISO week of the send date (Tue 10 Nov 2026 is week 46).
export const WEEK_NUMBER = 46;
export const SUBJECT = 'The standard only you can see';
export const PREVIEW_TEXT = "At four people, reviewing everything feels like care. At twelve, it's the queue.";

// Paragraphs can hold <b> and <A> (inline link) as well as plain text.
const ISSUE: {
  intro: ReactNode[];
  sections: { heading: string; paragraphs: ReactNode[] }[];
  cta: { lead: ReactNode; label: string; href: string };
  reply: ReactNode;
  ps?: ReactNode;
} = {
  intro: [
    "I once worked with a 25-person brand activation agency where almost every question ended on the director's desk.",
    'Every project ran a little differently. Client requirements surfaced halfway through design, creating extra rounds of work. Production mistakes weren\'t recorded, so they came back. Nobody was careless. The standard for "good" lived in one place, the director\'s head, and the only way to check work against it was to send it to him.',
    "If you run an agency, you probably know this one. At four people, reviewing everything feels like care. At twelve, it's the queue everything waits in.",
  ],
  sections: [
    {
      heading: 'Why it stops working',
      paragraphs: [
        'Founder review catches problems at the most expensive point: after the work is already done. It teaches the team to stop at "good enough for the founder to fix". And it keeps your standard unwritten, so nobody else can apply it. If quality depends on your review, your review is the system.',
        "At Amazon I helped open the UK's second Prime Now hub, and inbound capacity went up about 58% in two weeks. That came from standards written for that building's layout and for what the system could really handle, not copied from another site. People could follow them from their first shift, because the standard didn't depend on someone senior being there to interpret it.",
      ],
    },
    {
      heading: 'Try this: the one-page standard',
      paragraphs: [
        'Pick the one piece of work that comes back to you most often (a video, a proposal, a client report). Give it one page:',
        <>1. <b>What it&apos;s for:</b> the job it does for the client, in one sentence.</>,
        <>2. <b>Done means:</b> 3 to 5 checks anyone can confirm without asking you. Make them testable: &ldquo;price and deadline on page one&rdquo;, not &ldquo;clear proposal&rdquo;.</>,
        <>3. <b>Where people go wrong:</b> only the steps that cause rework, and why each one matters.</>,
        <>4. <b>One good example:</b> a link to a piece you&apos;d hold up.</>,
        <>5. <b>Maker and checker:</b> who makes it, and who checks it against the page. Not you.</>,
        "For two weeks, when work reaches you, don't fix it. Check it against the page. If it fails a check that's on the page, send it back. If it fails something that isn't, add the missing line.",
        'By the end, the standard in your head is on paper.',
      ],
    },
    {
      heading: 'What changed at the agency',
      paragraphs: [
        <>
          A four-week sprint put the basics in: a client briefing completed before design starts, the same stages and one owner for every job, and quality checks before anything goes to production. Then the team ran it. Within five months, 30% fewer decisions reached the director, he got about 10 hours a week back, and rework on what they manufacture fell by 20%.{' '}
          <A href="https://www.nunofontoura.com/case-studies/yunik/?utm_source=newsletter&utm_content=week-46">Read the full case study</A>.
        </>,
        "One page fixes one workflow. Making standards stick across a whole business, so quality doesn't quietly depend on you again six months later, is harder. That's the work I do with founders: the few standards, owners and checks that let the team deliver without every decision coming back to you.",
      ],
    },
  ],
  cta: {
    lead: "If that's where you are, book a 30-minute call. You'll leave with the first fix, whether or not we work together.",
    label: 'Book a 30-minute call',
    href: 'https://www.nunofontoura.com/book/?utm_source=newsletter&utm_content=week-46',
  },
  reply: (
    <>
      <b>Your turn:</b> what&apos;s the one piece of work that still has to pass through you before it reaches a client? Hit reply. I read every answer.
    </>
  ),
  ps: (
    <>
      <b>P.S.</b> Writing it down is only half of it. In two weeks: why a global hotel group took three times longer than usual to check me in.
    </>
  ),
};
// ───────────────────────────────────────────────────────────────────────────

export default function Newsletter() {
  return (
    <Html lang="en">
      <Head />
      <Preview>{PREVIEW_TEXT}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={kicker}>Operating Notes &middot; Week {WEEK_NUMBER}</Text>
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

          {ISSUE.sections.map((section) => (
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
          ))}

          <Section style={ctaSection}>
            <Text style={paragraph}>{ISSUE.cta.lead}</Text>
            <Button href={ISSUE.cta.href} style={ctaButton}>
              {ISSUE.cta.label}
            </Button>
          </Section>

          <Text style={paragraph}>{ISSUE.reply}</Text>
          <Text style={paragraph}>Nuno</Text>
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
  margin: '0 0 12px',
};
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
