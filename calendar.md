---
layout: page
title: Learning Calendar
permalink: /calendar/
---

<!-- Calendar container elements -->
<div class="calendar-controls">
  <div class="month-navigation">
    <button id="prevMonth" class="nav-button">&larr;</button>
    <h2 id="currentMonthDisplay">Loading...</h2>
    <button id="nextMonth" class="nav-button">&rarr;</button>
  </div>
  
  <div class="view-toggle">
    <button class="view-button active" data-view="calendar">Calendar</button>
    <button class="view-button" data-view="timeline">Timeline</button>
  </div>
</div>

<div id="calendarView" class="view-section active">
  <div class="weekday-headers">
    <span>Sun</span>
    <span>Mon</span>
    <span>Tue</span>
    <span>Wed</span>
    <span>Thu</span>
    <span>Fri</span>
    <span>Sat</span>
  </div>
  <div class="calendar-grid" id="calendarGrid"></div>
</div>

<div id="timelineView" class="view-section">
  <div class="timeline-wrapper" id="timelineContainer"></div>
</div>

<div id="dayDetail" class="day-detail" style="display: none;">
  <div class="day-detail-header">
    <h3 id="selectedDate">Selected Date</h3>
    <button id="closeDayDetail" class="close-button">&times;</button>
  </div>
  <div id="dayDetailContent" class="day-detail-content"></div>
</div>

<!-- Generate posts data directly into the page -->
<script>
// Create posts array directly in the page with normalized date strings
const postsData = [
  {% for post in site.posts %}
  {
    "title": {{ post.title | jsonify }},
    "url": "{{ post.url | relative_url }}",
    "date": "{{ post.date | date: '%Y-%m-%d' }}", // Keep date as string in YYYY-MM-DD format
    "author": "{{ post.author }}",
    "excerpt": {{ post.excerpt | strip_html | truncatewords: 30 | jsonify }}
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
];

// Initialize authors data from Jekyll's data files
const authorsData = {
  {% for author in site.data.authors %}
  "{{ author[0] }}": {
    "display_name": "{{ author[1].display_name }}",
    "color": "{{ author[1].color }}"
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
};

// Get array of author IDs for use later
const authorIds = Object.keys(authorsData);

console.log("Authors data loaded:", authorIds.length, "authors");
console.log("Posts data loaded:", postsData.length, "posts");

document.addEventListener('DOMContentLoaded', function() {
  // Function to get author display name
  function getAuthorDisplayName(authorId) {
    return authorsData[authorId] ? authorsData[authorId].display_name : authorId;
  }

  // Function to get author color
  function getAuthorColor(authorId) {
    return authorsData[authorId] ? authorsData[authorId].color : "#999999";
  }

  // Calendar elements
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarPreview = document.getElementById('calendarPreview');
  const timelineContainer = document.getElementById('timelineContainer');
  const dayDetail = document.getElementById('dayDetail');
  const selectedDateEl = document.getElementById('selectedDate');
  const dayDetailContent = document.getElementById('dayDetailContent');
  const currentMonthDisplay = document.getElementById('currentMonthDisplay');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');

  // Current date tracking
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let currentView = 'calendar'; // Track current view

  // Full calendar generation
  if (calendarGrid) {
    console.log("Calendar grid found, setting up...");

    // Month navigation
    if (prevMonthBtn && nextMonthBtn) {
      prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        updateCurrentView();
      });

      nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        updateCurrentView();
      });
    }

    // View toggling
    const viewButtons = document.querySelectorAll('.view-button');
    if (viewButtons.length > 0) {
      const calendarView = document.getElementById('calendarView');
      const timelineView = document.getElementById('timelineView');

      viewButtons.forEach(button => {
        button.addEventListener('click', function() {
          const view = this.getAttribute('data-view');
          currentView = view;

          // Update active button
          viewButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');

          // Update active view
          if (view === 'calendar') {
            calendarView.classList.add('active');
            timelineView.classList.remove('active');
            renderCalendar();
          } else {
            calendarView.classList.remove('active');
            timelineView.classList.add('active');
            renderTimeline();
          }
        });
      });
    }

    // Close day detail
    const closeDayDetailBtn = document.getElementById('closeDayDetail');
    if (closeDayDetailBtn && dayDetail) {
      closeDayDetailBtn.addEventListener('click', function() {
        dayDetail.style.display = 'none';
      });
    }
    
    // Initialize calendar
    renderCalendar();
  } else {
    console.error("Calendar grid element not found");
  }

  // Function to update the current view based on month change
  function updateCurrentView() {
    if (currentView === 'calendar') {
      renderCalendar();
    } else {
      renderTimeline();
    }
  }

  // Function to safely extract month and year from date string
  function getMonthYearFromDateString(dateStr) {
    // Split the date string into year, month, day components
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    return { month: month - 1, year: year }; // JS months are 0-indexed
  }

  // Render full calendar
  function renderCalendar() {
    if (!calendarGrid || !currentMonthDisplay) return;

    // Display current month and year
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    currentMonthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Clear grid
    calendarGrid.innerHTML = '';

    // Get first day of month (0-6, where 0 is Sunday)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyDay);
    }

    // Create cells for each day in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = postsData.filter(post => post.date === dateStr);

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';

      // Create day number at the top
      const dayNumber = document.createElement('span');
      dayNumber.className = 'calendar-day-number';
      dayNumber.textContent = day;
      dayElement.appendChild(dayNumber);

      // Add 'empty-day' class to days without entries
      if (dayEntries.length === 0) {
        dayElement.classList.add('empty-day');
      } else {
        dayElement.classList.add('has-entry');

        // Count unique authors who posted on this day
        const uniqueAuthors = new Set(dayEntries.map(entry => entry.author));
        
        // Add class if all authors posted on this day
        if (uniqueAuthors.size === authorIds.length && authorIds.length > 1) {
          dayElement.classList.add('has-entries-all');
        }
        
        // Only create indicators if there are actual authors
        if (uniqueAuthors.size > 0) {
          // Create container for post indicators (not author indicators)
          const postIndicatorsContainer = document.createElement('div');
          postIndicatorsContainer.className = 'post-indicators';
          
          // Collect authors who posted on this day
          const authorsWithEntries = Array.from(uniqueAuthors);
          
          // Create post indicator elements based on which authors posted
          authorsWithEntries.forEach(authorId => {
            const indicator = document.createElement('div');
            indicator.className = `post-indicator author-${authorId}`;
            indicator.style.backgroundColor = getAuthorColor(authorId);
            postIndicatorsContainer.appendChild(indicator);
          });
          
          dayElement.appendChild(postIndicatorsContainer);
        }
      }

      // Check if this is today
      const now = new Date();
      if (day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
        dayElement.classList.add('today');
      }

      // Always add click handler, but it'll show "No posts" for empty days
      dayElement.addEventListener('click', function() {
        showDayDetail(dateStr, dayEntries);
      });

      calendarGrid.appendChild(dayElement);
    }
  }

  // Render timeline view
  function renderTimeline() {
    if (!timelineContainer || !currentMonthDisplay) return;

    // Display current month and year
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    currentMonthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Clear timeline
    timelineContainer.innerHTML = '';

    // Filter posts for the current month using string comparison for reliability
    const currentMonthPosts = postsData.filter(post => {
      // Extract month and year from date string
      const postDateParts = getMonthYearFromDateString(post.date);
      return postDateParts.month === currentMonth && postDateParts.year === currentYear;
    });

    // If no posts this month, show message
    if (currentMonthPosts.length === 0) {
      const noPostsMessage = document.createElement('div');
      noPostsMessage.className = 'no-entries-message';
      noPostsMessage.textContent = `No posts for ${monthNames[currentMonth]} ${currentYear}.`;
      timelineContainer.appendChild(noPostsMessage);
      return;
    }

    // Group posts by date
    const postsByDate = {};

    currentMonthPosts.forEach(post => {
      if (!postsByDate[post.date]) {
        postsByDate[post.date] = [];
      }
      postsByDate[post.date].push(post);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(postsByDate).sort().reverse();

    // Create timeline
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    sortedDates.forEach(date => {
      const entries = postsByDate[date];

      // Count unique authors for this date
      const authorsOnThisDate = new Set();
      entries.forEach(entry => {
        if (entry.author) {
          authorsOnThisDate.add(entry.author);
        }
      });
      
      // Get array of authors who posted
      const authorsPresent = Array.from(authorsOnThisDate);

      // Create timeline item
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';

      // Create marker based on authors who posted
      if (authorsPresent.length > 0) {
        const markerContainer = document.createElement('div');
        markerContainer.className = 'timeline-marker-container';
        
        // If multiple authors posted, create a split circle
        if (authorsPresent.length > 1) {
          // Create a multi-author marker
          const multiMarker = document.createElement('div');
          multiMarker.className = 'timeline-multi-marker';
          
          // Add pie segments for each author
          authorsPresent.forEach((authorId, index) => {
            const segment = document.createElement('div');
            segment.className = `timeline-marker-segment segment-${index + 1} segment-${authorsPresent.length}`;
            segment.style.backgroundColor = getAuthorColor(authorId);
            multiMarker.appendChild(segment);
          });
          
          // Add count if there are more than 2 entries total
          if (entries.length > 2) {
            const countBadge = document.createElement('div');
            countBadge.className = 'count-badge';
            countBadge.textContent = entries.length.toString();
            multiMarker.appendChild(countBadge);
          }
          
          markerContainer.appendChild(multiMarker);
        } else {
          // Single author marker
          const singleAuthorId = authorsPresent[0];
          const marker = document.createElement('div');
          marker.className = `timeline-marker timeline-marker-${singleAuthorId}`;
          marker.style.backgroundColor = getAuthorColor(singleAuthorId);
          
          // Add count if there are multiple entries
          const authorEntries = entries.filter(entry => entry.author === singleAuthorId);
          if (authorEntries.length > 1) {
            marker.textContent = authorEntries.length.toString();
          }
          
          markerContainer.appendChild(marker);
        }
        
        timelineItem.appendChild(markerContainer);
      }

      // Format date - fix to handle timezone issues
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      // Create date object with local timezone (months are 0-indexed in JS)
      const dateObj = new Date(year, month - 1, day);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const dateEl = document.createElement('div');
      dateEl.className = 'timeline-date';
      dateEl.textContent = formattedDate;
      timelineItem.appendChild(dateEl);

      // Create entries container
      const entriesContainer = document.createElement('div');
      entriesContainer.className = 'timeline-entries';

      // Add entries
      entries.forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = `timeline-entry author-${entry.author}`;
        entryEl.style.borderLeft = `4px solid ${getAuthorColor(entry.author)}`;

        const entryTitle = document.createElement('h3');
        entryTitle.className = 'entry-title';

        const entryLink = document.createElement('a');
        entryLink.href = entry.url;
        entryLink.textContent = entry.title;

        entryTitle.appendChild(entryLink);
        entryEl.appendChild(entryTitle);

        const entryMeta = document.createElement('div');
        entryMeta.className = 'entry-meta';

        const authorSpan = document.createElement('span');
        authorSpan.className = `entry-author author-${entry.author}`;
        authorSpan.textContent = getAuthorDisplayName(entry.author);

        entryMeta.appendChild(authorSpan);
        entryEl.appendChild(entryMeta);

        const entryExcerpt = document.createElement('div');
        entryExcerpt.className = 'entry-excerpt';
        entryExcerpt.textContent = entry.excerpt;
        entryEl.appendChild(entryExcerpt);

        entriesContainer.appendChild(entryEl);
      });

      timelineItem.appendChild(entriesContainer);
      timeline.appendChild(timelineItem);
    });

    timelineContainer.appendChild(timeline);
  }

  // Show day detail popup
  function showDayDetail(dateStr, entries) {
    if (!dayDetail || !selectedDateEl || !dayDetailContent) return;

    // Parse the date parts manually to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));

    // Create date object with local timezone (months are 0-indexed in JS)
    const dateObj = new Date(year, month - 1, day);

    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Update selected date
    selectedDateEl.textContent = formattedDate;

    // Clear previous content
    dayDetailContent.innerHTML = '';

    // Check if there are entries
    if (entries.length === 0) {
      const noEntriesMessage = document.createElement('div');
      noEntriesMessage.className = 'no-entries-message';
      noEntriesMessage.textContent = 'No posts for this date.';
      dayDetailContent.appendChild(noEntriesMessage);
    } else {
      // Add entries to detail view
      entries.forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = 'detail-entry';
        entryEl.style.borderLeft = `4px solid ${getAuthorColor(entry.author)}`;

        const entryHeader = document.createElement('div');
        entryHeader.className = 'entry-header';

        const entryTitle = document.createElement('h3');
        entryTitle.className = 'entry-title';

        const entryLink = document.createElement('a');
        entryLink.href = entry.url;
        entryLink.textContent = entry.title;

        entryTitle.appendChild(entryLink);
        entryHeader.appendChild(entryTitle);

        const entryMeta = document.createElement('div');
        entryMeta.className = 'entry-meta';

        const authorSpan = document.createElement('span');
        authorSpan.className = `entry-author author-${entry.author}`;
        authorSpan.textContent = getAuthorDisplayName(entry.author);

        entryMeta.appendChild(authorSpan);
        entryHeader.appendChild(entryMeta);

        entryEl.appendChild(entryHeader);

        const entryContent = document.createElement('div');
        entryContent.className = 'entry-content';
        entryContent.textContent = entry.excerpt;

        const readMoreLink = document.createElement('a');
        readMoreLink.href = entry.url;
        readMoreLink.className = 'read-more';
        readMoreLink.textContent = 'Read more';

        entryContent.appendChild(document.createElement('br'));
        entryContent.appendChild(readMoreLink);
        entryEl.appendChild(entryContent);

        dayDetailContent.appendChild(entryEl);
      });
    }

    // Show detail view
    dayDetail.style.display = 'block';
  }

  // Helper to format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
</script>


