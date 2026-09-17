// Shared layout and building blocks for every automated email.
// Placeholders like {{name}} are filled in at send time by functions/_lib/emails.js;
// {{{html}}} placeholders take pre-built, escaped HTML.
import { Body, Button, Column, Container, Head, Hr, Html, Img, Link, Preview, Row, Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';

export const SITE = 'https://www.nunofontoura.com';
export const COLOR = { bg: '#f3f2f2', card: '#ffffff', ink: '#201e1d', body: '#3a3736', muted: '#77726f', rule: '#e4e1e0', navy: '#1E3A8A', tint: '#f1f4fb' };
const FONT = "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function Layout({ lang = 'en', preview, eyebrow, children, footer }: { lang?: string; preview: string; eyebrow: string; children: ReactNode; footer: ReactNode }) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: COLOR.bg, margin: 0, padding: '32px 12px', fontFamily: FONT }}>
        <Container style={{ maxWidth: '600px', width: '100%' }}>
          <Section style={{ padding: '0 4px 14px' }}>
            <Row>
              <Column style={{ width: '36px', verticalAlign: 'middle' }}>
                <Img src={`${SITE}/assets/email/mark.png`} width="28" height="28" alt="" style={{ display: 'block' }} />
              </Column>
              <Column style={{ verticalAlign: 'middle' }}>
                <Link href={SITE} style={{ color: COLOR.ink, fontSize: '15px', fontWeight: 800, textDecoration: 'none', fontFamily: FONT }}>Nuno Fontoura</Link>
              </Column>
              <Column align="right" style={{ verticalAlign: 'middle' }}>
                <Text style={{ margin: 0, color: COLOR.navy, fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT }}>{eyebrow}</Text>
              </Column>
            </Row>
          </Section>
          <Section style={{ backgroundColor: COLOR.card, borderTop: `5px solid ${COLOR.navy}`, padding: '34px 36px 30px' }}>{children}</Section>
          <Section style={{ padding: '18px 8px 0' }}>
            <Text style={{ margin: 0, color: COLOR.muted, fontSize: '12px', lineHeight: '19px', fontFamily: FONT }}>{footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const H = ({ children }: { children: ReactNode }) => (
  <Text style={{ margin: '0 0 18px', color: COLOR.ink, fontSize: '26px', lineHeight: '32px', fontWeight: 800, letterSpacing: '-0.01em', fontFamily: FONT }}>{children}</Text>
);

export const P = ({ children }: { children: ReactNode }) => (
  <Text style={{ margin: '0 0 16px', color: COLOR.body, fontSize: '16px', lineHeight: '26px', fontFamily: FONT }}>{children}</Text>
);

export const Cta = ({ href, children }: { href: string; children: ReactNode }) => (
  <Section style={{ margin: '10px 0 24px' }}>
    <Button href={href} style={{ backgroundColor: COLOR.navy, color: '#ffffff', fontSize: '15px', fontWeight: 800, textDecoration: 'none', padding: '14px 24px', fontFamily: FONT }}>{children}</Button>
  </Section>
);

export const TextLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} style={{ color: COLOR.navy, fontWeight: 700, textDecoration: 'underline' }}>{children}</Link>
);

export function Details({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <Section style={{ backgroundColor: COLOR.tint, borderLeft: `4px solid ${COLOR.navy}`, padding: '14px 18px', margin: '4px 0 22px' }}>
      {rows.map(([label, value]) => (
        <Row key={label}>
          <Column style={{ width: '96px', verticalAlign: 'top', padding: '5px 0' }}>
            <Text style={{ margin: 0, color: COLOR.muted, fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: '22px', fontFamily: FONT }}>{label}</Text>
          </Column>
          <Column style={{ verticalAlign: 'top', padding: '5px 0' }}>
            <Text style={{ margin: 0, color: COLOR.ink, fontSize: '15px', lineHeight: '22px', fontWeight: 700, fontFamily: FONT }}>{value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export const Quote = ({ children }: { children: ReactNode }) => (
  <Section style={{ borderLeft: `4px solid ${COLOR.navy}`, padding: '2px 0 2px 16px', margin: '0 0 20px' }}>
    <Text style={{ margin: 0, color: COLOR.ink, fontSize: '16px', lineHeight: '26px', fontWeight: 700, fontFamily: FONT }}>{children}</Text>
  </Section>
);

export function Signature({ lang = 'en' }: { lang?: string }) {
  return (
    <>
      <Hr style={{ borderColor: COLOR.rule, margin: '26px 0 18px' }} />
      <Text style={{ margin: 0, color: COLOR.ink, fontSize: '15px', lineHeight: '22px', fontWeight: 800, fontFamily: FONT }}>Nuno Fontoura</Text>
      <Text style={{ margin: 0, color: COLOR.muted, fontSize: '13px', lineHeight: '20px', fontFamily: FONT }}>
        {lang === 'pt' ? 'Fundador, NabiaEdge' : 'Founder, NabiaEdge'} · <Link href={SITE} style={{ color: COLOR.muted }}>nunofontoura.com</Link> · <Link href="https://www.linkedin.com/in/nfontoura" style={{ color: COLOR.muted }}>LinkedIn</Link>
      </Text>
    </>
  );
}
