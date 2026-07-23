// server/src/middleware/cors.js
// CORS configuration — only allow known frontend origins
import cors from 'cors';

export function createCorsMiddleware() {
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // Always allow localhost in dev
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000');
  }

  // Log allowed origins at startup for debugging
  console.log('🔐 CORS Allowed Origins:', allowedOrigins.length ? allowedOrigins : ['(none set — check CORS_ORIGINS env var)']);

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');

      // 1. Exact match in CORS_ORIGINS list
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // 2. Allow any *.vercel.app deploy (covers preview + production Vercel URLs)
      if (cleanOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 3. Allow localhost in development
      if (process.env.NODE_ENV !== 'production' && cleanOrigin.includes('localhost')) {
        return callback(null, true);
      }

      console.warn(`⚠️  CORS blocked: ${cleanOrigin} | Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
