import jwt from 'jsonwebtoken';
import { one } from './db.js';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET must be set');

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, version: user.token_version ?? 0 },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.mederng_session;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Authentication required' });
  const user = await one(
    `SELECT u.id, u.email, u.full_name, u.role, u.facility_id, u.token_version, f.name AS facility_name
     FROM users u LEFT JOIN facilities f ON f.id = u.facility_id WHERE u.id = $1`,
    [payload.id]
  );
  if (!user || user.token_version !== payload.version) {
    return res.status(401).json({ error: 'Session is no longer valid' });
  }
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not permitted for this role' });
    }
    next();
  };
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};
