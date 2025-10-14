// ===========================================
// src/middleware/security.js - Security Middleware
// ===========================================

const xss = require('xss');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

function setupSecurity(app) {
  // Prevent XSS attacks
  app.use((req, res, next) => {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key]);
        }
      }
    }
    next();
  });

  // Prevent HTTP Parameter Pollution
  app.use(hpp({
    whitelist: ['tags', 'fields', 'sort'] // Allow duplicates for these params
  }));

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
}

module.exports = { setupSecurity };