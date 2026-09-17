// Discovery call booking rules. Times are Lisbon local time.
export const BOOKING = {
  timeZone: 'Europe/Lisbon',
  durationMin: 30,
  stepMin: 30,
  bufferMin: 10, // kept free before and after every busy block
  minNoticeHours: 12,
  maxPerDay: 3,
  daysAhead: 28, // Resend can schedule emails up to 30 days out; the follow-up is sent a day after the call
  // ISO weekday (1 = Monday) -> open windows
  hours: {
    1: [['09:00', '13:00'], ['13:30', '18:30']],
    2: [['09:00', '13:00'], ['13:30', '18:30']],
    3: [['09:00', '13:00'], ['13:30', '18:30']],
    4: [['09:00', '13:00'], ['13:30', '18:30']],
    5: [['09:00', '13:00'], ['13:30', '18:30']],
  },
};

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
