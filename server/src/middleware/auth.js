import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

/**
 * Middleware to authenticate requests via JWT
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, role, universityId, industryOrgId, id } - making it id to be generic as well
    if(!req.user.id) req.user.id = req.user.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

/**
 * Factory middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

/**
 * Helper function to generate JWT token
 * @param {Object} payload - Token payload
 * @param {number} payload.userId
 * @param {string} payload.role
 * @param {number} [payload.universityId]
 * @param {number} [payload.industryOrgId]
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(
    {
      id: payload.userId,
      userId: payload.userId,
      role: payload.role,
      universityId: payload.universityId,
      industryOrgId: payload.industryOrgId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
