const fs = require('fs');
const path = require('path');

function parseMarkdown(src) {
  if (!src) return '';
  src = src.replace(/\r\n?/g, '\n');
  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const codeBlocks = [];
  src = src.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || '', code: escapeHtml(code.trim()) });
    return `@@CODEBLOCK_${idx}@@`;
  });
  src = src.replace(/```\s*$/m, '');
  src = src.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
           .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
           .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
           .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
           .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
           .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  src = src.replace(/^(?:- .*\n?)+/gm, (block) => {
    const items = block.trim().split(/\n/).map(line => line.replace(/^-\s+/, '').trim());
    return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
  });
  src = src.replace(/`([^`]+)`/g, (m, code) => `<code>${escapeHtml(code)}</code>`);
  src = src.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  src = src.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  src = src.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const lines = src.split(/\n{2,}/).map(chunk => {
    if (/^\s*$/.test(chunk)) return '';
    if (/^<h\d|^<ul>|^<pre>|^<blockquote>|^<p>/.test(chunk.trim())) return chunk.trim();
    return '<p>' + chunk.trim().replace(/\n+/g, '<br/>') + '</p>';
  }).filter(Boolean);
  let html = lines.join('\n');
  html = html.replace(/@@CODEBLOCK_(\d+)@@/g, (m, idx) => {
    const { lang, code } = codeBlocks[+idx];
    const langClass = lang ? ` class=\"language-${lang.toLowerCase()}\"` : '';
    return `<pre><code${langClass}>${code}</code></pre>`;
  });
  return html;
}

const md = fs.readFileSync(path.join(__dirname, 'sample_markdown.md'), 'utf8');
const rendered = parseMarkdown(md);

const snapshot = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Snapshot</title></head><body class=\"light\">\n<header><h1>Markdown Viewer (Snapshot)</h1></header>\n<main style=\"display:flex;gap:1rem;\">\n<section style=\"width:50%;\"><h2>Source Markdown</h2><pre>${md.replace(/</g,'&lt;')}</pre></section>\n<section style=\"width:50%;\"><h2>Rendered HTML</h2><div class=\"markdown-body\">${rendered}</div></section>\n</main>\n</body></html>`;

console.log('--- SNAPSHOT START ---');
console.log(rendered);
console.log('--- SNAPSHOT END ---');
fs.writeFileSync(path.join(__dirname, 'snapshot.html'), snapshot, 'utf8');
console.log('Snapshot written to snapshot.html');
