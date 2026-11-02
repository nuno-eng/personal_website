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
// ISO week of the send date (Tue 17 Nov 2026 is week 47).
export const WEEK_NUMBER = 47;
export const SUBJECT = "The best system in the world can't check you in";
export const PREVIEW_TEXT = "Written down isn't the same as trained.";

// Paragraphs can hold <b> and <A> (inline link) as well as plain text.
const ISSUE: {
  intro: ReactNode[];
  sections: { heading: string; paragraphs: ReactNode[] }[];
  cta: { lead: ReactNode; label: string; href: string };
  reply: ReactNode;
  // Defaults to "Nuno"; e.g. <>Happy new year,<br />Nuno</> for a seasonal issue.
  signoff?: ReactNode;
  ps?: ReactNode;
} = {
  intro: [
    'Earlier this month I checked into a hotel run by one of the biggest hotel groups in the world. It took at least three times longer than any check-in I can remember.',
    "The system wasn't the problem. A group that size runs some of the most tested booking software there is. The receptionist was new, and my booking had one thing she hadn't been trained for: my address is in a different country from my nationality.",
    'Everything else about that check-in was standard. One exception stopped it.',
  ],
  sections: [
    {
      heading: 'Why it happens',
      paragraphs: [
        "Two weeks ago: get the standard out of your head and onto a page. Here's the catch. A page nobody has been trained on is still in your head. Founders buy the system (a CRM, a project tool, an automation) and expect it to do the training. It doesn't. And training on the normal case isn't enough, because the job breaks on the exceptions.",
        "None of this is new. In the 1940s, the US Training Within Industry programme had to make millions of new workers productive fast. It taught supervisors one rule: if the worker hasn't learned, the instructor hasn't taught. I ran an instruction department in the Marines, and later helped build an instructors' course in Angola. Same lesson.",
      ],
    },
    {
      heading: 'Try this: teach one standard in four steps',
      paragraphs: [
        'Take the one-page standard from the last issue, or any task your team gets wrong.',
        <>1. <b>Prepare:</b> say what the job is for and what &ldquo;done&rdquo; looks like. Show the good example.</>,
        <>2. <b>Show:</b> do it once while they watch. Name each step, and the reason behind the tricky ones.</>,
        <>3. <b>Try:</b> they do it while you watch, explaining each step back to you. Correct it on the spot.</>,
        <>4. <b>Follow up:</b> name who they can ask, ideally not you. Check often at first, then less.</>,
        "Then ask your team one question: what's the unusual version of this job, and who knows how to handle it? Write that case into the page and teach it too.",
        'Keep a simple grid: people down the side, standards across the top. Mark each 0 (not trained), 1 (trained and checked) or 2 (can train others). Every standard needs at least two people at 2.',
      ],
    },
    {
      heading: 'What it looked like at scale',
      paragraphs: [
        'A European mobility platform launched a premium chauffeur service in 8 cities across 6 countries. There was no playbook for premium: no written standard for what it meant, and no training. A central team in London was directing daily operations in every market. I wrote the city-launch playbooks and SOPs, then trained the local teams to run their own markets. Rollout time came down by two weeks, and the Managing Director handed over day-to-day operations.',
        "The playbook didn't do that on its own. The training did.",
        'Writing a standard takes an afternoon. Getting a team to run it without you, awkward cases included, is the work I do with founders.',
      ],
    },
  ],
  cta: {
    lead: "If that's where you are, book a 30-minute call. You'll leave with the first fix, whether or not we work together.",
    label: 'Book a 30-minute call',
    href: 'https://www.nunofontoura.com/book/?utm_source=newsletter&utm_content=week-47',
  },
  reply: (
    <>
      <b>Your turn:</b> which tool did you pay for that your team still doesn&apos;t use the way you meant? Hit reply. I read every answer.
    </>
  ),
  ps: (
    <>
      <b>P.S.</b> In two weeks: why you&apos;re usually the first person to notice when something goes wrong, and the 30-minute Monday habit that fixes it.
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
