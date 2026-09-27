const crypto = require('crypto');

const DEFAULT_SECRET = 'AR6aDumWSOzszBigm1rbvVDGdiA2uAXspUvrVKWOsKvyDK0gp7YVeX9lmrs1QsNJ';
const SECRET = () => process.env.SESSION_SECRET || DEFAULT_SECRET;

/**
 * Generate a cryptographically signed stateless token (HMAC-SHA256)
 * @param {object} user - User payload
 * @returns {string} Signed token
 */
function createAuthToken(user) {
  const payload = {
    ...user,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a signed auth token
 * @param {string} token
 * @returns {object|null} Decoded user or null if invalid/expired
 */
function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET())
    .update(payloadBase64)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  // Buffer length check before constant-time comparison to avoid exception
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  createAuthToken,
  verifyAuthToken
};
