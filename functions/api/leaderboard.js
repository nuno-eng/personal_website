// GET /api/leaderboard
// Public top 10 referrers. Only the optional first name people typed is shown
// (never an email); people who left it blank appear anonymously.

import { jsonResponse } from '../_lib/http.js';

export async function onRequestGet({ env }) {
  if (!env.DB) return jsonResponse({ error: 'Referral tracking is not set up yet.' }, 503);

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
  response.headers.set('Cache-Control', 'public, max-age=300');
  return response;
}
