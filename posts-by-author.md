---
layout: page
title: Posts by Author
permalink: /posts-by-author/
---

<div class="author-filter-section">
  <div class="filter-control">
    <button class="filter-button active" data-author="all">All Authors</button>
    {% for author in site.data.authors %}
    <button class="filter-button" data-author="{{ author[0] }}">{{ author[1].display_name }}</button>
    {% endfor %}
  </div>
</div>

<div class="search-container">
  <input type="text" id="authorSearchInput" class="search-input" placeholder="Search entries...">
</div>

<div class="posts-by-author" id="postsAuthorContainer">
  {% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
  {% for year in posts_by_year %}
  <div class="year-group">
    <h2 class="year-heading">{{ year.name }}</h2>
    
    {% assign posts_this_year = year.items | sort: "date" | reverse %}
    
    {% for post in posts_this_year %}
    {% assign author_data = site.data.authors[post.author] %}
    <article class="post-item" data-author="{{ post.author }}">
      <div class="post-meta">
        <span class="post-date">{{ post.date | date: site.learning_journal.date_format }}</span>
        <span class="post-author author-{{ post.author }}" style="color: {{ author_data.color }};">
          {{ author_data.display_name }}
        </span>
      </div>
      <h3 class="post-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <div class="post-tags">
        {% for tag in post.tags %}
        <span class="post-tag">{{ tag }}</span>
        {% endfor %}
      </div>
    </article>
    {% endfor %}
  </div>
  {% endfor %}
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-button');
  const postItems = document.querySelectorAll('.post-item');
  const searchInput = document.getElementById('authorSearchInput');
  
  // Active filter tracking
  let activeFilter = 'all';
  let searchTerm = '';
  
  // Filter function that combines author filtering and search
  function applyFilters() {
    postItems.forEach(post => {
      const postAuthor = post.getAttribute('data-author');
      const postContent = post.textContent.toLowerCase();
      const matchesAuthor = activeFilter === 'all' || postAuthor === activeFilter;
      const matchesSearch = searchTerm === '' || postContent.includes(searchTerm);
      
      if (matchesAuthor && matchesSearch) {
        post.style.display = 'block';
      } else {
        post.style.display = 'none';
      }
    });
    
    // Hide year headings if all posts in that year are hidden
    document.querySelectorAll('.year-group').forEach(yearGroup => {
      const visiblePosts = yearGroup.querySelectorAll('.post-item[style="display: block;"]').length;
      const yearHeading = yearGroup.querySelector('.year-heading');
      
      if (visiblePosts === 0) {
        yearGroup.style.display = 'none';
      } else {
        yearGroup.style.display = 'block';
      }
    });
  }
  
  // Set up filter button click handlers
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active filter
      activeFilter = button.getAttribute('data-author');
      
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
