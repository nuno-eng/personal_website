// Fills the React Email templates built into ./generated/emails.js.
//   {{key}}   -> vars[key], HTML-escaped in the HTML version
//   {{{key}}} -> raw[key].html (already safe HTML) / raw[key].text
import TEMPLATES from './generated/emails.js';
import { escapeHtml } from './http.js';

export function renderEmail(id, vars = {}, raw = {}) {
  const t = TEMPLATES[id];
  if (!t) throw new Error(`Unknown email template: ${id}`);
  const html = t.html
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => raw[k]?.html ?? '')
    .replace(/\{\{(\w+)\}\}/g, (_, k) => escapeHtml(vars[k] ?? ''));
  const text = (s) => s.replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => raw[k]?.text ?? '').replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
  return { subject: text(t.subject), html, text: text(t.text) };
}

const NAVY = '#1E3A8A';
const FONT = "Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif";

// Label/value table for alerts to Nuno.
export function rowsHtml(pairs) {
  const rows = pairs
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `<tr><td style="padding:7px 12px 7px 0;vertical-align:top;width:120px;font:800 11px/18px ${FONT};letter-spacing:.08em;text-transform:uppercase;color:#77726f;">${escapeHtml(k)}</td><td style="padding:7px 0;vertical-align:top;font:15px/22px ${FONT};color:#201e1d;white-space:pre-wrap;">${escapeHtml(v ?? '-')}</td></tr>`)
    .join('');
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e1e0;margin:8px 0 0;">${rows}</table>`,
    text: pairs.filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v ?? '-'}`).join('\n'),
  };
}

export function buttonsHtml(buttons) {
  return {
    html: buttons.map(([label, href, note]) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;"><tr><td style="background:${NAVY};"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 20px;font:800 14px ${FONT};color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a></td>${note ? `<td style="padding-left:12px;font:14px ${FONT};color:#3a3736;">${escapeHtml(note)}</td>` : ''}</tr></table>`).join(''),
    text: buttons.map(([label, href, note]) => `${label}${note ? ` (${note})` : ''}: ${href}`).join('\n'),
  };
}

export function ownerAlert({ title, heading = title, intro = '', rows = [], actions = [], extra = null }) {
  return renderEmail('owner-alert', { title, heading, intro }, {
    rows: rowsHtml(rows),
    actions: actions.length ? buttonsHtml(actions) : { html: '', text: '' },
    extra: extra ?? { html: '', text: '' },
  });
}
