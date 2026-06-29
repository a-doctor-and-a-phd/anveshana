#!/usr/bin/env node
// Validates all files in _posts/ and _questions/ for:
//   - filename format: YYYY-MM-DD-slug.md
//   - required front-matter fields
//   - valid author, status, priority values
//   - (warning) filename date matches front-matter date

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, '..', '..');

function parseAuthors() {
  const raw = readFileSync(join(repoRoot, '_data', 'authors.yml'), 'utf8');
  const ids = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/^([a-z]+):\s*$/);
    if (m) ids.push(m[1]);
  }
  return ids;
}

function parseFrontMatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

function collectFiles(dir) {
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({ dir, file: f, path: join(dir, f) }));
  } catch {
    return [];
  }
}

const validAuthors  = parseAuthors();
const validStatuses = ['open', 'in-progress', 'answered'];
const validPriority = ['high', 'medium', 'low'];
const filenameRe    = /^\d{4}-\d{2}-\d{2}-.+\.md$/;

const posts     = collectFiles(join(repoRoot, '_posts'));
const questions = collectFiles(join(repoRoot, '_questions'));

let errors = 0;
let warnings = 0;

function error(file, msg) {
  console.error(`ERROR  ${file}: ${msg}`);
  errors++;
}
function warn(file, msg) {
  console.warn(`WARN   ${file}: ${msg}`);
  warnings++;
}

function validate(file, path, type) {
  if (!filenameRe.test(file)) {
    error(file, `filename must match YYYY-MM-DD-slug.md`);
  }

  let content;
  try { content = readFileSync(path, 'utf8'); }
  catch { error(file, 'could not read file'); return; }

  const fm = parseFrontMatter(content);
  if (!fm) { error(file, 'missing or malformed front matter'); return; }

  for (const key of ['title', 'date', 'author']) {
    if (!fm[key]) error(file, `missing required field: ${key}`);
  }

  if (fm.author && !validAuthors.includes(fm.author)) {
    error(file, `unknown author "${fm.author}". Valid: ${validAuthors.join(', ')}`);
  }

  if (type === 'question') {
    if (fm.status && !validStatuses.includes(fm.status)) {
      error(file, `invalid status "${fm.status}". Valid: ${validStatuses.join(', ')}`);
    }
    if (fm.priority && !validPriority.includes(fm.priority)) {
      error(file, `invalid priority "${fm.priority}". Valid: ${validPriority.join(', ')}`);
    }
  }

  // Warn if filename date prefix doesn't match the date field
  const filenameDate = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (filenameDate && fm.date && !fm.date.startsWith(filenameDate)) {
    warn(file, `filename date "${filenameDate}" does not match front-matter date "${fm.date}"`);
  }
}

for (const { file, path } of posts)     validate(file, path, 'post');
for (const { file, path } of questions) validate(file, path, 'question');

const total = posts.length + questions.length;
console.log(`\nValidated ${total} file(s): ${errors} error(s), ${warnings} warning(s).`);

if (errors > 0) process.exit(1);
