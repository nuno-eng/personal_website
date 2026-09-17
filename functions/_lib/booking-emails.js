// Emails for discovery call bookings (EN/PT).
import { escapeHtml } from './http.js';
import { button, paragraph, wrap } from './email-templates.js';
import { formatWhen } from './timezone.js';
import { LABELS } from './booking-config.js';

const VOS = 'https://vos.nabiaedge.com/trial';

const T = {
  en: {
    hi: (n) => `Hi ${n},`,
    join: 'Join Google Meet',
    manage: 'Need to change it? Reschedule or cancel',
    invite: 'A calendar invitation from nuno@nabiaedge.com is also on its way.',
    prep: 'To make the most of 30 minutes, take the free VOS assessment beforehand and pick the one problem you most want to fix.',
    vosCta: 'Take the free VOS assessment',
    footer: 'You are receiving this because you booked a discovery call at nunofontoura.com.',
    confirmed: { subject: (w) => `Confirmed: discovery call on ${w.day}, ${w.time}`, preview: 'Your 30-minute discovery call is booked.', lead: (w) => `Your 30-minute discovery call is booked for <strong>${escapeHtml(w.full)}</strong>.` },
    rescheduled: { subject: (w) => `Rescheduled: discovery call on ${w.day}, ${w.time}`, preview: 'Your discovery call has a new time.', lead: (w) => `Your discovery call has moved to <strong>${escapeHtml(w.full)}</strong>. The calendar invitation has been updated.` },
    reminder24: { subject: (w) => `Tomorrow at ${w.time}: our discovery call`, preview: 'A quick reminder about tomorrow.', lead: (w) => `A reminder that our discovery call is tomorrow, <strong>${escapeHtml(w.full)}</strong>.` },
    reminder1: { subject: (w) => `In 1 hour: our discovery call`, preview: 'Starting in an hour.', lead: (w) => `Our discovery call starts in an hour, at <strong>${escapeHtml(w.time)} (${escapeHtml(w.zone)})</strong>.` },
    followup: { subject: () => 'Thanks for the call', preview: 'The next step, as promised.', lead: () => 'Thanks for making the time yesterday.' },
    followupBody: 'If you haven’t already, the free VOS assessment scores your business across all three pillars, so you can see exactly where the next fix should go.',
    followupReply: 'And if anything we discussed needs a second look, just reply to this email.',
    cancelled: { subject: (w) => `Cancelled: discovery call on ${w.day}`, preview: 'Your discovery call is cancelled.', lead: (w) => `Your discovery call on <strong>${escapeHtml(w.full)}</strong> is cancelled.` },
    rebook: 'Book another time',
    signoff: 'Nuno',
  },
  pt: {
    hi: (n) => `Olá ${n},`,
    join: 'Entrar no Google Meet',
    manage: 'Precisa de alterar? Reagendar ou cancelar',
    invite: 'Vai também receber um convite de calendário de nuno@nabiaedge.com.',
    prep: 'Para aproveitar bem os 30 minutos, faça antes a avaliação VOS gratuita e escolha o problema que mais quer resolver.',
    vosCta: 'Fazer a avaliação VOS gratuita',
    footer: 'Recebe este email porque marcou uma chamada exploratória em nunofontoura.com.',
    confirmed: { subject: (w) => `Confirmada: chamada exploratória a ${w.day}, ${w.time}`, preview: 'A sua chamada exploratória de 30 minutos está marcada.', lead: (w) => `A sua chamada exploratória de 30 minutos está marcada para <strong>${escapeHtml(w.full)}</strong>.` },
    rescheduled: { subject: (w) => `Reagendada: chamada exploratória a ${w.day}, ${w.time}`, preview: 'A sua chamada tem uma nova hora.', lead: (w) => `A sua chamada exploratória passou para <strong>${escapeHtml(w.full)}</strong>. O convite de calendário foi atualizado.` },
    reminder24: { subject: (w) => `Amanhã às ${w.time}: a nossa chamada exploratória`, preview: 'Um lembrete rápido para amanhã.', lead: (w) => `Lembrete: a nossa chamada exploratória é amanhã, <strong>${escapeHtml(w.full)}</strong>.` },
    reminder1: { subject: () => 'Daqui a 1 hora: a nossa chamada exploratória', preview: 'Começa daqui a uma hora.', lead: (w) => `A nossa chamada exploratória começa daqui a uma hora, às <strong>${escapeHtml(w.time)} (${escapeHtml(w.zone)})</strong>.` },
    followup: { subject: () => 'Obrigado pela chamada', preview: 'O próximo passo, como combinado.', lead: () => 'Obrigado pelo tempo de ontem.' },
    followupBody: 'Se ainda não fez, a avaliação VOS gratuita pontua o seu negócio nos três pilares, para ver exatamente onde deve estar a próxima correção.',
    followupReply: 'E se algo do que falámos precisar de uma segunda análise, basta responder a este email.',
    cancelled: { subject: (w) => `Cancelada: chamada exploratória a ${w.day}`, preview: 'A sua chamada exploratória foi cancelada.', lead: (w) => `A sua chamada exploratória de <strong>${escapeHtml(w.full)}</strong> foi cancelada.` },
    rebook: 'Marcar outra hora',
    signoff: 'Nuno',
  },
};

export function renderBookingEmail(kind, { booking, base, manageLink }) {
  const lang = booking.lang === 'pt' ? 'pt' : 'en';
  const t = T[lang];
  const w = formatWhen(new Date(booking.start_utc), booking.tz, lang);
  const k = t[kind];
  const subject = k.subject(w);
  const firstName = booking.name.split(' ')[0];
  const html = [paragraph(escapeHtml(t.hi(firstName))), paragraph(k.lead(w))];
  const text = [t.hi(firstName), k.lead(w).replace(/<[^>]+>/g, '')];

  if (kind === 'followup') {
    html.push(paragraph(escapeHtml(t.followupBody)), button(t.vosCta, VOS), paragraph(escapeHtml(t.followupReply)));
    text.push(t.followupBody, `${t.vosCta}: ${VOS}`, t.followupReply);
  } else if (kind === 'cancelled') {
    const rebook = `${base}${lang === 'pt' ? '/pt' : ''}/book/`;
    html.push(button(t.rebook, rebook));
    text.push(`${t.rebook}: ${rebook}`);
  } else {
    if (booking.meet_link) {
      html.push(button(t.join, booking.meet_link));
      text.push(`${t.join}: ${booking.meet_link}`);
    }
    if (kind === 'confirmed') { html.push(paragraph(escapeHtml(t.invite))); text.push(t.invite); }
    if (kind === 'confirmed' || kind === 'reminder24' || kind === 'rescheduled') {
      html.push(paragraph(`${escapeHtml(t.prep)} <a href="${VOS}" style="color:#1E3A8A;font-weight:700;">${escapeHtml(t.vosCta)}</a>`));
      text.push(t.prep, `${t.vosCta}: ${VOS}`);
    }
    html.push(paragraph(`<a href="${escapeHtml(manageLink)}" style="color:#1E3A8A;">${escapeHtml(t.manage)}</a>`));
    text.push(`${t.manage}: ${manageLink}`);
  }
  html.push(paragraph(escapeHtml(t.signoff)));
  text.push(t.signoff);

  return {
    subject,
    text: `${text.join('\n\n')}\n\n---\n${t.footer}\n`,
    html: wrap({ lang, subject, preview: k.preview, bodyHtml: html.join('\n'), footerHtml: escapeHtml(t.footer) }),
  };
}

export function renderOwnerAlert(kind, { booking, manageLink }) {
  const w = formatWhen(new Date(booking.start_utc), 'Europe/Lisbon', 'en');
  const L = LABELS.en;
  const title = { confirmed: 'New discovery call', rescheduled: 'Discovery call rescheduled', cancelled: 'Discovery call cancelled' }[kind];
  const lines = [
    `When (Lisbon): ${w.full}`,
    `Name: ${booking.name}`,
    `Email: ${booking.email}`,
    `Agency: ${booking.agency}`,
    `Type: ${L.agencyType[booking.agency_type] || '-'}`,
    `Team size: ${L.teamSize[booking.team_size] || '-'}`,
    `Urgency: ${L.urgency[booking.urgency] || '-'}`,
    `Heard from: ${L.heardFrom[booking.heard_from] || '-'}`,
    `Language: ${booking.lang} · Their time zone: ${booking.tz}`,
    `Booked from: ${booking.source || '-'}`,
    '',
    'Problem to fix:',
    booking.problem,
    '',
    `Meet: ${booking.meet_link || '-'}`,
    `Reschedule/cancel (keeps reminders in sync; don't delete the event in Google Calendar): ${manageLink}`,
  ];
  return {
    subject: `${title}: ${booking.name}, ${booking.agency} (${w.day} ${w.time})`,
    text: lines.join('\n'),
    html: `<pre style="font:14px/1.6 monospace;white-space:pre-wrap">${escapeHtml(lines.join('\n'))}</pre>`,
  };
}
