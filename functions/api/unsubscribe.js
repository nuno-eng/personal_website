// /api/unsubscribe?c=<code>&t=<token>&lang=<en|pt>
//
// GET shows a confirmation button instead of unsubscribing straight away,
// because corporate mail scanners open every link in an email and would
// otherwise unsubscribe people silently.
// POST does the unsubscribe. It is the target of the confirmation button and
// of the RFC 8058 one-click "Unsubscribe" button Gmail/Yahoo show, which POST
// to the List-Unsubscribe URL.
//
// Newsletter issues use Resend's own {{{RESEND_UNSUBSCRIBE_URL}}} instead;
// this endpoint covers the welcome sequence.

import { verifyToken } from '../_lib/unsubscribe-token.js';
import { cancelEmail, unsubscribeContact } from '../_lib/resend.js';
import { escapeHtml, normalizeLang } from '../_lib/http.js';

const COPY = {
  en: {
    confirmTitle: 'Unsubscribe from Operating Notes?',
    confirmBody: 'You will stop receiving the newsletter and any pending welcome emails.',
    confirmButton: 'Unsubscribe',
    done: "You're unsubscribed. Sorry to see you go.",
    doneBody: 'Changed your mind? You can sign up again any time.',
    resubscribe: '/subscribe/',
    resubscribeLabel: 'Subscribe again',
    invalid: 'This unsubscribe link is invalid or has expired.',
    home: 'Back to nunofontoura.com',
  },
  pt: {
    confirmTitle: 'Cancelar a subscrição das Notas Operacionais?',
    confirmBody: 'Deixará de receber a newsletter e quaisquer emails de boas-vindas pendentes.',
    confirmButton: 'Cancelar subscrição',
    done: 'Subscrição cancelada.',
    doneBody: 'Mudou de ideias? Pode voltar a subscrever a qualquer momento.',
    resubscribe: '/pt/subscribe/',
    resubscribeLabel: 'Subscrever novamente',
    invalid: 'Este link de cancelamento é inválido ou expirou.',
    home: 'Voltar a nunofontoura.com',
  },
};

async function verify(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('c') || '';
  const token = url.searchParams.get('t') || '';
  const lang = normalizeLang(url.searchParams.get('lang'));
  const valid = Boolean(code && token && env.UNSUB_SECRET && (await verifyToken(code, token, env.UNSUB_SECRET)));
  return { url, code, lang, valid };
}

export async function onRequestGet({ request, env }) {
  const { url, lang, valid } = await verify(request, env);
  const t = COPY[lang];
  if (!valid) return page(lang, t.invalid, '', `<a class="link" href="/">${t.home}</a>`, 400);

  return page(
    lang,
    t.confirmTitle,
    t.confirmBody,
    `<form method="post" action="${escapeHtml(url.pathname + url.search)}"><button type="submit">${t.confirmButton}</button></form>`,
    200
  );
}

export async function onRequestPost({ request, env }) {
  const { code, lang, valid } = await verify(request, env);
  const t = COPY[lang];
  if (!valid) return page(lang, t.invalid, '', `<a class="link" href="/">${t.home}</a>`, 400);

  const row = env.DB
    ? await env.DB.prepare('SELECT email, day3_email_id, day7_email_id FROM subscribers WHERE code = ?').bind(code).first()
    : null;

  if (row && env.RESEND_API_KEY) {
    await Promise.all([
      unsubscribeContact(env, row.email),
      ...[row.day3_email_id, row.day7_email_id].filter(Boolean).map((id) => cancelEmail(env, id)),
      env.DB.prepare('UPDATE subscribers SET unsubscribed_at = ? WHERE code = ?')
        .bind(new Date().toISOString(), code)
        .run(),
    ]);
  }

  return page(lang, t.done, t.doneBody, `<a class="link" href="${t.resubscribe}">${t.resubscribeLabel}</a>`, 200);
}

function page(lang, title, body, action, status) {
  return new Response(
    `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&display=swap">
<link rel="stylesheet" href="/ds/styles.css">
<style>
  body { min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; }
  main { max-width: 480px; border-top: 4px solid var(--color-accent); background: var(--color-surface); padding: 32px; }
  h1 { font-size: 26px; margin-bottom: 12px; }
  button { font: inherit; font-weight: 800; background: var(--color-accent); color: var(--color-bg); border: 0; padding: 12px 20px; cursor: pointer; margin-top: 8px; }
  .link { font-weight: 700; }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(title)}</h1>
  ${body ? `<p>${escapeHtml(body)}</p>` : ''}
  ${action}
</main>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );
}
