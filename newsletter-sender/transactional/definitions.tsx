// Every automated email. The build script renders each one to HTML and text
// with {{placeholders}} left in, into functions/_lib/generated/emails.js.
import type { ReactElement } from 'react';
import { Cta, Details, H, Layout, P, Quote, Signature, SITE, TextLink } from './brand.js';

export type EmailDef = { id: string; subject: string; element: ReactElement };
const VOS = 'https://vos.nabiaedge.com/trial';
const NAME = { en: 'Operating Notes', pt: 'Notas Operacionais' };
const E: EmailDef[] = [];
const add = (id: string, subject: string, element: ReactElement) => E.push({ id, subject, element });

// ---------------- newsletter welcome sequence ----------------
const seqFooter = {
  en: <>You are receiving this because you subscribed to {NAME.en} at nunofontoura.com. <a href="{{unsubLink}}" style={{ color: '#77726f' }}>Unsubscribe</a></>,
  pt: <>Recebe este email porque subscreveu as {NAME.pt} em nunofontoura.com. <a href="{{unsubLink}}" style={{ color: '#77726f' }}>Cancelar subscrição</a></>,
};

add('seq-welcome-en', `You're in: ${NAME.en}`,
  <Layout lang="en" eyebrow={NAME.en} preview="What to expect, and one question for you." footer={seqFooter.en}>
    <H>Welcome to {NAME.en}.</H>
    <P>{'{{greeting}}'}</P>
    <P>Thanks for subscribing. Every two weeks you get one operational idea for founder-led agencies: how work gets done, who owns what, and how to stop being the bottleneck. It&apos;s drawn from six years in the Portuguese Marines, seven and a half at Amazon, and the founders I work with now.</P>
    <P>No motivation, no filler. If an issue doesn&apos;t change what you do on Monday, I haven&apos;t done my job.</P>
    <Quote>One question to start: what is the operational problem taking most of your time right now?</Quote>
    <P>Hit reply and tell me. I read every answer, and the most common ones become future issues.</P>
    <P>If someone you know is carrying their whole business on their back, send them your personal link:</P>
    <Details rows={[['Your link', <TextLink href="{{referralLink}}">{'{{referralLink}}'}</TextLink>]]} />
    <Signature lang="en" />
  </Layout>);
add('seq-welcome-pt', `Bem-vindo às ${NAME.pt}`,
  <Layout lang="pt" eyebrow={NAME.pt} preview="O que esperar, e uma pergunta para si." footer={seqFooter.pt}>
    <H>Bem-vindo às {NAME.pt}.</H>
    <P>{'{{greeting}}'}</P>
    <P>Obrigado por subscrever. De duas em duas semanas recebe uma ideia operacional para agências lideradas por fundadores: como o trabalho se faz, quem é responsável pelo quê, e como deixar de ser o gargalo. Com base em seis anos nos Fuzileiros, sete anos e meio na Amazon, e nos fundadores com quem trabalho hoje.</P>
    <P>Sem motivação vazia, sem enchimento. Se uma edição não mudar o que faz na segunda-feira, não fiz o meu trabalho.</P>
    <Quote>Uma pergunta para começar: qual é o problema operacional que mais tempo lhe ocupa neste momento?</Quote>
    <P>Responda a este email e diga-me. Leio todas as respostas, e as mais comuns tornam-se futuras edições.</P>
    <P>Se conhece alguém que carrega o negócio inteiro às costas, envie-lhe o seu link pessoal:</P>
    <Details rows={[['O seu link', <TextLink href="{{referralLink}}">{'{{referralLink}}'}</TextLink>]]} />
    <Signature lang="pt" />
  </Layout>);

add('seq-day3-en', 'The founder who outgrew the business',
  <Layout lang="en" eyebrow={NAME.en} preview="It is not a personal failing. It is a structure problem." footer={seqFooter.en}>
    <H>The founder who outgrew the business</H>
    <P>{'{{greeting}}'}</P>
    <P>Most founders I meet have built something real. Revenue is growing, the team is expanding, and they are still in every decision, running on instinct and firefighting instead of working a plan.</P>
    <P>That is not a personal failing. The operation simply didn&apos;t grow with the business, and that has a fix: a clear cadence, clear ownership, and standards you can measure.</P>
    <P>Here is how I approach it, step by step, from current state to tracked execution:</P>
    <Cta href={`${SITE}/business-advisory/`}>See how the advisory works</Cta>
    <P>Or see what it changed for a brand activation agency: <TextLink href={`${SITE}/case-studies/yunik/`}>30% fewer decisions on the owner&apos;s desk</TextLink>.</P>
    <Signature lang="en" />
  </Layout>);
add('seq-day3-pt', 'O fundador que cresceu mais do que o seu negócio',
  <Layout lang="pt" eyebrow={NAME.pt} preview="Não é uma falha pessoal. É um problema de estrutura." footer={seqFooter.pt}>
    <H>O fundador que cresceu mais do que o seu negócio</H>
    <P>{'{{greeting}}'}</P>
    <P>A maioria dos fundadores que conheço construiu algo real. A receita está a crescer, a equipa está a expandir, e continuam envolvidos em todas as decisões, a funcionar por instinto e a apagar fogos em vez de seguir um plano.</P>
    <P>Isso não é uma falha pessoal. As operações não acompanharam o crescimento do negócio, e isso tem solução: uma cadência clara, responsabilidades claras e padrões que se podem medir.</P>
    <P>É assim que trabalho, passo a passo, do estado atual à execução acompanhada:</P>
    <Cta href={`${SITE}/pt/business-advisory/`}>Ver como funciona a assessoria</Cta>
    <Signature lang="pt" />
  </Layout>);

add('seq-day7-en', 'Worth 30 minutes?',
  <Layout lang="en" eyebrow={NAME.en} preview="A direct offer, no pitch deck." footer={seqFooter.en}>
    <H>Worth 30 minutes?</H>
    <P>{'{{greeting}}'}</P>
    <P>A week in, so a direct question: is there one operational problem you would like off your plate this quarter?</P>
    <P>If so, book a 30-minute discovery call. We look at where time and money are leaking, and you leave with the first fix, whether or not we work together.</P>
    <Cta href={`${SITE}/book/`}>Book a discovery call</Cta>
    <P>Not the right time? No problem. The newsletter keeps coming, and your referral link still works: <TextLink href="{{referralLink}}">{'{{referralLink}}'}</TextLink></P>
    <Signature lang="en" />
  </Layout>);
add('seq-day7-pt', 'Vale 30 minutos?',
  <Layout lang="pt" eyebrow={NAME.pt} preview="Uma proposta direta, sem apresentações." footer={seqFooter.pt}>
    <H>Vale 30 minutos?</H>
    <P>{'{{greeting}}'}</P>
    <P>Uma semana depois, uma pergunta direta: há algum problema operacional que gostaria de resolver este trimestre?</P>
    <P>Se sim, marque uma chamada exploratória de 30 minutos. Vemos onde se está a perder tempo e dinheiro, e sai com a primeira correção, quer trabalhemos juntos ou não.</P>
    <Cta href={`${SITE}/pt/book/`}>Marcar chamada exploratória</Cta>
    <P>Não é o momento certo? Sem problema. A newsletter continua a chegar, e o seu link de recomendação continua ativo: <TextLink href="{{referralLink}}">{'{{referralLink}}'}</TextLink></P>
    <Signature lang="pt" />
  </Layout>);

// ---------------- free resource delivery ----------------
add('resource-en', 'Your copy: {{resourceTitle}}',
  <Layout lang="en" eyebrow="Free resource" preview="{{preview}}" footer={<>You are receiving this because you requested a free resource at nunofontoura.com. This is a one-off email.</>}>
    <H>{'{{resourceTitle}}'}</H>
    <P>Hi,</P>
    <P>Here is your copy, as requested. It&apos;s a fillable PDF: type straight into it on screen, save it, and share it with your team.</P>
    <Cta href="{{downloadUrl}}">{'{{downloadLabel}}'}</Cta>
    <Details rows={[['How to use it', '{{howTo}}']]} />
    <P>{'{{next}}'}</P>
    <Cta href={VOS}>Take the free VOS assessment</Cta>
    <P>If anything in it doesn&apos;t make sense for your agency, reply to this email. I read every reply.</P>
    <Signature lang="en" />
  </Layout>);

// ---------------- discovery call bookings ----------------
const B = {
  en: {
    eyebrow: 'Discovery call', footer: <>You are receiving this because you booked a discovery call at nunofontoura.com. <a href="{{manageLink}}" style={{ color: '#77726f' }}>Reschedule or cancel</a></>,
    when: 'When', where: 'Where', length: 'Length', meet: 'Google Meet', mins: '30 minutes', join: 'Join Google Meet', change: 'Need to change it?', manage: 'Reschedule or cancel',
    prep: 'To make the most of the 30 minutes, take the free VOS assessment beforehand and pick the one problem you most want to fix.', vos: 'Take the free VOS assessment',
  },
  pt: {
    eyebrow: 'Chamada exploratória', footer: <>Recebe este email porque marcou uma chamada exploratória em nunofontoura.com. <a href="{{manageLink}}" style={{ color: '#77726f' }}>Reagendar ou cancelar</a></>,
    when: 'Quando', where: 'Onde', length: 'Duração', meet: 'Google Meet', mins: '30 minutos', join: 'Entrar no Google Meet', change: 'Precisa de alterar?', manage: 'Reagendar ou cancelar',
    prep: 'Para aproveitar bem os 30 minutos, faça antes a avaliação VOS gratuita e escolha o problema que mais quer resolver.', vos: 'Fazer a avaliação VOS gratuita',
  },
};
for (const lang of ['en', 'pt'] as const) {
  const t = B[lang];
  const details = <Details rows={[[t.when, '{{when}}'], [t.where, t.meet], [t.length, t.mins]]} />;
  const manage = <P>{t.change} <TextLink href="{{manageLink}}">{t.manage}</TextLink></P>;
  const copy = lang === 'en'
    ? {
        confirmed: ['Confirmed: discovery call on {{day}}, {{time}}', 'Your discovery call is booked.', 'Your 30-minute discovery call is booked. A calendar invitation from nuno@nabiaedge.com is on its way too.', 'Your call is booked'],
        rescheduled: ['Rescheduled: discovery call on {{day}}, {{time}}', 'Your discovery call has a new time.', 'Your discovery call has moved to a new time. The calendar invitation has been updated.', 'Your call has a new time'],
        reminder24: ['Tomorrow at {{time}}: our discovery call', 'A quick reminder about tomorrow.', 'A reminder that our discovery call is tomorrow.', 'See you tomorrow'],
        reminder1: ['In 1 hour: our discovery call', 'Starting in an hour.', 'Our discovery call starts in an hour.', 'Starting in an hour'],
      }
    : {
        confirmed: ['Confirmada: chamada exploratória a {{day}}, {{time}}', 'A sua chamada exploratória está marcada.', 'A sua chamada exploratória de 30 minutos está marcada. Vai também receber um convite de calendário de nuno@nabiaedge.com.', 'A sua chamada está marcada'],
        rescheduled: ['Reagendada: chamada exploratória a {{day}}, {{time}}', 'A sua chamada tem uma nova hora.', 'A sua chamada exploratória mudou de hora. O convite de calendário foi atualizado.', 'A sua chamada tem nova hora'],
        reminder24: ['Amanhã às {{time}}: a nossa chamada exploratória', 'Um lembrete rápido para amanhã.', 'Lembrete: a nossa chamada exploratória é amanhã.', 'Até amanhã'],
        reminder1: ['Daqui a 1 hora: a nossa chamada exploratória', 'Começa daqui a uma hora.', 'A nossa chamada exploratória começa daqui a uma hora.', 'Começa daqui a uma hora'],
      };
  for (const kind of ['confirmed', 'rescheduled', 'reminder24', 'reminder1'] as const) {
    const [subject, preview, lead, heading] = copy[kind];
    add(`booking-${kind}-${lang}`, subject,
      <Layout lang={lang} eyebrow={t.eyebrow} preview={preview} footer={t.footer}>
        <H>{heading}</H>
        <P>{'{{greeting}}'}</P>
        <P>{lead}</P>
        {details}
        <Cta href="{{meetLink}}">{t.join}</Cta>
        {kind !== 'reminder1' && <P>{t.prep} <TextLink href={VOS}>{t.vos}</TextLink></P>}
        {manage}
        <Signature lang={lang} />
      </Layout>);
  }
  add(`booking-followup-${lang}`, lang === 'en' ? 'Thanks for the call' : 'Obrigado pela chamada',
    <Layout lang={lang} eyebrow={t.eyebrow} preview={lang === 'en' ? 'The next step, as promised.' : 'O próximo passo, como combinado.'} footer={lang === 'en' ? <>You are receiving this because you had a discovery call booked at nunofontoura.com.</> : <>Recebe este email porque tinha uma chamada exploratória marcada em nunofontoura.com.</>}>
      <H>{lang === 'en' ? 'Thanks for the call' : 'Obrigado pela chamada'}</H>
      <P>{'{{greeting}}'}</P>
      <P>{lang === 'en' ? 'Thanks for making the time yesterday.' : 'Obrigado pelo tempo de ontem.'}</P>
      <P>{lang === 'en' ? 'If you haven’t already, the free VOS assessment scores your business across all three pillars, so you can see exactly where the next fix should go.' : 'Se ainda não fez, a avaliação VOS gratuita pontua o seu negócio nos três pilares, para ver exatamente onde deve estar a próxima correção.'}</P>
      <Cta href={VOS}>{t.vos}</Cta>
      <P>{lang === 'en' ? 'And if anything we discussed needs a second look, just reply to this email.' : 'E se algo do que falámos precisar de uma segunda análise, basta responder a este email.'}</P>
      <Signature lang={lang} />
    </Layout>);
  add(`booking-cancelled-${lang}`, lang === 'en' ? 'Cancelled: discovery call on {{day}}' : 'Cancelada: chamada exploratória a {{day}}',
    <Layout lang={lang} eyebrow={t.eyebrow} preview={lang === 'en' ? 'Your discovery call is cancelled.' : 'A sua chamada exploratória foi cancelada.'} footer={lang === 'en' ? <>You are receiving this because you cancelled a discovery call at nunofontoura.com.</> : <>Recebe este email porque cancelou uma chamada exploratória em nunofontoura.com.</>}>
      <H>{lang === 'en' ? 'Your call is cancelled' : 'A sua chamada foi cancelada'}</H>
      <P>{'{{greeting}}'}</P>
      <P>{lang === 'en' ? 'Your discovery call is cancelled, and the calendar invitation has been removed.' : 'A sua chamada exploratória foi cancelada e o convite de calendário removido.'}</P>
      <Details rows={[[lang === 'en' ? 'Was' : 'Era', '{{when}}']]} />
      <Cta href="{{rebookUrl}}">{lang === 'en' ? 'Book another time' : 'Marcar outra hora'}</Cta>
      <Signature lang={lang} />
    </Layout>);
  add(`request-ack-${lang}`, lang === 'en' ? 'I got your suggested times' : 'Recebi as suas sugestões de horário',
    <Layout lang={lang} eyebrow={t.eyebrow} preview={lang === 'en' ? 'I’ll confirm a time shortly.' : 'Confirmo uma hora em breve.'} footer={lang === 'en' ? <>You are receiving this because you suggested a call time at nunofontoura.com.</> : <>Recebe este email porque sugeriu uma hora para uma chamada em nunofontoura.com.</>}>
      <H>{lang === 'en' ? 'Thanks, I’ve got your times' : 'Obrigado, recebi as suas horas'}</H>
      <P>{'{{greeting}}'}</P>
      <P>{lang === 'en' ? 'You suggested these times for a discovery call:' : 'Sugeriu estas horas para uma chamada exploratória:'}</P>
      <Details rows={[[lang === 'en' ? 'Times' : 'Horas', '{{{times}}}']]} />
      <P>{lang === 'en' ? 'I’ll confirm one of them, or propose another, by the end of the next working day. Once it’s confirmed you’ll get the calendar invitation with the Google Meet link.' : 'Confirmo uma delas ou proponho outra até ao fim do próximo dia útil. Assim que estiver confirmada, recebe o convite de calendário com o link do Google Meet.'}</P>
      <Signature lang={lang} />
    </Layout>);
  add(`referral-link-${lang}`, lang === 'en' ? `Your ${NAME.en} referral link` : `O seu link de recomendação das ${NAME.pt}`,
    <Layout lang={lang} eyebrow={NAME[lang]} preview={lang === 'en' ? 'Here is your personal link.' : 'Aqui está o seu link pessoal.'} footer={lang === 'en' ? <>You asked for your referral link at nunofontoura.com.</> : <>Pediu o seu link de recomendação em nunofontoura.com.</>}>
      <H>{lang === 'en' ? 'Your referral link' : 'O seu link de recomendação'}</H>
      <P>{lang === 'en' ? 'Here is your personal link. Everyone who subscribes through it counts toward you.' : 'Aqui está o seu link pessoal. Cada pessoa que subscreve através dele conta para si.'}</P>
      <Details rows={[[lang === 'en' ? 'Link' : 'Link', <TextLink href="{{referralLink}}">{'{{referralLink}}'}</TextLink>], [lang === 'en' ? 'Referrals' : 'Recomendações', '{{count}}']]} />
      <Cta href={lang === 'en' ? `${SITE}/leaderboard/` : `${SITE}/pt/leaderboard/`}>{lang === 'en' ? 'See the leaderboard' : 'Ver a tabela'}</Cta>
      <Signature lang={lang} />
    </Layout>);
}

// ---------------- alerts to Nuno ----------------
add('owner-alert', '{{title}}',
  <Layout lang="en" eyebrow="Website alert" preview="{{title}}" footer={<>Sent by nunofontoura.com.</>}>
    <H>{'{{heading}}'}</H>
    <P>{'{{intro}}'}</P>
    {'{{{actions}}}'}
    {'{{{rows}}}'}
    {'{{{extra}}}'}
  </Layout>);

export const EMAILS = E;
