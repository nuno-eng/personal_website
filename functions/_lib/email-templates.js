// Newsletter welcome sequence and free resource delivery. The layout and copy
// live in newsletter-sender/transactional/definitions.tsx (React Email);
// run `npm run build:emails` there after editing.
import { renderEmail } from './emails.js';

export const NEWSLETTER_NAME = { en: 'Operating Notes', pt: 'Notas Operacionais' };

export function renderSequenceEmail(kind, { lang, name, referralLink, unsubLink }) {
  const l = lang === 'pt' ? 'pt' : 'en';
  const greeting = l === 'pt' ? (name ? `Olá ${name},` : 'Olá,') : name ? `Hi ${name},` : 'Hi,';
  return renderEmail(`seq-${kind}-${l}`, { greeting, referralLink: referralLink || 'https://www.nunofontoura.com/subscribe/', unsubLink: unsubLink || 'https://www.nunofontoura.com/privacy/' });
}

export function renderResourceEmail(resource, { base }) {
  return renderEmail('resource-en', {
    resourceTitle: resource.title,
    preview: resource.preview,
    downloadLabel: resource.cta,
    downloadUrl: `${base}${resource.file}`,
    howTo: resource.howTo,
    next: resource.next,
  });
}
