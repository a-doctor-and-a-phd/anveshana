---
layout: page
title: Question Dashboard
permalink: /question-dashboard/
---

<div class="dashboard-stats">
  <div class="stat-card">
    <div class="stat-title">Open</div>
    <div class="stat-value">{{ site.questions | where: "status", "open" | size }}</div>
  </div>
  <div class="stat-card">
    <div class="stat-title">In Progress</div>
    <div class="stat-value">{{ site.questions | where: "status", "in-progress" | size }}</div>
  </div>
  <div class="stat-card">
    <div class="stat-title">Answered</div>
    <div class="stat-value">{{ site.questions | where: "status", "answered" | size }}</div>
  </div>
  <div class="stat-card">
    <div class="stat-title">Total</div>
    <div class="stat-value">{{ site.questions.size }}</div>
  </div>
</div>

<div class="dashboard-section">
  <h2>High Priority Questions</h2>
  <div class="questions-list">
    {% assign high_priority = site.questions | where: "priority", "high" | where: "status", "open" %}
    {% if high_priority.size > 0 %}
      {% for question in high_priority %}
      {% assign author_data = site.data.authors[question.author] %}
      <div class="question-card status-{{ question.status }}">
        <div class="question-status">{{ question.status | replace: "-", " " | capitalize }}</div>
        <h3 class="question-title"><a href="{{ question.url | relative_url }}">{{ question.title }}</a></h3>
        <div class="question-meta">
          <span class="question-date">{{ question.date | date: site.learning_journal.date_format }}</span>
          <span class="question-author author-{{ question.author }}" style="color: {{ author_data.color }};">
            {{ author_data.display_name }}
          </span>
        </div>
      </div>
      {% endfor %}
    {% else %}
      <div class="empty-message">No high priority questions at the moment.</div>
    {% endif %}
  </div>
</div>

<div class="dashboard-section">
  <h2>Recent Questions</h2>
  <div class="questions-list">
    {% assign recent_questions = site.questions | sort: "date" | reverse | limit: 5 %}
    {% if recent_questions.size > 0 %}
      {% for question in recent_questions %}
      {% assign author_data = site.data.authors[question.author] %}
      <div class="question-card status-{{ question.status }}">
        <div class="question-status">{{ question.status | replace: "-", " " | capitalize }}</div>
        <h3 class="question-title"><a href="{{ question.url | relative_url }}">{{ question.title }}</a></h3>
        <div class="question-meta">
          <span class="question-date">{{ question.date | date: site.learning_journal.date_format }}</span>
          <span class="question-author author-{{ question.author }}" style="color: {{ author_data.color }};">
            {{ author_data.display_name }}
          </span>
          {% if question.priority %}
          <span class="question-priority priority-{{ question.priority | downcase }}">{{ question.priority }}</span>
          {% endif %}
        </div>
      </div>
      {% endfor %}
    {% else %}
      <div class="empty-message">No questions have been asked yet.</div>
    {% endif %}
  </div>
</div>

<div class="dashboard-section">
  <h2>Questions by Author</h2>
  <div class="author-questions-container">
    {% for author in site.data.authors %}
    {% assign author_id = author[0] %}
    {% assign author_info = author[1] %}
    {% assign author_questions = site.questions | where: "author", author_id | sort: "date" | reverse | limit: 3 %}
    
    <div class="author-questions">
      <h3 style="color: {{ author_info.color }};">{{ author_info.display_name }}</h3>
      <div class="questions-list">
        {% if author_questions.size > 0 %}
          {% for question in author_questions %}
          <div class="question-card status-{{ question.status }}">
            <div class="question-status">{{ question.status | replace: "-", " " | capitalize }}</div>
            <h3 class="question-title"><a href="{{ question.url | relative_url }}">{{ question.title }}</a></h3>
            <div class="question-meta">
              <span class="question-date">{{ question.date | date: site.learning_journal.date_format }}</span>
              {% if question.priority %}
              <span class="question-priority priority-{{ question.priority | downcase }}">{{ question.priority }}</span>
              {% endif %}
            </div>
          </div>
          {% endfor %}
        {% else %}
          <div class="empty-message">No questions from this author yet.</div>
        {% endif %}
      </div>
    </div>
    {% endfor %}
  </div>
</div>

<style>
</style>

