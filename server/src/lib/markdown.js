'use strict';

const { marked } = require('marked');

// ── Configure marked ────────────────────────────────────────────────────────

marked.setOptions({
  gfm: true,        // GitHub-flavoured Markdown (tables, strikethrough, etc.)
  breaks: false,
});

// ── Custom renderer ─────────────────────────────────────────────────────────

const renderer = new marked.Renderer();

/**
 * Tables: add .wide-table for 7+ columns, .med-table for 5-6 columns.
 */
renderer.table = function (token) {
  const colCount = token.header.length;
  let cls = '';
  if (colCount >= 7) {
    cls = ' class="wide-table"';
  } else if (colCount >= 5) {
    cls = ' class="med-table"';
  }

  // Build header row
  const headerCells = token.header
    .map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
    .join('');
  const headerRow = `<tr>${headerCells}</tr>`;

  // Build body rows with alternating class
  const bodyRows = token.rows
    .map((row, i) => {
      const cells = row
        .map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`)
        .join('');
      const rowCls = i % 2 === 1 ? ' class="alt-row"' : '';
      return `<tr${rowCls}>${cells}</tr>`;
    })
    .join('');

  return `<table${cls}><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
};

/**
 * Code spans: wrap in .inline-code
 */
renderer.codespan = function ({ text }) {
  return `<span class="inline-code">${text}</span>`;
};

/**
 * Code blocks: wrap in .code-block
 */
renderer.code = function ({ text, lang }) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<pre class="code-block"><code>${escaped}</code></pre>`;
};

// Apply renderer
marked.use({ renderer });

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Convert a markdown string to HTML.
 * @param {string} mdString - raw markdown content
 * @returns {string} HTML fragment
 */
function convertMarkdown(mdString) {
  return marked.parse(mdString);
}

module.exports = { convertMarkdown };
