const rateLimit = require('express-rate-limit')

 const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  limit: 5,                  // Max 5 requests per IP
  message: 'Too many login attempts. Try again after 15 minutes.',
  statusCode: 429,
  standardHeaders: 'draft-8', // Modern RateLimit header
  legacyHeaders: false,
});

module.exports = loginLimiter