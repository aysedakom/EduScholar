// backend/middleware/rateLimiter.js
// In-memory sliding window rate limiter for API protection & brute-force prevention

const ipRequestMap = new Map();

/**
 * Creates a rate limiting middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max number of connections during windowMs
 * @param {string} options.message - Error message when rate limit exceeded
 */
function createRateLimiter({ windowMs = 60000, max = 100, message = 'Too many requests from this IP, please try again later.' } = {}) {
  return (req, res, next) => {
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = ipRequestMap.get(clientIp) || { count: 0, resetTime: now + windowMs };

    // Reset window if expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    ipRequestMap.set(clientIp, record);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

// Clean up stale IP records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (now > record.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, 300000);

// Auth Rate Limiter (Brute-force protection for login, register, OTP, password reset): 15 attempts per 5 mins
const authLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. For your security, please wait 5 minutes before trying again.',
});

// General API Rate Limiter: 300 requests per 1 min
const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'API rate limit exceeded. Please slow down your requests.',
});

module.exports = { createRateLimiter, authLimiter, generalLimiter };
