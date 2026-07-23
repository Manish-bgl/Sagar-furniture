// server/src/index.js
// Sagar Furniture — Express Backend Server
// All security credentials stay here, NEVER exposed to frontend
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { createCorsMiddleware } from './middleware/cors.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

// Route imports
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import bannersRouter from './routes/banners.js';
import productTypesRouter from './routes/productTypes.js';
import uploadRouter from './routes/upload.js';
import aiRouter from './routes/ai.js';
import visitsRouter from './routes/visits.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ───
app.use(helmet());                    // Security headers
app.use(createCorsMiddleware());      // CORS whitelist
app.use(generalRateLimiter);          // General rate limiting
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sagar Furniture Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/product-types', productTypesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/ai', aiRouter);
app.use('/api/visits', visitsRouter);

// ─── 404 Handler ───
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ───
app.use((err, req, res, _next) => {
  console.error('🔴 Unhandled Error:', err);

  // Set CORS headers for the error response so browser doesn't block it
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum 10MB allowed.' });
  }

  // Multer file count error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Too many files. Maximum 3 images allowed.' });
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🪑 Sagar Furniture Backend Server          ║');
  console.log(`║   🌐 Running on: http://localhost:${PORT}        ║`);
  console.log(`║   📡 Environment: ${(process.env.NODE_ENV || 'development').padEnd(16)}     ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   GET  /api/health              — Health check');
  console.log('   POST /api/products            — Add product');
  console.log('   PUT  /api/products/:id         — Update product');
  console.log('   DEL  /api/products/:id         — Delete product');
  console.log('   POST /api/products/bulk        — Bulk import');
  console.log('   POST /api/categories           — Add category');
  console.log('   POST /api/banners              — Add banner');
  console.log('   POST /api/product-types        — Add item type');
  console.log('   POST /api/upload               — Upload image');
  console.log('   POST /api/upload/multiple      — Upload images');
  console.log('   POST /api/ai/generate-description — AI description');
  console.log('   POST /api/visits               — Track visitor');
  console.log('');
});
