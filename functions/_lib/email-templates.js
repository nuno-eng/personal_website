// Welcome-sequence emails (welcome, day 3, day 7) in English and Portuguese.
// These run in a Pages Function (Workers runtime, no JSX build step), so they
// are plain HTML strings. The newsletter issues themselves are React Email
// templates in newsletter-sender/.
//
// Edit the copy in COPY below. Colours and font match the website's
// Modernist design system (publish/ds/styles.css).

import { escapeHtml } from './http.js';

export const NEWSLETTER_NAME = { en: 'Operating Notes', pt: 'Notas Operacionais' };
const BOOKING_URL = 'https://www.nunofontoura.com/book/';

const COLOR = { bg: '#f3f2f2', surface: '#ffffff', text: '#201e1d', muted: '#7d7979', accent: '#1E3A8A', rule: '#d7d3d3' };
const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif";

// Each email is a list of blocks: strings are paragraphs, { link: true } is the
// subscriber's referral link on its own line, { button, href } is the accent
// button. "{referralLink}" inside a paragraph is replaced with the link.
const COPY = {
  en: {
    greeting: (name) => (name ? `Hi ${name},` : 'Hi,'),
    signoff: 'Nuno',
    unsubscribe: 'Unsubscribe',
    footer: 'You are receiving this because you subscribed at nunofontoura.com.',
    welcome: {
      subject: `You're in: ${NEWSLETTER_NAME.en}`,
      preview: 'What to expect, and one question for you.',
      blocks: [
        `Thanks for subscribing to ${NEWSLETTER_NAME.en}. Every two weeks you get one operational idea for founder-led agencies: how work gets done, who owns what, and how to stop being the bottleneck. Drawn from six years in the Portuguese Marines, seven and a half at Amazon, and the founders I work with now.`,
        "No motivation, no filler. If an issue doesn't change what you do on Monday, I haven't done my job.",
        'One question to start: what is the operational problem taking most of your time right now? Hit reply and tell me. I read every answer, and the most common ones become future issues.',
        'If someone you know is carrying their whole business on their back, send them your personal link:',
        { link: true },
      ],
    },
    day3: {
      subject: 'The founder who outgrew the business',
      preview: 'It is not a personal failing. It is a structure problem.',
      blocks: [
        'Most founders I meet have built something real. Revenue is growing, the team is expanding, and they are still in every decision, running on instinct and firefighting instead of working a plan.',
        "That is not a personal failing. The operation simply didn't grow with the business, and that has a fix: a clear cadence, clear ownership, and standards you can measure.",
        'Here is how I approach it, step by step, from current state to tracked execution:',
        { button: 'See how the advisory works', href: 'https://www.nunofontoura.com/business-advisory/' },
      ],
    },
    day7: {
      subject: 'Worth 30 minutes?',
      preview: 'A direct offer, no pitch deck.',
      blocks: [
        'A week in, so a direct question: is there one operational problem you would like off your plate this quarter?',
        'If so, book a 30-minute call. We look at where time and money are leaking, and you leave with the first fix, whether or not we work together.',
        { button: 'Book a 30-minute call', href: BOOKING_URL },
        'Not the right time? No problem. The newsletter keeps coming, and your referral link still works: {referralLink}',
      ],
    },
  },
  pt: {
    greeting: (name) => (name ? `Olá ${name},` : 'Olá,'),
    signoff: 'Nuno',
    unsubscribe: 'Cancelar subscrição',
    footer: 'Recebe este email porque subscreveu em nunofontoura.com.',
    welcome: {
      subject: `Bem-vindo às ${NEWSLETTER_NAME.pt}`,
      preview: 'O que esperar, e uma pergunta para si.',
      blocks: [
        `Obrigado por subscrever as ${NEWSLETTER_NAME.pt}. De duas em duas semanas recebe uma ideia operacional para agências lideradas por fundadores: como o trabalho se faz, quem é responsável pelo quê, e como deixar de ser o gargalo. Com base em seis anos nos Fuzileiros, sete anos e meio na Amazon, e nos fundadores com quem trabalho hoje.`,
        'Sem motivação vazia, sem enchimento. Se uma edição não mudar o que faz na segunda-feira, não fiz o meu trabalho.',
        'Uma pergunta para começar: qual é o problema operacional que mais tempo lhe ocupa neste momento? Responda a este email e diga-me. Leio todas as respostas, e as mais comuns tornam-se futuras edições.',
        'Se conhece alguém que carrega o negócio inteiro às costas, envie-lhe o seu link pessoal:',
        { link: true },
      ],
    },
    day3: {
      subject: 'O fundador que cresceu mais do que o seu negócio',
      preview: 'Não é uma falha pessoal. É um problema de estrutura.',
      blocks: [
        'A maioria dos fundadores que conheço construiu algo real. A receita está a crescer, a equipa está a expandir, e continuam envolvidos em todas as decisões, a funcionar por instinto e a apagar fogos em vez de seguir um plano.',
        'Isso não é uma falha pessoal. As operações não acompanharam o crescimento do negócio, e isso tem solução: uma cadência clara, responsabilidades claras e padrões que se podem medir.',
        'É assim que trabalho, passo a passo, do estado atual à execução acompanhada:',
        { button: 'Ver como funciona a assessoria', href: 'https://www.nunofontoura.com/pt/business-advisory/' },
      ],
    },
    day7: {
      subject: 'Vale 30 minutos?',
      preview: 'Uma proposta direta, sem apresentações.',
      blocks: [
        'Uma semana depois, uma pergunta direta: há algum problema operacional que gostaria de resolver este trimestre?',
        'Se sim, marque uma chamada de 30 minutos. Vemos onde se está a perder tempo e dinheiro, e sai com a primeira correção, quer trabalhemos juntos ou não.',
        { button: 'Marcar chamada de 30 minutos', href: 'https://www.nunofontoura.com/pt/book/' },
        'Não é o momento certo? Sem problema. A newsletter continua a chegar, e o seu link de recomendação continua ativo: {referralLink}',
      ],
    },
  },
};

export function paragraph(text) {
  return `<p style="font-family:${FONT};font-size:16px;line-height:26px;color:${COLOR.text};margin:0 0 18px;">${text}</p>`;
}

export function button(label, href) {
  return `<p style="margin:8px 0 26px;"><a href="${escapeHtml(href)}" style="display:inline-block;background:${COLOR.accent};color:${COLOR.bg};font-family:${FONT};font-size:15px;font-weight:800;text-decoration:none;padding:14px 22px;">${escapeHtml(label)}</a></p>`;
}

// The branded frame shared by every email: header strip, body, footer.
export function wrap({ lang, subject, preview, bodyHtml, footerHtml }) {
  return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${COLOR.bg};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:${COLOR.surface};border-top:4px solid ${COLOR.accent};">
<tr><td style="padding:28px 32px 4px;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${COLOR.accent};">${escapeHtml(NEWSLETTER_NAME[lang] || NEWSLETTER_NAME.en)} &middot; Nuno Fontoura</td></tr>
<tr><td style="padding:20px 32px 12px;">${bodyHtml}</td></tr>
<tr><td style="padding:0 32px 28px;border-top:1px solid ${COLOR.rule};">
<p style="font-family:${FONT};font-size:12px;line-height:18px;color:${COLOR.muted};margin:18px 0 0;">${footerHtml}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function renderSequenceEmail(kind, { lang, name, referralLink, unsubLink }) {
  const copy = COPY[lang] || COPY.en;
  const email = copy[kind];
  const refAnchor = referralLink
    ? `<a href="${escapeHtml(referralLink)}" style="color:${COLOR.accent};font-weight:700;word-break:break-all;">${escapeHtml(referralLink)}</a>`
    : '';

  const html = [paragraph(escapeHtml(copy.greeting(name)))];
  const text = [copy.greeting(name)];

  for (const block of email.blocks) {
    if (typeof block === 'string') {
      if (block.includes('{referralLink}') && !referralLink) continue;
      html.push(paragraph(block.split('{referralLink}').map(escapeHtml).join(refAnchor)));
      text.push(block.replaceAll('{referralLink}', referralLink || ''));
    } else if (block.link) {
      if (!referralLink) continue;
      html.push(paragraph(refAnchor));
      text.push(referralLink);
    } else if (block.button) {
      html.push(button(block.button, block.href));
      text.push(`${block.button}: ${block.href}`);
    }
  }

  html.push(paragraph(escapeHtml(copy.signoff)));
  text.push(copy.signoff);

  const unsubHtml = unsubLink
    ? ` <a href="${escapeHtml(unsubLink)}" style="color:${COLOR.muted};text-decoration:underline;">${escapeHtml(copy.unsubscribe)}</a>`
    : '';

  return {
    subject: email.subject,
    text: `${text.join('\n\n')}\n\n---\n${copy.footer}${unsubLink ? `\n${copy.unsubscribe}: ${unsubLink}` : ''}\n`,
    html: wrap({ lang, subject: email.subject, preview: email.preview, bodyHtml: html.join('\n'), footerHtml: escapeHtml(copy.footer) + unsubHtml }),
  };
}

// Delivery email for a free resource requested on /free-resources/. It is
// transactional (the person asked for this file), so it has no unsubscribe
// link; the newsletter is only added when they ticked the opt-in box.
export function renderResourceEmail(resource, { base }) {
  const url = `${base}${resource.file}`;
  const subject = `Your copy: ${resource.title}`;
  const body = [
    paragraph('Hi,'),
    paragraph(`Here is ${escapeHtml(resource.title)}, as requested.`),
    button(resource.cta, url),
    paragraph(escapeHtml(resource.howTo)),
    paragraph(escapeHtml(resource.next)),
    button('Take the free VOS assessment', 'https://vos.nabiaedge.com/trial'),
    paragraph('If anything in it doesn&rsquo;t make sense for your agency, reply to this email. I read every reply.'),
    paragraph('Nuno'),
  ];
  const text = [
    'Hi,',
    `Here is ${resource.title}, as requested.`,
    `${resource.cta}: ${url}`,
    resource.howTo,
    resource.next,
    'Take the free VOS assessment: https://vos.nabiaedge.com/trial',
    "If anything in it doesn't make sense for your agency, reply to this email. I read every reply.",
    'Nuno',
  ];
  const footer = 'You are receiving this because you requested a free resource at nunofontoura.com.';
  return {
    subject,
    text: `${text.join('\n\n')}\n\n---\n${footer}\n`,
    html: wrap({ lang: 'en', subject, preview: resource.preview, bodyHtml: body.join('\n'), footerHtml: escapeHtml(footer) }),
  };
}
