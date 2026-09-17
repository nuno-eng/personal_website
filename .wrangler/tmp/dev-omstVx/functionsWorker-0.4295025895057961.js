var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-8k0d1O/functionsWorker-0.4295025895057961.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");
__name2(readJson, "readJson");
function siteUrl(env, request) {
  return (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}
__name(siteUrl, "siteUrl");
__name2(siteUrl, "siteUrl");
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}
__name(escapeHtml, "escapeHtml");
__name2(escapeHtml, "escapeHtml");
function normalizeLang(lang) {
  return lang === "pt" ? "pt" : "en";
}
__name(normalizeLang, "normalizeLang");
__name2(normalizeLang, "normalizeLang");
function referralLink(base, code, lang) {
  return `${base}${lang === "pt" ? "/pt" : ""}/subscribe/?ref=${code}`;
}
__name(referralLink, "referralLink");
__name2(referralLink, "referralLink");
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
__name2(sha256Hex, "sha256Hex");
async function onRequestGet({ env }) {
  if (!env.DB) return jsonResponse({ error: "Referral tracking is not set up yet." }, 503);
  const { results } = await env.DB.prepare(
    `SELECT r.display_name AS name, COUNT(*) AS referrals
     FROM subscribers s
     JOIN subscribers r ON r.code = s.referred_by_code
     WHERE s.unsubscribed_at IS NULL
     GROUP BY s.referred_by_code
     ORDER BY referrals DESC, MIN(s.created_at) ASC
     LIMIT 10`
  ).all();
  const response = jsonResponse({ leaderboard: results }, 200);
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
function segmentId(env) {
  return env.RESEND_SEGMENT_ID || env.RESEND_AUDIENCE_ID || "";
}
__name(segmentId, "segmentId");
__name2(segmentId, "segmentId");
function call(env, path, { method = "GET", body, headers = {} } = {}) {
  return fetch(`${env.RESEND_API_URL || "https://api.resend.com"}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...headers
    },
    body: body === void 0 ? void 0 : JSON.stringify(body)
  });
}
__name(call, "call");
__name2(call, "call");
async function upsertContact(env, { email, firstName }) {
  const segment = segmentId(env);
  const created = await call(env, "/contacts", {
    method: "POST",
    body: {
      email,
      first_name: firstName || void 0,
      unsubscribed: false,
      segments: segment ? [{ id: segment }] : void 0
    }
  });
  if (created.ok) return true;
  const createError = await created.text();
  const updated = await call(env, `/contacts/${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: { unsubscribed: false, ...firstName ? { first_name: firstName } : {} }
  });
  if (!updated.ok) {
    console.error("Resend create contact failed:", created.status, createError);
    console.error("Resend update contact failed:", updated.status, await updated.text());
    return false;
  }
  if (segment) {
    const added = await call(
      env,
      `/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segment)}`,
      { method: "POST" }
    );
    if (!added.ok) console.error("Resend add to segment:", added.status, await added.text());
  }
  return true;
}
__name(upsertContact, "upsertContact");
__name2(upsertContact, "upsertContact");
async function unsubscribeContact(env, email) {
  const res = await call(env, `/contacts/${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: { unsubscribed: true }
  });
  if (!res.ok) console.error("Resend unsubscribe failed:", res.status, await res.text());
  return res.ok;
}
__name(unsubscribeContact, "unsubscribeContact");
__name2(unsubscribeContact, "unsubscribeContact");
async function sendEmail(env, { to, subject, html, text, scheduledAt, headers, idempotencyKey }) {
  const res = await call(env, "/emails", {
    method: "POST",
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    body: {
      from: env.RESEND_FROM,
      to: [to],
      subject,
      html,
      text,
      reply_to: env.RESEND_REPLY_TO || void 0,
      scheduled_at: scheduledAt,
      headers
    }
  });
  if (!res.ok) {
    console.error("Resend send failed:", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.id || null;
}
__name(sendEmail, "sendEmail");
__name2(sendEmail, "sendEmail");
async function cancelEmail(env, id) {
  const res = await call(env, `/emails/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  return res.ok;
}
__name(cancelEmail, "cancelEmail");
__name2(cancelEmail, "cancelEmail");
var RESEND_AFTER_MS = 10 * 60 * 1e3;
var COPY = {
  en: {
    ok: "If that email is subscribed, your link is on its way.",
    subject: "Your Operating Notes referral link",
    body: /* @__PURE__ */ __name2((link, n) => [`Here is your personal referral link:`, link, `People who have subscribed through it so far: ${n}.`], "body")
  },
  pt: {
    ok: "Se esse email estiver subscrito, o seu link vai a caminho.",
    subject: "O seu link de recomenda\xE7\xE3o das Notas Operacionais",
    body: /* @__PURE__ */ __name2((link, n) => ["Aqui est\xE1 o seu link pessoal de recomenda\xE7\xE3o:", link, `Pessoas que j\xE1 subscreveram atrav\xE9s dele: ${n}.`], "body")
  }
};
async function onRequestPost({ request, env, waitUntil }) {
  if (!env.DB) return jsonResponse({ error: "Referral tracking is not set up yet." }, 503);
  const body = await readJson(request) || {};
  const lang = normalizeLang(body.lang);
  const email = String(body.email || "").trim().toLowerCase();
  const ok = jsonResponse({ ok: true, message: COPY[lang].ok }, 200);
  if (!email) return ok;
  const me = await env.DB.prepare("SELECT code, lang, link_sent_at FROM subscribers WHERE email = ? AND unsubscribed_at IS NULL").bind(email).first();
  if (!me) return ok;
  if (me.link_sent_at && Date.now() - Date.parse(me.link_sent_at) < RESEND_AFTER_MS) return ok;
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE referred_by_code = ?").bind(me.code).first();
  const copy = COPY[me.lang] || COPY.en;
  const link = referralLink(siteUrl(env, request), me.code, me.lang);
  const lines = copy.body(link, n);
  await env.DB.prepare("UPDATE subscribers SET link_sent_at = ? WHERE email = ?").bind((/* @__PURE__ */ new Date()).toISOString(), email).run();
  waitUntil(
    sendEmail(env, {
      to: email,
      subject: copy.subject,
      text: lines.join("\n\n"),
      html: lines.map((l) => `<p style="font:16px/1.6 Arial,sans-serif;color:#201e1d">${escapeHtml(l)}</p>`).join("")
    })
  );
  return ok;
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
function generateReferralCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}
__name(generateReferralCode, "generateReferralCode");
__name2(generateReferralCode, "generateReferralCode");
var NEWSLETTER_NAME = { en: "Operating Notes", pt: "Notas Operacionais" };
var BOOKING_URL = "https://calendly.com/nuno-nabiaedge/30min";
var COLOR = { bg: "#f3f2f2", surface: "#ffffff", text: "#201e1d", muted: "#7d7979", accent: "#1E3A8A", rule: "#d7d3d3" };
var FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif";
var COPY2 = {
  en: {
    greeting: /* @__PURE__ */ __name2((name) => name ? `Hi ${name},` : "Hi,", "greeting"),
    signoff: "Nuno",
    unsubscribe: "Unsubscribe",
    footer: "You are receiving this because you subscribed at nunofontoura.com.",
    welcome: {
      subject: `You're in: ${NEWSLETTER_NAME.en}`,
      preview: "What to expect, and one question for you.",
      blocks: [
        `Thanks for subscribing to ${NEWSLETTER_NAME.en}. Every issue is one operational idea for founder-led businesses: how work gets done, who owns what, and how to stop being the bottleneck. Drawn from six years in the Portuguese Marines, seven and a half at Amazon, and the founders I work with now.`,
        "No motivation, no filler. If an issue doesn't change what you do on Monday, I haven't done my job.",
        "One question to start: what is the operational problem taking most of your time right now? Hit reply and tell me. I read every answer, and the most common ones become future issues.",
        "If someone you know is carrying their whole business on their back, send them your personal link:",
        { link: true }
      ]
    },
    day3: {
      subject: "The founder who outgrew the business",
      preview: "It is not a personal failing. It is a structure problem.",
      blocks: [
        "Most founders I meet have built something real. Revenue is growing, the team is expanding, and they are still in every decision, running on instinct and firefighting instead of working a plan.",
        "That is not a personal failing. The operation simply didn't grow with the business, and that has a fix: a clear cadence, clear ownership, and standards you can measure.",
        "Here is how I approach it, step by step, from current state to tracked execution:",
        { button: "See how the advisory works", href: "https://www.nunofontoura.com/business-advisory/" }
      ]
    },
    day7: {
      subject: "Worth 30 minutes?",
      preview: "A direct offer, no pitch deck.",
      blocks: [
        "A week in, so a direct question: is there one operational problem you would like off your plate this quarter?",
        "If so, book a 30-minute call. We look at where time and money are leaking, and you leave with the first fix, whether or not we work together.",
        { button: "Book a 30-minute call", href: BOOKING_URL },
        "Not the right time? No problem. The newsletter keeps coming, and your referral link still works: {referralLink}"
      ]
    }
  },
  pt: {
    greeting: /* @__PURE__ */ __name2((name) => name ? `Ol\xE1 ${name},` : "Ol\xE1,", "greeting"),
    signoff: "Nuno",
    unsubscribe: "Cancelar subscri\xE7\xE3o",
    footer: "Recebe este email porque subscreveu em nunofontoura.com.",
    welcome: {
      subject: `Bem-vindo \xE0s ${NEWSLETTER_NAME.pt}`,
      preview: "O que esperar, e uma pergunta para si.",
      blocks: [
        `Obrigado por subscrever as ${NEWSLETTER_NAME.pt}. Cada edi\xE7\xE3o traz uma ideia operacional para neg\xF3cios liderados por fundadores: como o trabalho se faz, quem \xE9 respons\xE1vel pelo qu\xEA, e como deixar de ser o gargalo. Com base em seis anos nos Fuzileiros, sete anos e meio na Amazon, e nos fundadores com quem trabalho hoje.`,
        "Sem motiva\xE7\xE3o vazia, sem enchimento. Se uma edi\xE7\xE3o n\xE3o mudar o que faz na segunda-feira, n\xE3o fiz o meu trabalho.",
        "Uma pergunta para come\xE7ar: qual \xE9 o problema operacional que mais tempo lhe ocupa neste momento? Responda a este email e diga-me. Leio todas as respostas, e as mais comuns tornam-se futuras edi\xE7\xF5es.",
        "Se conhece algu\xE9m que carrega o neg\xF3cio inteiro \xE0s costas, envie-lhe o seu link pessoal:",
        { link: true }
      ]
    },
    day3: {
      subject: "O fundador que cresceu mais do que o seu neg\xF3cio",
      preview: "N\xE3o \xE9 uma falha pessoal. \xC9 um problema de estrutura.",
      blocks: [
        "A maioria dos fundadores que conhe\xE7o construiu algo real. A receita est\xE1 a crescer, a equipa est\xE1 a expandir, e continuam envolvidos em todas as decis\xF5es, a funcionar por instinto e a apagar fogos em vez de seguir um plano.",
        "Isso n\xE3o \xE9 uma falha pessoal. As opera\xE7\xF5es n\xE3o acompanharam o crescimento do neg\xF3cio, e isso tem solu\xE7\xE3o: uma cad\xEAncia clara, responsabilidades claras e padr\xF5es que se podem medir.",
        "\xC9 assim que trabalho, passo a passo, do estado atual \xE0 execu\xE7\xE3o acompanhada:",
        { button: "Ver como funciona a assessoria", href: "https://www.nunofontoura.com/pt/business-advisory/" }
      ]
    },
    day7: {
      subject: "Vale 30 minutos?",
      preview: "Uma proposta direta, sem apresenta\xE7\xF5es.",
      blocks: [
        "Uma semana depois, uma pergunta direta: h\xE1 algum problema operacional que gostaria de resolver este trimestre?",
        "Se sim, marque uma chamada de 30 minutos. Vemos onde se est\xE1 a perder tempo e dinheiro, e sai com a primeira corre\xE7\xE3o, quer trabalhemos juntos ou n\xE3o.",
        { button: "Marcar chamada de 30 minutos", href: BOOKING_URL },
        "N\xE3o \xE9 o momento certo? Sem problema. A newsletter continua a chegar, e o seu link de recomenda\xE7\xE3o continua ativo: {referralLink}"
      ]
    }
  }
};
function renderSequenceEmail(kind, { lang, name, referralLink: referralLink2, unsubLink }) {
  const copy = COPY2[lang] || COPY2.en;
  const email = copy[kind];
  const p = `font-family:${FONT};font-size:16px;line-height:26px;color:${COLOR.text};margin:0 0 18px;`;
  const refAnchor = referralLink2 ? `<a href="${escapeHtml(referralLink2)}" style="color:${COLOR.accent};font-weight:700;word-break:break-all;">${escapeHtml(referralLink2)}</a>` : "";
  const html = [`<p style="${p}">${escapeHtml(copy.greeting(name))}</p>`];
  const text = [copy.greeting(name)];
  for (const block of email.blocks) {
    if (typeof block === "string") {
      if (block.includes("{referralLink}") && !referralLink2) continue;
      html.push(`<p style="${p}">${block.split("{referralLink}").map(escapeHtml).join(refAnchor)}</p>`);
      text.push(block.replaceAll("{referralLink}", referralLink2 || ""));
    } else if (block.link) {
      if (!referralLink2) continue;
      html.push(`<p style="${p}">${refAnchor}</p>`);
      text.push(referralLink2);
    } else if (block.button) {
      html.push(
        `<p style="margin:8px 0 26px;"><a href="${escapeHtml(block.href)}" style="display:inline-block;background:${COLOR.accent};color:${COLOR.bg};font-family:${FONT};font-size:15px;font-weight:800;text-decoration:none;padding:14px 22px;">${escapeHtml(block.button)}</a></p>`
      );
      text.push(`${block.button}: ${block.href}`);
    }
  }
  html.push(`<p style="${p}">${escapeHtml(copy.signoff)}</p>`);
  text.push(copy.signoff);
  const unsubHtml = unsubLink ? ` <a href="${escapeHtml(unsubLink)}" style="color:${COLOR.muted};text-decoration:underline;">${escapeHtml(copy.unsubscribe)}</a>` : "";
  return {
    subject: email.subject,
    text: `${text.join("\n\n")}

---
${copy.footer}${unsubLink ? `
${copy.unsubscribe}: ${unsubLink}` : ""}
`,
    html: `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(email.subject)}</title></head>
<body style="margin:0;padding:0;background:${COLOR.bg};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(email.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:${COLOR.surface};border-top:4px solid ${COLOR.accent};">
<tr><td style="padding:28px 32px 4px;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${COLOR.accent};">${escapeHtml(NEWSLETTER_NAME[lang] || NEWSLETTER_NAME.en)} &middot; Nuno Fontoura</td></tr>
<tr><td style="padding:20px 32px 12px;">${html.join("\n")}</td></tr>
<tr><td style="padding:0 32px 28px;border-top:1px solid ${COLOR.rule};">
<p style="font-family:${FONT};font-size:12px;line-height:18px;color:${COLOR.muted};margin:18px 0 0;">${escapeHtml(copy.footer)}${unsubHtml}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
  };
}
__name(renderSequenceEmail, "renderSequenceEmail");
__name2(renderSequenceEmail, "renderSequenceEmail");
async function signToken(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(signToken, "signToken");
__name2(signToken, "signToken");
async function verifyToken(value, token, secret) {
  const expected = await signToken(value, secret);
  return timingSafeEqualHex(expected, token || "");
}
__name(verifyToken, "verifyToken");
__name2(verifyToken, "verifyToken");
function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
__name(timingSafeEqualHex, "timingSafeEqualHex");
__name2(timingSafeEqualHex, "timingSafeEqualHex");
var DAY = 24 * 60 * 60 * 1e3;
async function sendWelcomeSequence({ env, base, email, code, name, lang, referralLink: referralLink2 }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.error("Missing RESEND_API_KEY or RESEND_FROM - skipping welcome sequence.");
    return { day3EmailId: null, day7EmailId: null };
  }
  const unsubLink = await buildUnsubLink(env, base, code, lang);
  const headers = unsubLink ? { "List-Unsubscribe": `<${unsubLink}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : void 0;
  const send = /* @__PURE__ */ __name2((kind, scheduledAt) => {
    const rendered = renderSequenceEmail(kind, { lang, name, referralLink: referralLink2, unsubLink });
    return sendEmail(env, {
      to: email,
      ...rendered,
      scheduledAt,
      headers,
      idempotencyKey: `${kind}:${code}`
    });
  }, "send");
  const [, day3EmailId, day7EmailId] = await Promise.all([
    send("welcome"),
    send("day3", new Date(Date.now() + 3 * DAY).toISOString()),
    send("day7", new Date(Date.now() + 7 * DAY).toISOString())
  ]);
  return { day3EmailId, day7EmailId };
}
__name(sendWelcomeSequence, "sendWelcomeSequence");
__name2(sendWelcomeSequence, "sendWelcomeSequence");
async function buildUnsubLink(env, base, code, lang) {
  if (!env.UNSUB_SECRET) return null;
  const token = await signToken(code, env.UNSUB_SECRET);
  return `${base}/api/unsubscribe?c=${code}&t=${token}&lang=${lang}`;
}
__name(buildUnsubLink, "buildUnsubLink");
__name2(buildUnsubLink, "buildUnsubLink");
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MAX_NEW_PER_IP_PER_HOUR = 5;
var ERRORS = {
  en: {
    invalid: "Enter a valid email address.",
    unavailable: "Subscriptions are temporarily unavailable.",
    failed: "Could not subscribe you right now. Try again shortly.",
    rateLimited: "Too many signups from this connection. Try again later."
  },
  pt: {
    invalid: "Introduza um email v\xE1lido.",
    unavailable: "As subscri\xE7\xF5es est\xE3o temporariamente indispon\xEDveis.",
    failed: "N\xE3o foi poss\xEDvel subscrever agora. Tente novamente dentro de momentos.",
    rateLimited: "Demasiadas subscri\xE7\xF5es a partir desta liga\xE7\xE3o. Tente mais tarde."
  }
};
async function onRequestPost2({ request, env, waitUntil }) {
  const body = await readJson(request);
  if (!body) return jsonResponse({ error: ERRORS.en.invalid }, 400);
  const lang = normalizeLang(body.lang);
  const errors = ERRORS[lang];
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 60);
  const ref = String(body.ref || "").trim().slice(0, 32);
  const source = String(body.source || "").trim().slice(0, 160) || null;
  if (body.honeypot) return jsonResponse({ ok: true }, 200);
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: errors.invalid }, 400);
  }
  if (!env.RESEND_API_KEY || !segmentId(env)) {
    console.error("Missing RESEND_API_KEY or RESEND_SEGMENT_ID.");
    return jsonResponse({ error: errors.unavailable }, 500);
  }
  const base = siteUrl(env, request);
  const db = env.DB;
  let existing = null;
  let ipHash = null;
  if (db) {
    existing = await db.prepare("SELECT code, lang, unsubscribed_at FROM subscribers WHERE email = ?").bind(email).first();
    if (!existing) {
      const ip = request.headers.get("CF-Connecting-IP") || "";
      ipHash = ip ? await sha256Hex(`${ip}:${env.UNSUB_SECRET || ""}`) : null;
      if (ipHash) {
        const since = new Date(Date.now() - 60 * 60 * 1e3).toISOString();
        const recent = await db.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE ip_hash = ? AND created_at > ?").bind(ipHash, since).first();
        if (recent.n >= MAX_NEW_PER_IP_PER_HOUR) {
          return jsonResponse({ error: errors.rateLimited }, 429);
        }
      }
    }
  }
  const subscribed = await upsertContact(env, { email, firstName: name });
  if (!subscribed) return jsonResponse({ error: errors.failed }, 502);
  if (!db) return jsonResponse({ ok: true, referralLink: null }, 200);
  if (existing) {
    if (existing.unsubscribed_at) {
      await db.prepare("UPDATE subscribers SET unsubscribed_at = NULL WHERE email = ?").bind(email).run();
    }
    return jsonResponse({ ok: true, referralLink: referralLink(base, existing.code, existing.lang) }, 200);
  }
  const code = await generateUniqueCode(db);
  const referredBy = ref ? (await db.prepare("SELECT code FROM subscribers WHERE code = ?").bind(ref).first())?.code || null : null;
  const link = referralLink(base, code, lang);
  await db.prepare(
    `INSERT INTO subscribers (email, code, referred_by_code, display_name, lang, source, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(email, code, referredBy, name || null, lang, source, ipHash, (/* @__PURE__ */ new Date()).toISOString()).run();
  try {
    const { day3EmailId, day7EmailId } = await sendWelcomeSequence({
      env,
      base,
      email,
      code,
      name,
      lang,
      referralLink: link
    });
    await db.prepare("UPDATE subscribers SET day3_email_id = ?, day7_email_id = ? WHERE email = ?").bind(day3EmailId, day7EmailId, email).run();
  } catch (err) {
    console.error("Welcome sequence error:", err);
  }
  if (env.NOTIFY_EMAIL) {
    waitUntil(notifyOwner(env, { email, name, lang, source, referredBy }));
  }
  return jsonResponse({ ok: true, referralLink: link }, 200);
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function generateUniqueCode(db) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const clash = await db.prepare("SELECT 1 FROM subscribers WHERE code = ?").bind(code).first();
    if (!clash) return code;
  }
  return `${generateReferralCode()}${generateReferralCode()}`;
}
__name(generateUniqueCode, "generateUniqueCode");
__name2(generateUniqueCode, "generateUniqueCode");
function notifyOwner(env, { email, name, lang, source, referredBy }) {
  const lines = [
    `Email: ${email}`,
    `Name: ${name || "-"}`,
    `Language: ${lang}`,
    `Signed up on: ${source || "-"}`,
    `Referred by code: ${referredBy || "-"}`
  ];
  return sendEmail(env, {
    to: env.NOTIFY_EMAIL,
    subject: `New newsletter subscriber: ${email}`,
    text: lines.join("\n"),
    html: `<pre style="font:14px/1.6 monospace">${lines.map((l) => l.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c])).join("\n")}</pre>`
  }).catch((err) => console.error("Owner notification error:", err));
}
__name(notifyOwner, "notifyOwner");
__name2(notifyOwner, "notifyOwner");
var COPY3 = {
  en: {
    confirmTitle: "Unsubscribe from Operating Notes?",
    confirmBody: "You will stop receiving the newsletter and any pending welcome emails.",
    confirmButton: "Unsubscribe",
    done: "You're unsubscribed. Sorry to see you go.",
    doneBody: "Changed your mind? You can sign up again any time.",
    resubscribe: "/subscribe/",
    resubscribeLabel: "Subscribe again",
    invalid: "This unsubscribe link is invalid or has expired.",
    home: "Back to nunofontoura.com"
  },
  pt: {
    confirmTitle: "Cancelar a subscri\xE7\xE3o das Notas Operacionais?",
    confirmBody: "Deixar\xE1 de receber a newsletter e quaisquer emails de boas-vindas pendentes.",
    confirmButton: "Cancelar subscri\xE7\xE3o",
    done: "Subscri\xE7\xE3o cancelada.",
    doneBody: "Mudou de ideias? Pode voltar a subscrever a qualquer momento.",
    resubscribe: "/pt/subscribe/",
    resubscribeLabel: "Subscrever novamente",
    invalid: "Este link de cancelamento \xE9 inv\xE1lido ou expirou.",
    home: "Voltar a nunofontoura.com"
  }
};
async function verify(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("c") || "";
  const token = url.searchParams.get("t") || "";
  const lang = normalizeLang(url.searchParams.get("lang"));
  const valid = Boolean(code && token && env.UNSUB_SECRET && await verifyToken(code, token, env.UNSUB_SECRET));
  return { url, code, lang, valid };
}
__name(verify, "verify");
__name2(verify, "verify");
async function onRequestGet2({ request, env }) {
  const { url, lang, valid } = await verify(request, env);
  const t = COPY3[lang];
  if (!valid) return page(lang, t.invalid, "", `<a class="link" href="/">${t.home}</a>`, 400);
  return page(
    lang,
    t.confirmTitle,
    t.confirmBody,
    `<form method="post" action="${escapeHtml(url.pathname + url.search)}"><button type="submit">${t.confirmButton}</button></form>`,
    200
  );
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPost3({ request, env }) {
  const { code, lang, valid } = await verify(request, env);
  const t = COPY3[lang];
  if (!valid) return page(lang, t.invalid, "", `<a class="link" href="/">${t.home}</a>`, 400);
  const row = env.DB ? await env.DB.prepare("SELECT email, day3_email_id, day7_email_id FROM subscribers WHERE code = ?").bind(code).first() : null;
  if (row && env.RESEND_API_KEY) {
    await Promise.all([
      unsubscribeContact(env, row.email),
      ...[row.day3_email_id, row.day7_email_id].filter(Boolean).map((id) => cancelEmail(env, id)),
      env.DB.prepare("UPDATE subscribers SET unsubscribed_at = ? WHERE code = ?").bind((/* @__PURE__ */ new Date()).toISOString(), code).run()
    ]);
  }
  return page(lang, t.done, t.doneBody, `<a class="link" href="${t.resubscribe}">${t.resubscribeLabel}</a>`, 200);
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
function page(lang, title, body, action, status) {
  return new Response(
    `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
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
  ${body ? `<p>${escapeHtml(body)}</p>` : ""}
  ${action}
</main>
</body>
</html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}
__name(page, "page");
__name2(page, "page");
var routes = [
  {
    routePath: "/api/leaderboard",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/my-referrals",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/subscribe",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/unsubscribe",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/unsubscribe",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../../private/tmp/claude-501/-Users-nunofontoura-Documents-VesselOperatingSystem/6efa97fe-c3af-49f8-8ab3-5071268061cd/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../../private/tmp/claude-501/-Users-nunofontoura-Documents-VesselOperatingSystem/6efa97fe-c3af-49f8-8ab3-5071268061cd/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-v0eWiv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../../private/tmp/claude-501/-Users-nunofontoura-Documents-VesselOperatingSystem/6efa97fe-c3af-49f8-8ab3-5071268061cd/scratchpad/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-v0eWiv/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.4295025895057961.js.map
