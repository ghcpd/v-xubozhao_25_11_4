document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  const statusDiv = document.getElementById('status');
  const reloadButton = document.getElementById('reload-button');

  const updateStatus = (message, type = 'info') => {
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.dataset.statusType = type;
  };

  const renderMarkdown = (markdownText) => {
    const html = marked.parse(markdownText, { breaks: true, gfm: true });
    contentDiv.innerHTML = html;
    console.log('%cMarkdown rendered successfully.', 'color: #0b8043; font-weight: bold;');
    console.log('Rendered HTML preview:', contentDiv.innerHTML.slice(0, 200) + (contentDiv.innerHTML.length > 200 ? '…' : ''));
  };

  const loadMarkdown = async () => {
    updateStatus('Loading markdown content…');
    try {
      const response = await fetch('sample_markdown.md', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const markdownText = await response.text();
      renderMarkdown(markdownText);
      updateStatus('Markdown loaded successfully.');
    } catch (error) {
      console.error('Failed to load markdown:', error);
      updateStatus('Unable to load markdown content. Please try again.', 'error');
      contentDiv.innerHTML = '<p class="error">We could not retrieve the markdown file.</p>';
    }
  };

  if (reloadButton) {
    reloadButton.addEventListener('click', () => {
      loadMarkdown();
      reloadButton.blur();
    });
  }

  loadMarkdown();
});
