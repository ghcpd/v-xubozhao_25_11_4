document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  fetch('sample_markdown.md')
    .then(res => res.text())
    .then(text => {
      // Markdown is not rendered properly
      contentDiv.innerHTML = text;
    });
});
