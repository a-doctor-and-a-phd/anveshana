# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"Anveshana" is a personal learning journal built with Jekyll. Two authors (Mythreyi `mr`, Harshita `hr`) record things they've learned as **posts** and things they're curious about as **questions**. A question can later be linked to the post that answers it. The site deploys to GitHub Pages at `https://a-doctor-and-a-phd.github.io/anveshana` (note the `/anveshana` `baseurl` — always use `relative_url` / `relative_url` filters for links).

## Commands

```bash
bundle install              # install gems (first time)
bundle exec jekyll serve    # local dev server with live reload at http://localhost:4000/anveshana
bundle exec jekyll build    # build static site into _site/
```

There is no test suite, linter, or JS build step. `_site/` and `.jekyll-cache/` are generated and gitignored.

```bash
node .github/scripts/validate-content.mjs   # validate all posts/questions locally
```

## Architecture

### Content model: posts vs. questions
- **Posts** (`_posts/`): standard Jekyll posts (`layout: post`), filename `YYYY-MM-DD-title.md`.
- **Questions** (`_questions/`): a custom Jekyll **collection** (configured in `_config.yml`, `output: true`, permalink `/questions/:path/`, `layout: question`). Each question has `status` (`open` / `in-progress` / `answered`), `priority` (`high` / `medium` / `low`), `related_tags`, and optionally `related_post` / `answer_post`.

Layout defaults in `_config.yml` auto-assign `post`, `question`, and `page` layouts by type — new content usually doesn't need to declare `layout` explicitly, but existing files do anyway.

### Authors
`_data/authors.yml` is the single source of truth for authors, keyed by short id (`mr`, `hr`) with `display_name` and a `color`. Templates look up `site.data.authors[page.author]` and apply the color inline. CSS classes like `author-mr` / `priority-high` / `status-open` are also driven by these field values, with corresponding styles in `_sass/`. **Adding/changing an author means editing `authors.yml`** — author dropdowns in template-generator scripts iterate `site.data.authors` automatically.

### The question ⇄ post linking flow (the non-obvious core)
Questions and posts reference each other by **file path strings** (`page.path`):
- `_includes/question-related.html` — on a post page, finds questions whose `related_post` matches `page.path`.
- `_layouts/question.html` — finds the answer post via `site.posts | where: "question_ref", page.path | first`. Add `question_ref: _questions/YYYY-MM-DD-slug.md` to an answer post's front matter to wire the link. The `status: answered` / `answer_post:` fields still exist and drive the status badge and filters, but the link itself is now a back-reference lookup — no filename parsing.
- The "Add an Answer" clipboard template in `_layouts/question.html` already includes `question_ref: {{ page.path }}` in the template it generates.

### Client-side "no-backend CMS" pattern
This is a static site with no admin backend. Editing happens via **clipboard templates**: buttons across the site generate pre-filled front matter and copy it to the clipboard, and the user pastes it into a new/edited `.md` file and commits.
- `_layouts/home.html` — "+" buttons copy new-post and new-question templates.
- `_layouts/question.html` — "Update Status" copies the question with a new `status`/`answer_post`; "Add an Answer" copies a new answer-post template. These templates are embedded JS string literals containing Liquid interpolation — edit carefully.

When changing front-matter fields, update **both** the content files **and** the JS template strings that generate them, or new content will drift from the schema.

### Liquid-to-JS data bridge
Pages that need rich client-side behavior emit Jekyll data into inline JS at build time rather than fetching JSON:
- `calendar.md` — serializes `site.posts` into a `postsData` JS array (via `jsonify`), then renders an interactive calendar/timeline client-side.
- Search/filter on `home.html`, `questions.md`, `posts-by-author.md` works by show/hiding DOM cards client-side (`assets/js/theme.js` plus per-page inline scripts) — there is no search index.

### Mobile authoring via GitHub Issue Forms
Submitting a **New Post** or **New Question** issue on GitHub triggers `.github/workflows/create-content.yml`. It uses `stefanbuck/github-issue-parser` to read the form fields, then runs `.github/scripts/create-content.mjs` (zero npm deps) to write a correctly-named, schema-valid file and commit it to `main`. The bot guards on `author_association` (OWNER/MEMBER/COLLABORATOR only) and comments on the issue with the live URL before closing it.

**Adding an author** requires updating `.github/ISSUE_TEMPLATE/new-post.yml` and `new-question.yml` (the static dropdown `options` lists) in addition to `_data/authors.yml`. The create script reads `authors.yml` to map display name → id, so it stays the source of truth at runtime.

A second Action (`.github/workflows/validate-content.yml`) runs `validate-content.mjs` on any push/PR that touches `_posts/` or `_questions/`, checking filename format, required fields, and valid author/status/priority values.

### Layouts & styling
- Layout chain: every page → `_layouts/default.html` (HTML shell, includes `head`/`header`/`footer`, loads `theme.js`). `home`/`post`/`question`/`page` wrap `default`.
- `assets/css/main.scss` (has the empty front-matter `---` so Jekyll compiles it) imports `_sass/_base`, `_layout`, `_custom`, `_themes`.
- **Theming:** light/dark via the `data-theme` attribute on `<html>`; `theme.js` persists the choice in `localStorage`. All colors are CSS custom properties defined in `_sass/_themes.scss` — prefer adding/using variables there over hardcoding colors.
