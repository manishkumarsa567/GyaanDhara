import jwt from 'jsonwebtoken';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set in production.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'gyaandhara_dev_secret';

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

export { JWT_SECRET };
