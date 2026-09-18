// Booking emails (discovery calls and networking meetings). Layout and copy: newsletter-sender/transactional/definitions.tsx.
import { escapeHtml } from './http.js';
import { ownerAlert, renderEmail } from './emails.js';
import { formatWhen } from './timezone.js';
import { KINDS, LABELS, kindOf } from './booking-config.js';

const greet = (lang, name) => (lang === 'pt' ? `Olá ${name.split(' ')[0]},` : `Hi ${name.split(' ')[0]},`);

export function renderBookingEmail(kind, { booking, base, manageLink }) {
  const lang = booking.lang === 'pt' ? 'pt' : 'en';
  const w = formatWhen(new Date(booking.start_utc), booking.tz, lang);
  const k = kindOf(booking.kind);
  return renderEmail(`${k === 'networking' ? 'meeting' : 'booking'}-${kind}-${lang}`, {
    greeting: greet(lang, booking.name),
    when: w.full, day: w.day, time: w.time,
    meetLink: booking.meet_link || `${base}${lang === 'pt' ? '/pt' : ''}/call-booked/`,
    manageLink: manageLink || `${base}${lang === 'pt' ? '/pt' : ''}/book/`,
    rebookUrl: `${base}${KINDS[k].page[lang]}`,
  });
}

function answerRows(x) {
  const L = LABELS.en;
  if (kindOf(x.kind) === 'networking') {
    return [
      ['Name', x.name], ['Email', x.email], ['Company', x.agency], ['Website / LinkedIn', x.website || '-'],
      ['Wants to talk about', x.problem], ['Heard from', L.heardFrom[x.heard_from] || '-'],
      ['Language', `${x.lang} · their time zone ${x.tz}`], ['Source', x.source || '-'],
    ];
  }
  return [
    ['Name', x.name], ['Email', x.email], ['Agency', x.agency], ['Website', x.website || '-'],
    ['Type', L.agencyType[x.agency_type] || '-'], ['Team size', L.teamSize[x.team_size] || '-'],
    ['Urgency', L.urgency[x.urgency] || '-'], ['Heard from', L.heardFrom[x.heard_from] || '-'],
    ['Problem', x.problem], ['Language', `${x.lang} · their time zone ${x.tz}`], ['Source', x.source || '-'],
  ];
}

export function renderOwnerAlert(kind, { booking, manageLink }) {
  const w = formatWhen(new Date(booking.start_utc), 'Europe/London', 'en');
  const what = KINDS[kindOf(booking.kind)].title;
  const title = { confirmed: `New ${what.toLowerCase()}`, rescheduled: `${what} rescheduled`, cancelled: `${what} cancelled` }[kind];
  const alert = ownerAlert({
    title: `${title}: ${booking.name}, ${booking.agency} (${w.day} ${w.time})`,
    heading: title,
    intro: `${w.full}, UK time.${kind === 'cancelled' ? '' : ' Use the links below to reschedule or cancel, so the reminders stay in sync. Don’t edit the event in Google Calendar directly.'}`,
    actions: kind === 'cancelled' ? [] : [['Join Google Meet', booking.meet_link || ''], ['Reschedule or cancel', manageLink]].filter(([, h]) => h),
    rows: answerRows(booking),
  });
  return alert;
}

export function renderRequestAck(req) {
  const lang = req.lang === 'pt' ? 'pt' : 'en';
  const times = req.options.map((o) => formatWhen(new Date(o), req.tz, lang).full);
  return renderEmail(`${kindOf(req.kind) === 'networking' ? 'meeting-' : ''}request-ack-${lang}`, { greeting: greet(lang, req.name) }, {
    times: { html: times.map(escapeHtml).join('<br>'), text: times.join('\n') },
  });
}

export function renderRequestAlert(req, { approveLink }) {
  const actions = req.options.map((o, i) => {
    const lis = formatWhen(new Date(o), 'Europe/London', 'en');
    const theirs = req.tz !== 'Europe/London' ? ` · their time ${formatWhen(new Date(o), req.tz, 'en').time} ${req.tz}` : '';
    return [`Book ${lis.day.replace(/ \d{4}$/, '')}, ${lis.time}`, approveLink(i), `UK time${theirs}`];
  });
  return {
    ...ownerAlert({
      title: `Time request (${KINDS[kindOf(req.kind)].title.toLowerCase()}): ${req.name}, ${req.agency}`,
      heading: `Suggested times: ${KINDS[kindOf(req.kind)].title.toLowerCase()}`,
      intro: `${req.name} couldn’t find a slot and suggested these times. Click one to book it: the calendar event, Meet link and confirmation go out automatically. None work? Reply to this email to write to them directly.`,
      actions,
      rows: [...answerRows(req), ...(req.note ? [['Note', req.note]] : [])],
    }),
    replyTo: req.email,
  };
}
