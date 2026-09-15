const INVALID_TOKEN = 'Invalid or expired Google token';
const VERIFICATION_UNAVAILABLE = 'Google token verification temporarily unavailable';
const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const GUEST_IDENTITY = Object.freeze({ id: 'local_user', email: null, name: null, avatarUrl: null });

// Only authentication middleware may establish a user; headers never select storage identity.
export function getRequestIdentity(req) {
  return req.user ?? GUEST_IDENTITY;
}

export function createGoogleTokenAuthenticator({
  fetchImpl = globalThis.fetch,
  allowedClientIds = [process.env.GOOGLE_CLIENT_ID, process.env.VITE_GOOGLE_CLIENT_ID],
  timeoutMs = 5000,
  now = Date.now
} = {}) {
  const clientIds = allowedClientIds.filter(id => typeof id === 'string' && id.trim());

  return async function authenticateGoogleToken(req, res, next) {
    req.user = null;
    const authHeader = req.headers.authorization;
    if (authHeader === undefined) return next();

    // Check compact JWT syntax only; Google's response is the sole trusted payload.
    const match = typeof authHeader === 'string'
      && /^Bearer +([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authHeader);
    if (!match) {
      return res.status(401).json({ success: false, message: INVALID_TOKEN });
    }
    if (clientIds.length === 0) {
      return res.status(503).json({ success: false, message: 'Google authentication is not configured' });
    }

    const url = new URL('https://oauth2.googleapis.com/tokeninfo');
    url.searchParams.set('id_token', match[1]);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let payload;
    try {
      const googleRes = await fetchImpl(url, { signal: controller.signal, redirect: 'error' });
      if (!googleRes.ok) {
        const unavailable = googleRes.status === 429 || googleRes.status >= 500;
        return res.status(unavailable ? 503 : 401).json({
          success: false,
          message: unavailable ? VERIFICATION_UNAVAILABLE : INVALID_TOKEN
        });
      }
      payload = await googleRes.json();
    } catch {
      // Never decode locally or continue as a guest when verification fails.
      return res.status(503).json({ success: false, message: VERIFICATION_UNAVAILABLE });
    } finally {
      clearTimeout(timeout);
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(401).json({ success: false, message: INVALID_TOKEN });
    }
    if (typeof payload.aud !== 'string' || !clientIds.includes(payload.aud)) {
      return res.status(401).json({ success: false, message: 'Audience mismatch' });
    }

    // tokeninfo returns exp as a string; require a valid, unexpired NumericDate.
    const expiresAt = typeof payload.exp === 'number'
      ? payload.exp
      : typeof payload.exp === 'string' && /^\d+$/.test(payload.exp)
        ? Number(payload.exp)
        : NaN;
    if (!GOOGLE_ISSUERS.has(payload.iss)
      || !Number.isSafeInteger(expiresAt) || expiresAt <= now() / 1000
      || typeof payload.sub !== 'string' || !payload.sub.trim()) {
      return res.status(401).json({ success: false, message: INVALID_TOKEN });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture
    };
    return next();
  };
}
