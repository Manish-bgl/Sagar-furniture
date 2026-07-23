// server/src/middleware/rateLimiter.js
// Rate limiting — prevents abuse of expensive endpoints (AI, uploads)
import rateLimit from 'express-rate-limit';

// AI Description endpoint — max 5 requests per minute per IP
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Rate limit exceeded — please wait 1 minute before generating again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload endpoint — max 20 uploads per minute per IP
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Upload rate limit exceeded — please wait before uploading more images.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter — max 100 requests per minute per IP
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests — please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
