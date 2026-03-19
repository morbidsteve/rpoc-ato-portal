'use strict';

const config = require('../config');

// ── Print CSS (extracted & expanded from raise-portal.html pdfCss) ──────────

const printCss = `
/* --- Page setup --- */
@page {
  size: letter;
  margin: ${config.page.margin.top} ${config.page.margin.right} ${config.page.margin.bottom} ${config.page.margin.left};
}

/* --- Base typography --- */
body {
  font-family: Georgia, "Times New Roman", serif;
  color: #111827;
  background: #fff;
  line-height: 1.7;
  font-size: 11pt;
  margin: 0;
  padding: 0;
}

* { color: #111827; }

/* --- Headings --- */
h1 {
  font-size: 20pt;
  color: #111827;
  margin: 0 0 14px;
  line-height: 1.25;
  page-break-after: avoid;
}
h2 {
  font-size: 15pt;
  color: #111827;
  margin: 32px 0 12px;
  border-bottom: 1.5pt solid #1a1a2e;
  padding-bottom: 6px;
  page-break-after: avoid;
}
h3 {
  font-size: 12.5pt;
  color: #1f2937;
  margin: 26px 0 8px;
  page-break-after: avoid;
}
h4 {
  font-size: 11pt;
  color: #1f2937;
  margin: 20px 0 6px;
  font-weight: bold;
  page-break-after: avoid;
}

/* --- Paragraphs & inline --- */
p {
  margin: 8px 0;
  text-align: left;
  orphans: 3;
  widows: 3;
}
a { color: #2563eb; text-decoration: underline; }
strong { color: #111827; }

/* --- Code --- */
.inline-code {
  background: #f3f4f6;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 9.5pt;
  color: #1f2937;
}
.code-block {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
  font-family: "Courier New", monospace;
  font-size: 8.5pt;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: hidden;
  page-break-inside: avoid;
}
.code-block code {
  background: none;
  padding: 0;
  font-size: inherit;
}

/* --- Tables --- */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 14px 0;
  font-size: 8.5pt;
  table-layout: fixed;
  page-break-inside: auto;
}
th, td {
  border: 1px solid #c5c7cb;
  padding: 5px 6px;
  text-align: left;
  vertical-align: top;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.35;
}
th {
  background: #e8e9ec;
  font-weight: 700;
  color: #111827;
  font-size: 8pt;
}
tr.alt-row { background: #f7f8fa; }
tr { page-break-inside: avoid; }
thead { display: table-header-group; }

/* Wide tables (7+ columns) */
.wide-table { font-size: 7pt; }
.wide-table th, .wide-table td { padding: 3px 4px; font-size: 7pt; line-height: 1.25; }
.wide-table th { font-size: 6.5pt; }

/* Medium tables (5-6 columns) */
.med-table { font-size: 8pt; }
.med-table th, .med-table td { padding: 4px 5px; font-size: 8pt; }

/* --- Lists --- */
ul, ol { margin: 8px 0 8px 24px; }
li { margin: 4px 0; line-height: 1.5; }

/* --- Misc --- */
hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
blockquote {
  border-left: 3px solid #6b7280;
  padding-left: 16px;
  margin: 12px 0;
  font-style: italic;
  color: #4b5563;
  page-break-inside: avoid;
}

/* --- Page-break rules --- */
.cover  { page-break-after: always; }
.toc    { page-break-after: always; }
.section { page-break-before: always; }

/* --- Cover page --- */
.cover {
  text-align: center;
  padding: 160px 40px 80px;
}
.cover h1 {
  font-size: 28pt;
  margin-bottom: 12px;
  border-bottom: none;
  text-align: center;
}
.cover .subtitle {
  font-size: 14pt;
  color: #4b5563;
  margin-bottom: 40px;
  font-style: italic;
}
.cover .meta {
  font-size: 11pt;
  color: #6b7280;
  line-height: 2.2;
}
.cover .meta strong { color: #111827; }
.classification-banner {
  background: #1a1a2e;
  border: 2px solid #1a1a2e;
  padding: 10px 30px;
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #ffffff;
  display: inline-block;
  margin-bottom: 40px;
}
.cover-rule {
  width: 250px;
  border: none;
  border-top: 2px solid #1a1a2e;
  margin: 30px auto;
}

/* --- Table of Contents --- */
.toc { padding-top: 40px; }
.toc h2 {
  font-size: 20pt;
  border-bottom: 3px solid #1a1a2e;
  padding-bottom: 8px;
  margin-bottom: 30px;
  text-align: center;
}
.toc ol { list-style: none; margin: 0; padding: 0; }
.toc ol li {
  font-size: 11.5pt;
  padding: 10px 0;
  border-bottom: 1px dotted #d1d5db;
  display: flex;
  align-items: baseline;
}
.toc .toc-num {
  font-weight: 700;
  margin-right: 12px;
  white-space: nowrap;
  min-width: 80px;
}
.toc .toc-title { flex: 1; }

/* --- Section header block --- */
.section-header-block {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 3px solid #1a1a2e;
}
.section-number {
  font-size: 11pt;
  color: #6b7280;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.section-title {
  font-size: 20pt;
  color: #111827;
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}
`;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive a human-readable title from a filename.
 * e.g. "security-categorization.md" → "Security Categorization"
 */
function titleFromFilename(filename) {
  return filename
    .replace(/\.md$/i, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Build the cover page HTML.
 * @param {Array<{filename: string, title: string}>} sections
 * @param {string} today - formatted date string
 * @returns {string} HTML
 */
function buildCoverPage(sections, today) {
  const docList = sections.length === 1
    ? sections[0].title
    : `${sections.length} Compliance Documents`;

  return `
<div class="cover">
  <div class="classification-banner">${config.cuiBanner}</div>
  <h1>RPOC ATO Package</h1>
  <div class="subtitle">${docList}</div>
  <hr class="cover-rule">
  <div class="meta">
    <strong>Organization:</strong> RPOC / RAISE 2.0<br>
    <strong>Date Generated:</strong> ${today}<br>
    <strong>Classification:</strong> ${config.cuiBanner}<br>
    <strong>Status:</strong> DRAFT — Sample Data
  </div>
  <div class="classification-banner" style="margin-top:40px">${config.cuiBanner}</div>
</div>`;
}

/**
 * Build the Table of Contents page HTML.
 * @param {Array<{filename: string, title: string}>} sections
 * @returns {string} HTML
 */
function buildTocPage(sections) {
  const items = sections
    .map((s, i) => {
      const num = `Section ${i + 1}`;
      return `<li><span class="toc-num">${num}</span><span class="toc-title">${s.title}</span></li>`;
    })
    .join('\n');

  return `
<div class="toc">
  <h2>Table of Contents</h2>
  <ol>
    ${items}
  </ol>
</div>`;
}

/**
 * Build a single section's HTML.
 * @param {{filename: string, title: string, html: string}} section
 * @param {number} index - 0-based index
 * @param {number} total - total section count
 * @returns {string} HTML
 */
function buildSectionHtml(section, index, total) {
  return `
<div class="section">
  <div class="section-header-block">
    <div class="section-number">Section ${index + 1} of ${total}</div>
    <h1 class="section-title">${section.title}</h1>
  </div>
  ${section.html}
</div>`;
}

/**
 * Assemble the full HTML document from sections.
 * @param {Array<{filename: string, title: string, html: string}>} sections
 * @returns {string} complete HTML document
 */
function buildFullDocument(sections) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cover = buildCoverPage(sections, today);
  const toc = buildTocPage(sections);
  const sectionBlocks = sections
    .map((s, i) => buildSectionHtml(s, i, sections.length))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>RPOC ATO Package</title>
  <style>${printCss}</style>
</head>
<body>
  ${cover}
  ${toc}
  ${sectionBlocks}
</body>
</html>`;
}

module.exports = {
  buildCoverPage,
  buildTocPage,
  buildSectionHtml,
  buildFullDocument,
  titleFromFilename,
  printCss,
};
