// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Theme toggle click handler
  themeToggle.addEventListener('click', function() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  // Search functionality for homepage
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const postsContainer = document.getElementById('postsContainer');
    const postCards = postsContainer.querySelectorAll('.post-card');

    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();

      postCards.forEach(card => {
        const title = card.querySelector('.post-title').textContent.toLowerCase();
        const content = card.querySelector('.post-excerpt').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.post-tag')).map(tag => tag.textContent.toLowerCase());

        if (title.includes(searchTerm) || content.includes(searchTerm) || tags.some(tag => tag.includes(searchTerm))) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Search functionality for author page
  const authorSearchInput = document.getElementById('authorSearchInput');
  if (authorSearchInput) {
    const postsAuthorContainer = document.getElementById('postsAuthorContainer');
    const postItems = postsAuthorContainer.querySelectorAll('.post-item');

    authorSearchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();

      postItems.forEach(item => {
        const title = item.querySelector('.post-title').textContent.toLowerCase();
        const tags = Array.from(item.querySelectorAll('.post-tag')).map(tag => tag.textContent.toLowerCase());

        if (title.includes(searchTerm) || tags.some(tag => tag.includes(searchTerm))) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Search functionality for questions page
  const questionSearchInput = document.getElementById('questionSearchInput');
  if (questionSearchInput) {
    const questionsContainer = document.getElementById('questionsContainer');
    const questionCards = questionsContainer.querySelectorAll('.question-card');

    questionSearchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();

      questionCards.forEach(card => {
        const title = card.querySelector('.question-title').textContent.toLowerCase();
        const content = card.querySelector('.question-excerpt')?.textContent.toLowerCase() || '';
        const tags = Array.from(card.querySelectorAll('.question-tag')).map(tag => tag.textContent.toLowerCase());

        if (title.includes(searchTerm) || content.includes(searchTerm) || tags.some(tag => tag.includes(searchTerm))) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});
