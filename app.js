document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  const refreshButton = document.getElementById('refresh-button');

  const renderMarkdown = async () => {
    contentDiv.innerHTML = '<p class="status">Loading markdown...</p>';

    try {
      const response = await fetch('sample_markdown.md', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const rawMarkdown = await response.text();

      if (typeof marked === 'function') {
        marked.setOptions({ breaks: true, mangle: false, headerIds: false });
        contentDiv.innerHTML = marked.parse(rawMarkdown);
      } else {
        // Fallback: display raw markdown if library is unavailable
        contentDiv.textContent = rawMarkdown;
      }

      console.info('Markdown rendered successfully ✅');
    } catch (error) {
      console.error('Unable to load markdown.', error);
      contentDiv.innerHTML = '<p class="error">Unable to load content. Please try again.</p>';
    }
  };

  refreshButton?.addEventListener('click', renderMarkdown);

  renderMarkdown();
});
