/*
 * Content loader.
 *
 * Every track lives in content/tracks as either `<slug>.js` or `<slug>/index.js` and exports:
 *   { slug, title, subtitle, description, category, roles, icon, color, order, topics: [...] }
 *
 * A topic is { slug, title, questions: [...] } and a question uses this short format:
 *   t: 'mcq' | 'qa' | 'scenario'   question type
 *   l: 1 | 2 | 3                   level (1 junior, 2 mid, 3 senior)
 *   q: string                      the question
 *   c: string (optional)           code snippet shown with the question
 *   o: string[]                    options (mcq only)
 *   a: number                      index of the correct option (mcq only)
 *   e: string                      answer / explanation (markdown)
 *   tags: string[] (optional)
 */
const fs = require('fs');
const path = require('path');

const TRACKS_DIR = path.join(__dirname, 'tracks');

function loadTracks() {
  return fs
    .readdirSync(TRACKS_DIR, { withFileTypes: true })
    .filter((d) => (d.isFile() && d.name.endsWith('.js')) || d.isDirectory())
    .map((d) => require(path.join(TRACKS_DIR, d.name)))
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

module.exports = { loadTracks };
