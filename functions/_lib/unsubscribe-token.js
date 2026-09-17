// HMAC-signed unsubscribe tokens, so a link can't be forged to unsubscribe
// someone else. Web Crypto is native in the Workers runtime.

export async function signToken(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyToken(value, token, secret) {
  const expected = await signToken(value, secret);
  return timingSafeEqualHex(expected, token || '');
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
