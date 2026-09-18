// Booking rules shared by every meeting type. Times are UK local time (Europe/London).
export const BOOKING = {
  timeZone: 'Europe/London',
  durationMin: 30,
  stepMin: 30,
  bufferBeforeMin: 10, // free time before a discovery call
  bufferAfterMin: 15, // free time after a discovery call, because calls tend to run over
  minNoticeHours: 16,
  maxPerDay: 3,
  daysAhead: 28, // Resend can schedule emails up to 30 days out; the follow-up is sent a day after the call
  // ISO weekday (1 = Monday) -> open windows
  hours: {
    1: [['09:00', '18:30']],
    2: [['09:00', '18:30']],
    3: [['09:00', '18:30']],
    4: [['09:00', '18:30']],
    5: [['09:00', '18:30']],
  },
  // A free hour for lunch must remain somewhere inside this window every day.
  // A 12:30 call moves lunch to 13:00-14:00; a 13:30 call moves it to 12:30-13:30.
  lunch: { window: ['12:30', '14:00'], minutes: 60 },
};

// Meeting types. Both are 30 minutes and share the calendar, hours, buffers and daily limit above.
// discovery: public (/book/). networking (shown as "1:1 with Nuno"): private link only (/meet/), shorter form, no follow-up email.
export const KINDS = {
  discovery: {
    title: 'Discovery call', short: 'discovery call', page: { en: '/book/', pt: '/pt/book/' },
    followup: true,
  },
  networking: {
    title: '1:1 with Nuno', short: '1:1 with Nuno', page: { en: '/meet/', pt: '/pt/meet/' },
    followup: false,
  },
};
export const kindOf = (k) => (k === 'networking' ? 'networking' : 'discovery');

export const CHOICES = {
  agencyType: ['creative', 'production', 'marketing', 'brand-activation', 'other'],
  teamSize: ['1-5', '6-15', '16-50', '50+'],
  urgency: ['asap', '3-months', 'exploring'],
  heardFrom: ['linkedin', 'google', 'newsletter', 'referral', 'event', 'other'],
};

export const LABELS = {
  en: {
    agencyType: { creative: 'Creative / design', production: 'Production', marketing: 'Marketing / advertising', 'brand-activation': 'Brand activation / signage', other: 'Other' },
    teamSize: { '1-5': '1–5', '6-15': '6–15', '16-50': '16–50', '50+': '50+' },
    urgency: { asap: 'As soon as possible', '3-months': 'In the next 3 months', exploring: 'Just exploring' },
    heardFrom: { linkedin: 'LinkedIn', google: 'Google', newsletter: 'Newsletter', referral: 'Referral', event: 'Event', other: 'Other' },
  },
  pt: {
    agencyType: { creative: 'Criativa / design', production: 'Produção', marketing: 'Marketing / publicidade', 'brand-activation': 'Brand activation / sinalética', other: 'Outra' },
    teamSize: { '1-5': '1–5', '6-15': '6–15', '16-50': '16–50', '50+': '50+' },
    urgency: { asap: 'O mais rápido possível', '3-months': 'Nos próximos 3 meses', exploring: 'Só a explorar' },
    heardFrom: { linkedin: 'LinkedIn', google: 'Google', newsletter: 'Newsletter', referral: 'Recomendação', event: 'Evento', other: 'Outro' },
  },
};
