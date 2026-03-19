'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');
const config = require('../config');
const { convertMarkdown } = require('./markdown');
const { buildFullDocument, titleFromFilename, printCss } = require('./html-builder');

/**
 * Generate a PDF buffer from a list of markdown document filenames.
 *
 * Strategy:
 *   1. Read & convert each markdown file to HTML
 *   2. Build a full HTML document (cover + TOC + sections)
 *   3. Render the cover page separately (no header/footer)
 *   4. Render content pages with CUI header/footer
 *   5. Merge both PDFs with pdf-lib
 *
 * @param {string[]} documents - array of filenames, e.g. ["security-categorization.md"]
 * @returns {Promise<Buffer>} PDF file contents
 */
async function generatePDF(documents) {
  // ── 1. Read & convert markdown ──────────────────────────────────────────
  const sections = await Promise.all(
    documents.map(async (filename) => {
      const filePath = path.join(config.complianceDir, filename);
      const md = await fs.readFile(filePath, 'utf-8');
      const html = convertMarkdown(md);
      const title = titleFromFilename(filename);
      return { filename, title, html };
    }),
  );

  // ── 2. Build full HTML ──────────────────────────────────────────────────
  const fullHtml = buildFullDocument(sections);

  // ── 3. Launch browser ───────────────────────────────────────────────────
  const browser = await puppeteer.launch({
    executablePath: config.puppeteerExecutablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // ── 4a. Cover page PDF (no header/footer) ─────────────────────────────
    const coverPdfBytes = await page.pdf({
      format: 'Letter',
      margin: {
        top: config.page.margin.top,
        bottom: config.page.margin.bottom,
        left: config.page.margin.left,
        right: config.page.margin.right,
      },
      printBackground: true,
      displayHeaderFooter: false,
      pageRanges: '1',
    });

    // ── 4b. Content pages PDF (with header/footer) ────────────────────────
    const bannerText = config.cuiBanner;

    const headerTemplate = `
      <div style="width:100%;text-align:center;font-size:8pt;font-family:Arial,sans-serif;
                  color:#1a1a2e;font-weight:700;letter-spacing:2px;padding:4px 0;">
        ${bannerText}
      </div>`;

    const footerTemplate = `
      <div style="width:100%;display:flex;justify-content:space-between;align-items:center;
                  font-size:8pt;font-family:Arial,sans-serif;color:#1a1a2e;padding:4px 20px;">
        <span style="font-weight:700;letter-spacing:2px;">${bannerText}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`;

    const contentPdfBytes = await page.pdf({
      format: 'Letter',
      margin: {
        top: config.page.margin.top,
        bottom: config.page.margin.bottom,
        left: config.page.margin.left,
        right: config.page.margin.right,
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      pageRanges: '2-',
    });

    // ── 5. Merge with pdf-lib ─────────────────────────────────────────────
    const mergedPdf = await PDFDocument.create();

    const coverDoc = await PDFDocument.load(coverPdfBytes);
    const coverPages = await mergedPdf.copyPages(coverDoc, coverDoc.getPageIndices());
    for (const p of coverPages) {
      mergedPdf.addPage(p);
    }

    if (contentPdfBytes.length > 0) {
      try {
        const contentDoc = await PDFDocument.load(contentPdfBytes);
        const contentPages = await mergedPdf.copyPages(contentDoc, contentDoc.getPageIndices());
        for (const p of contentPages) {
          mergedPdf.addPage(p);
        }
      } catch {
        // If there's only 1 page total, pageRanges: '2-' produces empty/invalid PDF — that's OK
      }
    }

    const finalBytes = await mergedPdf.save();
    return Buffer.from(finalBytes);
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDF };
