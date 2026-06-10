const crypto = require('node:crypto');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

// Hashing both sides first equalizes buffer lengths so timingSafeEqual never throws.
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

function hmac(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

function checkPassword(provided) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || typeof provided !== 'string') return false;
  return crypto.timingSafeEqual(sha256(provided), sha256(secret));
}

function issueToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = hmac(expiresAt, process.env.ADMIN_PASSWORD);
  return { token: `${expiresAt}.${signature}`, expiresAt };
}

function verifyAuth(req) {
  const secret = process.env.ADMIN_PASSWORD;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [expiresAt, signature] = token.split('.');
  if (!secret || !expiresAt || !signature) return false;
  const expected = hmac(expiresAt, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(expiresAt) > Date.now();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { checkPassword, issueToken, verifyAuth, sleep };
