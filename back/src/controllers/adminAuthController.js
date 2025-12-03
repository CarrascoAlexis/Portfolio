const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'username & password required' });

  if (username !== ADMIN_USER) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  let valid = false;
  if (ADMIN_PASSWORD_HASH) {
    valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } else {
    valid = password === ADMIN_PASSWORD;
  }

  if (!valid) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  const token = jwt.sign({ username: ADMIN_USER, role: 'admin' }, SECRET, { expiresIn: '8h' });
  // set httpOnly cookie with SameSite=None for cross-origin requests
  // Note: SameSite=None requires Secure flag, but for local dev we allow it without HTTPS
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, { 
    httpOnly: true, 
    sameSite: 'none',
    secure: isProduction // true in production (requires HTTPS), false in dev
  });
  res.json({ ok: true, user: { username: ADMIN_USER } });
}

function me(req, res) {
  // called after requireAdmin middleware so req.user exists
  if (!req.user) return res.status(401).json({ ok: false });
  res.json({ ok: true, user: req.user });
}

function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', { 
    sameSite: 'none',
    secure: isProduction 
  });
  res.json({ ok: true });
}

module.exports = { login, me, logout };
