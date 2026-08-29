import { MAX_AI_CALLS_PER_DAY } from '../config.js';

const aiCallTracker = new Map();

/**
 * Rate limiting middleware for AI calls
 */
export const aiRateLimit = (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'User required' });
  }

  const dateKey = `${userId}-${new Date().toISOString().split('T')[0]}`;
  const currentCount = aiCallTracker.get(dateKey) || 0;

  if (currentCount >= MAX_AI_CALLS_PER_DAY) {
    return res.status(429).json({
      success: false,
      error: 'Daily AI analysis limit exceeded. Please submit the challenge manually.'
    });
  }

  aiCallTracker.set(dateKey, currentCount + 1);
  next();
};
