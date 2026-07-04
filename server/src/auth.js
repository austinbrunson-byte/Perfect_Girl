// JWT bearer-token auth. Stateless: the token carries the user id and is verified
// on each request. Good enough for the foundation; if we later need revocation
// we add a token/session table and check it in requireAuth.
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const EXPIRES = process.env.JWT_EXPIRES || '30d';

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

function bearer(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// Hard gate: 401 unless a valid token is present.
export function requireAuth(req, res, next) {
  const payload = verifyToken(bearer(req) || '');
  if (!payload) return res.status(401).json({ error: 'unauthorized' });
  req.userId = payload.sub;
  next();
}

// Soft: attach req.userId if a valid token happens to be present, else continue.
export function optionalAuth(req, res, next) {
  const payload = verifyToken(bearer(req) || '');
  if (payload) req.userId = payload.sub;
  next();
}
