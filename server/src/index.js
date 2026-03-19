'use strict';

const express = require('express');
const config = require('./config');
const pdfRoutes = require('./routes/pdf');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(config.requestTimeoutMs);
  res.setTimeout(config.requestTimeoutMs, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// PDF generation
app.use('/api', pdfRoutes);

// ── Error handling ──────────────────────────────────────────────────────────

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[PDF Server Error]', err);
  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

// ── Start ───────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`RPOC ATO PDF Server listening on port ${config.port}`);
  console.log(`Compliance dir: ${config.complianceDir}`);
});
