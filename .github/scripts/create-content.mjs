#!/usr/bin/env node
// Creates a _posts/ or _questions/ file from parsed issue form fields.
// Env vars (set by the workflow):
//   CONTENT_TYPE  : "new-post" | "new-question"
//   FIELD_TITLE   : raw title string
//   FIELD_AUTHOR  : display name from dropdown ("Mythreyi" | "Harshita")
//   FIELD_TAGS    : comma-separated tag string
//   FIELD_BODY    : markdown body text
//   FIELD_PRIORITY: (questions only) "high" | "medium" | "low"
//   CONTENT_DATE  : optional override for today's date (YYYY-MM-DD)

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..');

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip accents
    .replace(/[^a-z0-9\s-]/g, '')      // strip non-alnum
    .trim()
    .replace(/[\s-]+/g, '-');
}

function parseAuthors() {
  const authorsPath = join(repoRoot, '_data', 'authors.yml');
  const raw = readFileSync(authorsPath, 'utf8');
  const map = {};
  // Minimal YAML parse: lines like "mr:" followed by "  display_name: Mythreyi"
  let currentId = null;
  for (const line of raw.split('\n')) {
    const topLevel = line.match(/^([a-z]+):\s*$/);
    if (topLevel) { currentId = topLevel[1]; continue; }
    const displayName = line.match(/^\s+display_name:\s*(.+)$/);
    if (displayName && currentId) {
      map[displayName[1].trim()] = currentId;
    }
  }
  return map;
}

function uniquePath(path) {
  if (!existsSync(path)) return path;
  const [base, ext] = path.match(/^(.+)(\.md)$/).slice(1);
  let i = 2;
  while (existsSync(`${base}-${i}${ext}`)) i++;
  return `${base}-${i}${ext}`;
}

const type    = process.env.CONTENT_TYPE;
const rawTitle = process.env.FIELD_TITLE?.trim();
const rawAuthor = process.env.FIELD_AUTHOR?.trim();
const rawTags  = process.env.FIELD_TAGS?.trim() ?? '';
const body     = process.env.FIELD_BODY?.trim() ?? '';
const priority = process.env.FIELD_PRIORITY?.trim() ?? 'medium';
const date     = process.env.CONTENT_DATE ?? new Date().toISOString().slice(0, 10);

if (!type || !rawTitle || !rawAuthor) {
  console.error('Missing required env vars: CONTENT_TYPE, FIELD_TITLE, FIELD_AUTHOR');
  process.exit(1);
}

const authors = parseAuthors();
const authorId = authors[rawAuthor];
if (!authorId) {
  console.error(`Unknown author display name: "${rawAuthor}". Known: ${Object.keys(authors).join(', ')}`);
  process.exit(1);
}

const slug  = slugify(rawTitle);
const tags  = rawTags.split(',').map(t => t.trim()).filter(Boolean);
const tagsYaml = `[${tags.join(', ')}]`;
const titleYaml = JSON.stringify(rawTitle); // double-quoted, safe for YAML

let filePath, frontMatter;

if (type === 'new-post') {
  filePath = join(repoRoot, '_posts', `${date}-${slug}.md`);
  frontMatter = [
    '---',
    `layout: post`,
    `title: ${titleYaml}`,
    `date: ${date}`,
    `author: ${authorId}`,
    `tags: ${tagsYaml}`,
    '---',
  ].join('\n');
} else if (type === 'new-question') {
  filePath = join(repoRoot, '_questions', `${date}-${slug}.md`);
  frontMatter = [
    '---',
    `layout: question`,
    `title: ${titleYaml}`,
    `date: ${date}`,
    `author: ${authorId}`,
    `status: open`,
    `priority: ${priority}`,
    `related_tags: ${tagsYaml}`,
    '---',
  ].join('\n');
} else {
  console.error(`Unknown CONTENT_TYPE: "${type}"`);
  process.exit(1);
}

const outPath = uniquePath(filePath);
writeFileSync(outPath, frontMatter + '\n\n' + body + '\n', 'utf8');

// Print the repo-relative path so the workflow can pick it up
const relPath = outPath.replace(repoRoot + '/', '');
console.log(relPath);
