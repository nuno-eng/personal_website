#!/usr/bin/env node
// One-time setup: connects the booking tool to Google Calendar.
//
//   node tools/google-calendar-setup.mjs
//
// 1. Asks for the OAuth Client ID and Client Secret (Desktop app client).
// 2. Opens Google's consent page; sign in as nuno@nabiaedge.com and allow.
// 3. Checks the connection by reading your calendar's free/busy times.
// 4. Saves GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN as
//    Cloudflare Pages secrets (production and preview) with wrangler.
// Nothing secret is printed or written to disk.
import http from 'node:http';
import readline from 'node:readline';
import { spawn, execFile } from 'node:child_process';
import crypto from 'node:crypto';

const PROJECT = 'personal-website';
const PORT = 8765;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.freebusy'];

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); };
    rl.question(question, (answer) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(answer.trim()); });
  });
}

function putSecret(name, value, env) {
  return new Promise((resolve, reject) => {
    const args = ['wrangler', 'pages', 'secret', 'put', name, '--project-name', PROJECT, ...(env ? ['--env', env] : [])];
    const child = spawn('npx', args, { stdio: ['pipe', 'ignore', 'inherit'] });
    child.stdin.end(value);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`wrangler exited with ${code} for ${name}`))));
  });
}

const clientId = await ask('OAuth Client ID: ');
const clientSecret = await ask('OAuth Client Secret (hidden): ', true);
if (!clientId || !clientSecret) { console.error('Both values are required.'); process.exit(1); }

const state = crypto.randomBytes(16).toString('hex');
const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId, redirect_uri: REDIRECT, response_type: 'code', scope: SCOPES.join(' '),
  access_type: 'offline', prompt: 'consent', login_hint: 'nuno@nabiaedge.com', state,
});

const code = await new Promise((resolve, reject) => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, REDIRECT);
    if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
    const ok = url.searchParams.get('state') === state && url.searchParams.get('code');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(ok ? '<p>Connected. You can close this tab and go back to the terminal.</p>' : '<p>Something went wrong. Check the terminal.</p>');
    server.close();
    ok ? resolve(url.searchParams.get('code')) : reject(new Error(url.searchParams.get('error') || 'State mismatch'));
  });
  server.listen(PORT, '127.0.0.1', () => {
    console.log('\nOpening Google in your browser. Sign in as nuno@nabiaedge.com and click Allow.');
    execFile('open', [authUrl], (err) => { if (err) console.log(`If it didn't open, visit:\n${authUrl}\n`); });
  });
});

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
});
const tokens = await tokenRes.json();
if (!tokens.refresh_token) { console.error('Google did not return a refresh token:', tokens.error_description || tokens.error || 'unknown error'); process.exit(1); }

const now = new Date();
const check = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
  method: 'POST',
  headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ timeMin: now.toISOString(), timeMax: new Date(now.getTime() + 7 * 864e5).toISOString(), items: [{ id: 'primary' }] }),
});
if (!check.ok) { console.error('Calendar check failed:', check.status, await check.text()); process.exit(1); }
const busy = (await check.json()).calendars?.primary?.busy?.length ?? 0;
console.log(`Calendar connected: ${busy} busy block(s) in the next 7 days.`);

for (const env of [null, 'preview']) {
  console.log(`Saving secrets for ${env || 'production'}...`);
  await putSecret('GOOGLE_CLIENT_ID', clientId, env);
  await putSecret('GOOGLE_CLIENT_SECRET', clientSecret, env);
  await putSecret('GOOGLE_REFRESH_TOKEN', tokens.refresh_token, env);
}
console.log('\nDone. The booking tool can now read your calendar and create Google Meet events.');
