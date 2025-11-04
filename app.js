document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  const reloadBtn = document.getElementById('reloadBtn');

  const setStatus = (message, state = 'info') => {
    const className = state === 'error' ? 'status-message error-state' : 'status-message';
    contentDiv.innerHTML = `<p class="${className}">${message}</p>`;
  };

  const renderMarkdown = (markdownText) => {
    if (window.marked && typeof window.marked.parse === 'function') {
      window.marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
      });
      return window.marked.parse(markdownText);
    }

    // Fallback: escape special characters and preserve line breaks.
    const escaped = markdownText.replace(/[&<>]/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[ch] || ch));

    return escaped
      .split(/\n{2,}/)
      .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };

  const loadMarkdown = async () => {
    try {
      setStatus('Loading markdown preview…');
      const response = await fetch('sample_markdown.md', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const text = await response.text();
      contentDiv.innerHTML = renderMarkdown(text.trim());
    } catch (error) {
      console.error('Failed to load markdown:', error);
      setStatus('Unable to load markdown. Please try again.', 'error');
    }
  };

  if (reloadBtn) {
    reloadBtn.addEventListener('click', async () => {
      reloadBtn.disabled = true;
      const originalLabel = reloadBtn.textContent;
      reloadBtn.textContent = 'Refreshing…';

      await loadMarkdown();

      reloadBtn.disabled = false;
      reloadBtn.textContent = originalLabel;
      reloadBtn.focus({ preventScroll: true });
    });
  }

  loadMarkdown();
});
