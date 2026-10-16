// Emails sent by Resend Automations rather than by the website. They use the same
// layout as the site's emails, but are pasted into Resend as Templates:
//   npm run build:automations  ->  newsletter-sender/automations/*.html
// Resend fills {{{RESEND_UNSUBSCRIBE_URL}}} per contact; it must stay in every template.
import { Column, Row, Section, Text } from '@react-email/components';
import type { ReactElement } from 'react';
import { COLOR, Cta, H, Layout, P, Signature } from './brand.js';

export type AutomationEmail = { id: string; subject: string; preview: string; element: ReactElement };

const FONT = "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const vos = (content: string) => `https://vos.nabiaedge.com/trial?utm_source=nunofontoura.com&utm_medium=email&utm_campaign=vos-assessment&utm_content=${content}`;

// The three VOS pillars, named as the assessment app names them.
const PILLARS = {
  en: [['The Bridge', 'Direction & People'], ['The Hull', 'Systems & Cash'], ['The Cargo Hold', 'Revenue & Customers']],
  pt: [['A Ponte', 'Direção e Pessoas'], ['O Casco', 'Sistemas e Tesouraria'], ['O Porão', 'Receita e Clientes']],
};

function Pillars({ lang }: { lang: 'en' | 'pt' }) {
  return (
    <Section style={{ backgroundColor: COLOR.tint, borderLeft: `4px solid ${COLOR.navy}`, padding: '12px 18px', margin: '0 0 22px' }}>
      {PILLARS[lang].map(([name, plain]) => (
        <Row key={name}>
          <Column style={{ width: '140px', verticalAlign: 'top', padding: '5px 0' }}>
            <Text style={{ margin: 0, color: COLOR.navy, fontSize: '15px', lineHeight: '22px', fontWeight: 800, fontFamily: FONT }}>{name}</Text>
          </Column>
          <Column style={{ verticalAlign: 'top', padding: '5px 0' }}>
            <Text style={{ margin: 0, color: COLOR.ink, fontSize: '15px', lineHeight: '22px', fontFamily: FONT }}>{plain}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

const footer = {
  en: <>You are receiving this because you asked for a free resource at nunofontoura.com. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={{ color: COLOR.muted }}>Unsubscribe</a><br />NabiaEdge Ltd</>,
  pt: <>Recebe este email porque pediu um recurso gratuito em nunofontoura.com. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={{ color: COLOR.muted }}>Cancelar subscrição</a><br />NabiaEdge Ltd</>,
};

export const AUTOMATION_EMAILS: AutomationEmail[] = [
  {
    id: 'resource-followup-en',
    subject: 'How did it go?',
    preview: 'One question, and one next step if it helped.',
    element: (
      <Layout lang="en" eyebrow="Free resource" preview="One question, and one next step if it helped." footer={footer.en}>
        <H>How did it go?</H>
        <P>Hi,</P>
        <P>Three days ago you asked for one of the free tools I use with clients. Did you get a chance to use it?</P>
        <P>If you did, look at the answer that surprised you most. That&apos;s usually where the real problem sits.</P>
        <P>If it helped, the next step is the free VOS assessment. It scores your business across the three parts of the vessel, so you can see where the next problem is before it costs you:</P>
        <Pillars lang="en" />
        <Cta href={vos('resource-followup-en')}>Take the free VOS assessment</Cta>
        <P>If you didn&apos;t get round to it, that&apos;s fine. Just reply and tell me what got in the way, and I&apos;ll tell you whether it&apos;s worth another look.</P>
        <Signature lang="en" />
      </Layout>
    ),
  },
  {
    id: 'resource-followup-pt',
    subject: 'Como correu?',
    preview: 'Uma pergunta, e um próximo passo se tiver ajudado.',
    element: (
      <Layout lang="pt" eyebrow="Recurso gratuito" preview="Uma pergunta, e um próximo passo se tiver ajudado." footer={footer.pt}>
        <H>Como correu?</H>
        <P>Olá,</P>
        <P>Há três dias pediu uma das ferramentas gratuitas que uso com clientes. Chegou a experimentá-la?</P>
        <P>Se sim, repare na resposta que mais o surpreendeu. Normalmente é aí que está o problema real.</P>
        <P>Se ajudou, o próximo passo é a avaliação VOS gratuita. Pontua o seu negócio nas três partes do navio, para ver onde está o próximo problema antes que lhe custe dinheiro:</P>
        <Pillars lang="pt" />
        <Cta href={vos('resource-followup-pt')}>Fazer a avaliação VOS gratuita</Cta>
        <P>Se ainda não teve tempo, não há problema. Responda a este email e diga-me o que se meteu no caminho, e digo-lhe se vale a pena voltar a olhar.</P>
        <Signature lang="pt" />
      </Layout>
    ),
  },
];
