---
layout: page
title: Questions
permalink: /questions/
---

<div class="filter-section">
  <div class="filter-control">
    <button class="filter-button active" data-status="all">All</button>
    <button class="filter-button" data-status="open">Open</button>
    <button class="filter-button" data-status="in-progress">In Progress</button>
    <button class="filter-button" data-status="answered">Answered</button>
  </div>
  
  <div class="filter-control author-filters">
    <button class="author-filter-button active" data-author="all">All Authors</button>
    {% for author in site.data.authors %}
    <button class="author-filter-button" data-author="{{ author[0] }}">{{ author[1].display_name }}</button>
    {% endfor %}
  </div>
</div>

<div class="search-container">
  <input type="text" id="questionSearchInput" class="search-input" placeholder="Search questions...">
</div>

<div class="questions-grid" id="questionsContainer">
  {% assign questions = site.questions | sort: "date" | reverse %}
  {% for question in questions %}
  {% assign author_data = site.data.authors[question.author] %}
  <div class="question-card status-{{ question.status }}" data-status="{{ question.status }}" data-author="{{ question.author }}">
    <div class="question-status">{{ question.status | replace: "-", " " | capitalize }}</div>
    <h2 class="question-title"><a href="{{ question.url | relative_url }}">{{ question.title }}</a></h2>
    <div class="question-meta">
      <span class="question-date">{{ question.date | date: site.learning_journal.date_format }}</span>
      <span class="question-author author-{{ question.author }}" style="color: {{ author_data.color }};">
        {{ author_data.display_name }}
      </span>
      {% if question.priority %}
      <span class="question-priority priority-{{ question.priority | downcase }}">{{ question.priority }}</span>
      {% endif %}
    </div>
    <div class="question-excerpt">
      {{ question.content | strip_html | truncatewords: 25 }}
    </div>
    <div class="question-tags">
      {% for tag in question.related_tags %}
      <span class="question-tag">{{ tag }}</span>
      {% endfor %}
    </div>
  </div>
  {% endfor %}
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  // Filter buttons
  const statusFilterButtons = document.querySelectorAll('.filter-button');
  const authorFilterButtons = document.querySelectorAll('.author-filter-button');
  const questionCards = document.querySelectorAll('.question-card');
  const searchInput = document.getElementById('questionSearchInput');
  
  // Active filter tracking
  let activeStatusFilter = 'all';
  let activeAuthorFilter = 'all';
  let searchTerm = '';
  
  // Filter function that combines status, author filtering and search
  function applyFilters() {
    questionCards.forEach(card => {
      const cardStatus = card.getAttribute('data-status');
      const cardAuthor = card.getAttribute('data-author');
      const cardContent = card.textContent.toLowerCase();
      
      const matchesStatus = activeStatusFilter === 'all' || cardStatus === activeStatusFilter;
      const matchesAuthor = activeAuthorFilter === 'all' || cardAuthor === activeAuthorFilter;
      const matchesSearch = searchTerm === '' || cardContent.includes(searchTerm);
      
      if (matchesStatus && matchesAuthor && matchesSearch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show a message if no results are found
    const visibleCards = document.querySelectorAll('.question-card[style="display: block;"]');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (visibleCards.length === 0) {
      if (!noResultsMessage) {
        const message = document.createElement('div');
        message.id = 'noResultsMessage';
        message.className = 'no-results-message';
        message.textContent = 'No questions match your filters.';
        document.getElementById('questionsContainer').appendChild(message);
      }
    } else if (noResultsMessage) {
      noResultsMessage.remove();
    }
  }
  
  // Set up status filter button click handlers
  statusFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      statusFilterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active filter
      activeStatusFilter = button.getAttribute('data-status');
      
      // Apply filters
      applyFilters();
    });
  });
  
  // Set up author filter button click handlers
  authorFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      authorFilterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active filter
      activeAuthorFilter = button.getAttribute('data-author');
      
      // Apply filters
      applyFilters();
    });
  });
  
  // Set up search input handler
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.toLowerCase();
      applyFilters();
    });
  }
});
</script>

<style>
</style>

