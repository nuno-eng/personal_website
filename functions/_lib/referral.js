// Shared helpers for referral-code generation.
// Files under functions/_lib/ are not routed by Cloudflare Pages (the
// underscore prefix opts the folder out) - they're plain importable modules.

export function generateReferralCode() {
  // 8 lowercase hex chars, short enough for a clean URL, long enough that
  // guessing someone else's code isn't practical.
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}
