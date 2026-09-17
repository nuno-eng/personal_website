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

// ─── Edit this block for each issue ────────────────────────────────────────
// scripts/send-newsletter.tsx refuses to broadcast while READY is false, so
// the example issue below can't go out by accident.

export const READY = false;
export const ISSUE_NUMBER = 1;
export const SUBJECT = 'The Monday standard';
export const PREVIEW_TEXT = 'Why your week falls apart by Wednesday, and the 20-minute fix.';

const ISSUE = {
  intro: [
    'EXAMPLE ISSUE: replace this text before sending.',
    'Most founders start the week with a to-do list. By Wednesday the list has been replaced by whatever was loudest.',
  ],
  sections: [
    {
      heading: 'The problem',
      paragraphs: [
        'A list tells you what to do. It does not tell your team what "done" looks like, who owns it, or when you will check.',
      ],
    },
    {
      heading: 'The fix',
      paragraphs: [
        'Twenty minutes every Monday. Three priorities, one owner each, one measurable standard each. Review them on Friday: committed versus delivered.',
        'Do that for six weeks and you will stop managing by memory.',
      ],
    },
  ],
  cta: {
    lead: 'Want help building your operating cadence?',
    label: 'Book a 30-minute call',
    href: 'https://calendly.com/nuno-nabiaedge/30min',
  },
};
// ───────────────────────────────────────────────────────────────────────────

export default function Newsletter() {
  return (
    <Html lang="en">
      <Head />
      <Preview>{PREVIEW_TEXT}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={kicker}>Operating Notes &middot; Issue #{ISSUE_NUMBER}</Text>
          <Heading as="h1" style={h1}>
            {SUBJECT}
          </Heading>

          {/* Resend fills in the contact's first name in broadcasts. */}
          <Text style={paragraph}>{'Hi {{{contact.first_name|there}}},'}</Text>
          {ISSUE.intro.map((p) => (
            <Text key={p} style={paragraph}>
              {p}
            </Text>
          ))}

          {ISSUE.sections.map((section) => (
            <Section key={section.heading} style={sectionStyle}>
              <Heading as="h2" style={h2}>
                {section.heading}
              </Heading>
              {section.paragraphs.map((p) => (
                <Text key={p} style={paragraph}>
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

          <Text style={paragraph}>Reply to this email and tell me what you are working on. I read every answer.</Text>
          <Text style={paragraph}>Nuno</Text>

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
const color = { bg: '#f3f2f2', surface: '#ffffff', text: '#201e1d', muted: '#7d7979', accent: '#1E3A8A', rule: '#d7d3d3' };
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
const ctaButton = { backgroundColor: color.accent, color: color.bg, fontSize: '15px', fontWeight: 800, padding: '14px 22px', textDecoration: 'none' };
const hr = { borderColor: color.rule, margin: '24px 0 16px' };
const footer = { color: color.muted, fontSize: '12px', lineHeight: '18px', margin: 0 };
const footerLink = { color: color.muted, textDecoration: 'underline' };
