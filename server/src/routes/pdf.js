'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Router } = require('express');
const config = require('../config');
const { generatePDF } = require('../lib/pdf-generator');

const router = Router();

/** Allowed filename pattern: lowercase alphanumeric + hyphens, ending in .md */
const FILENAME_RE = /^[a-z0-9-]+\.md$/;

/**
 * POST /api/generate-pdf
 *
 * Body: { documents: ["security-categorization.md", ...] }
 * Response: application/pdf binary
 */
router.post('/generate-pdf', async (req, res, next) => {
  try {
    const { documents } = req.body;

    // ── Validate request ────────────────────────────────────────────────
    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        error: 'Request body must include a non-empty "documents" array.',
      });
    }

    // Validate each filename
    for (const doc of documents) {
      if (typeof doc !== 'string' || !FILENAME_RE.test(doc)) {
        return res.status(400).json({
          error: `Invalid document name: "${doc}". Must match pattern: ${FILENAME_RE}`,
        });
      }
    }

    // Check that every file exists
    const missing = [];
    for (const doc of documents) {
      const filePath = path.join(config.complianceDir, doc);
      if (!fs.existsSync(filePath)) {
        missing.push(doc);
      }
    }
    if (missing.length > 0) {
      return res.status(404).json({
        error: `Document(s) not found: ${missing.join(', ')}`,
      });
    }

    // ── Generate PDF ────────────────────────────────────────────────────
    const pdfBuffer = await generatePDF(documents);

    // ── Stream response ─────────────────────────────────────────────────
    const filename = documents.length === 1
      ? documents[0].replace(/\.md$/, '.pdf')
      : 'rpoc-ato-package.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
