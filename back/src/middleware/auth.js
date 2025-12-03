const jwt = require('jsonwebtoken');

const SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';

function extractToken(req) {
  // Authorization: Bearer <token>
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.split(' ')[1];
  // cookie
  if (req.cookies && req.cookies.token) return req.cookies.token;
  // query (not recommended)
  if (req.query && req.query.token) return req.query.token;
  return null;
}

function requireAdmin(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ ok: false, error: 'Missing token' });
  try {
    const payload = jwt.verify(token, SECRET);
    if (!payload || payload.role !== 'admin') return res.status(403).json({ ok: false, error: 'Forbidden' });
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

module.exports = { requireAdmin, extractToken };
