// Renders transactional/automations.tsx into newsletter-sender/automations/*.html,
// ready to paste into Resend as Templates.
//   npm run build:automations
import { render } from '@react-email/components';
import fs from 'node:fs';
import path from 'node:path';
import { AUTOMATION_EMAILS } from '../transactional/automations.js';

const dir = path.resolve(import.meta.dirname, '../automations');
fs.mkdirSync(dir, { recursive: true });
for (const e of AUTOMATION_EMAILS) {
  const html = await render(e.element, { pretty: true }); // one tag per line, so it can be copied from an editor
  if (!html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}')) throw new Error(`${e.id}: missing the Resend unsubscribe link`);
  fs.writeFileSync(path.join(dir, `${e.id}.html`), html);
}
console.log(`Built ${AUTOMATION_EMAILS.length} automation emails -> ${path.relative(process.cwd(), dir)}/`);
