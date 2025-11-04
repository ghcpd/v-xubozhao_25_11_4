// Lightweight Markdown parser (basic: headings, bold, italic, code, lists, links, fenced code)
function parseMarkdown(src) {
  if (!src) return '';
  // Normalize line endings
  src = src.replace(/\r\n?/g, '\n');

  // Escape HTML first
  const escapeHtml = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Extract fenced code blocks first to avoid inner formatting
  const codeBlocks = [];
  src = src.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || '', code: escapeHtml(code.trim()) });
    return `@@CODEBLOCK_${idx}@@`;
  });
  // Remove any dangling unmatched fence
  src = src.replace(/```\s*$/m, '');

  // Headings
  src = src.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
           .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
           .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
           .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
           .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
           .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

  // Lists: group consecutive list items
  src = src.replace(/^(?:- .*\n?)+/gm, (block) => {
    const items = block.trim().split(/\n/).map(line => line.replace(/^-\s+/, '').trim());
    return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
  });

  // Inline code
  src = src.replace(/`([^`]+)`/g, (m, code) => `<code>${escapeHtml(code)}</code>`);

  // Bold & italic (handle bold first)
  src = src.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  src = src.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Links [text](url)
  src = src.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs: wrap standalone lines not already HTML blocks
  const lines = src.split(/\n{2,}/).map(chunk => {
    if (/^\s*$/.test(chunk)) return ''; // skip empties
    if (/^<h\d|^<ul>|^<pre>|^<blockquote>|^<p>/.test(chunk.trim())) return chunk.trim();
    return '<p>' + chunk.trim().replace(/\n+/g, '<br/>') + '</p>';
  }).filter(Boolean);
  let html = lines.join('\n');

  // Restore code blocks
  html = html.replace(/@@CODEBLOCK_(\d+)@@/g, (m, idx) => {
    const { lang, code } = codeBlocks[+idx];
    const langClass = lang ? ` class="language-${lang.toLowerCase()}"` : '';
    return `<pre><code${langClass}>${code}</code></pre>`;
  });

  return html;
}

function setContent(markdown) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = parseMarkdown(markdown);
}

function loadSample() {
  fetch('sample_markdown.md')
    .then(r => r.text())
    .then(md => {
      const textarea = document.getElementById('markdownInput');
      textarea.value = md.trim();
      setContent(md);
      console.log('[MarkdownViewer] Sample loaded and rendered. Length:', md.length);
    })
    .catch(err => console.error('[MarkdownViewer] Failed to load sample:', err));
}

function clearContent() {
  document.getElementById('markdownInput').value = '';
  setContent('');
  console.log('[MarkdownViewer] Content cleared');
}

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('themeToggleBtn');
  const dark = body.classList.toggle('dark');
  btn.textContent = dark ? 'Light Mode' : 'Dark Mode';
  btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  console.log('[MarkdownViewer] Theme toggled. Dark:', dark);
}

function debounce(fn, delay = 250) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('markdownInput');
  const loadBtn = document.getElementById('loadSampleBtn');
  const clearBtn = document.getElementById('clearBtn');
  const themeBtn = document.getElementById('themeToggleBtn');

  loadBtn.addEventListener('click', loadSample);
  clearBtn.addEventListener('click', clearContent);
  themeBtn.addEventListener('click', toggleTheme);

  textarea.addEventListener('input', debounce(() => {
    setContent(textarea.value);
  }, 180));

  // Auto-load sample initially
  loadSample();
});

// Expose parser for test script (optional)
window.__parseMarkdown = parseMarkdown;
