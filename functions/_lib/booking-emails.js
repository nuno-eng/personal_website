// Discovery call emails. Layout and copy: newsletter-sender/transactional/definitions.tsx.
import { escapeHtml } from './http.js';
import { ownerAlert, renderEmail } from './emails.js';
import { formatWhen } from './timezone.js';
import { LABELS } from './booking-config.js';

const greet = (lang, name) => (lang === 'pt' ? `Olá ${name.split(' ')[0]},` : `Hi ${name.split(' ')[0]},`);

export function renderBookingEmail(kind, { booking, base, manageLink }) {
  const lang = booking.lang === 'pt' ? 'pt' : 'en';
  const w = formatWhen(new Date(booking.start_utc), booking.tz, lang);
  return renderEmail(`booking-${kind}-${lang}`, {
    greeting: greet(lang, booking.name),
    when: w.full, day: w.day, time: w.time,
    meetLink: booking.meet_link || `${base}${lang === 'pt' ? '/pt' : ''}/call-booked/`,
    manageLink: manageLink || `${base}${lang === 'pt' ? '/pt' : ''}/book/`,
    rebookUrl: `${base}${lang === 'pt' ? '/pt' : ''}/book/`,
  });
}

function answerRows(x) {
  const L = LABELS.en;
  return [
    ['Name', x.name], ['Email', x.email], ['Agency', x.agency], ['Website', x.website || '-'],
    ['Type', L.agencyType[x.agency_type] || '-'], ['Team size', L.teamSize[x.team_size] || '-'],
    ['Urgency', L.urgency[x.urgency] || '-'], ['Heard from', L.heardFrom[x.heard_from] || '-'],
    ['Problem', x.problem], ['Language', `${x.lang} · their time zone ${x.tz}`], ['Source', x.source || '-'],
  ];
}

export function renderOwnerAlert(kind, { booking, manageLink }) {
  const w = formatWhen(new Date(booking.start_utc), 'Europe/Lisbon', 'en');
  const title = { confirmed: 'New discovery call', rescheduled: 'Discovery call rescheduled', cancelled: 'Discovery call cancelled' }[kind];
  const alert = ownerAlert({
    title: `${title}: ${booking.name}, ${booking.agency} (${w.day} ${w.time})`,
    heading: title,
    intro: `${w.full}, Lisbon time.${kind === 'cancelled' ? '' : ' Use the links below to reschedule or cancel, so the reminders stay in sync. Don’t edit the event in Google Calendar directly.'}`,
    actions: kind === 'cancelled' ? [] : [['Join Google Meet', booking.meet_link || ''], ['Reschedule or cancel', manageLink]].filter(([, h]) => h),
    rows: answerRows(booking),
  });
  return alert;
}

export function renderRequestAck(req) {
  const lang = req.lang === 'pt' ? 'pt' : 'en';
  const times = req.options.map((o) => formatWhen(new Date(o), req.tz, lang).full);
  return renderEmail(`request-ack-${lang}`, { greeting: greet(lang, req.name) }, {
    times: { html: times.map(escapeHtml).join('<br>'), text: times.join('\n') },
  });
}

export function renderRequestAlert(req, { approveLink }) {
  const actions = req.options.map((o, i) => {
    const lis = formatWhen(new Date(o), 'Europe/Lisbon', 'en');
    const theirs = req.tz !== 'Europe/Lisbon' ? ` · their time ${formatWhen(new Date(o), req.tz, 'en').time} ${req.tz}` : '';
    return [`Book ${lis.day.replace(/ \d{4}$/, '')}, ${lis.time}`, approveLink(i), `Lisbon${theirs}`];
  });
  return {
    ...ownerAlert({
      title: `Time request: ${req.name}, ${req.agency}`,
      heading: 'Suggested times',
      intro: `${req.name} couldn’t find a slot and suggested these times. Click one to book it: the calendar event, Meet link and confirmation go out automatically. None work? Reply to this email to write to them directly.`,
      actions,
      rows: [...answerRows(req), ...(req.note ? [['Note', req.note]] : [])],
    }),
    replyTo: req.email,
  };
}
