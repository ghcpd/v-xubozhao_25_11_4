document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  const refreshBtn = document.getElementById('refreshBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Function to load and render Markdown
  function loadMarkdown() {
    fetch('sample_markdown.md')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load Markdown file');
        }
        return res.text();
      })
      .then(text => {
        // Render Markdown to HTML using marked.js
        // Try both API versions for compatibility
        if (typeof marked.parse === 'function') {
          contentDiv.innerHTML = marked.parse(text);
        } else if (typeof marked === 'function') {
          contentDiv.innerHTML = marked(text);
        } else {
          throw new Error('Marked.js library not loaded properly');
        }
        console.log('✅ Markdown loaded and rendered successfully!');
      })
      .catch(err => {
        contentDiv.innerHTML = `<p style="color: #e74c3c;">Error loading Markdown: ${err.message}</p>`;
        console.error('❌ Error:', err);
      });
  }

  // Function to clear content
  function clearContent() {
    contentDiv.innerHTML = '<p style="color: #95a5a6; text-align: center;">Content cleared. Click "Refresh Content" to reload.</p>';
    console.log('🗑️ Content cleared');
  }

  // Event listeners for buttons
  refreshBtn.addEventListener('click', () => {
    console.log('🔄 Refreshing content...');
    loadMarkdown();
  });

  clearBtn.addEventListener('click', () => {
    clearContent();
  });

  // Initial load
  loadMarkdown();
});
