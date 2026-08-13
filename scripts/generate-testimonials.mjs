// Gera o HTML dos depoimentos (light DOM do <review-slider>) a partir de
// data/reviews.js e injeta em index.html entre os marcadores REVIEWS:START
// e REVIEWS:END. Rodar de novo sempre que data/reviews.js mudar.
//
//   node scripts/generate-testimonials.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { REVIEWS } from '../data/reviews.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INDEX_PATH = join(ROOT, 'index.html');

const START = '<!-- REVIEWS:START (gerado por scripts/generate-testimonials.mjs a partir de data/reviews.js) -->';
const END = '<!-- REVIEWS:END -->';

const escapeHtml = (str) => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

function slideHtml(review) {
  return `          <blockquote class="testimonial-card">
            <span class="stars" aria-hidden="true">${'★'.repeat(Math.round(review.stars))}</span>
            <p>"${escapeHtml(review.comment)}"</p>
            <cite>${escapeHtml(review.name)} · ${escapeHtml(review.date)}</cite>
          </blockquote>`;
}

const block = REVIEWS.map(slideHtml).join('\n');
const html = readFileSync(INDEX_PATH, 'utf8');

const startIdx = html.indexOf(START);
const endIdx = html.indexOf(END);
if (startIdx === -1 || endIdx === -1) {
  throw new Error('Marcadores REVIEWS:START/REVIEWS:END não encontrados em index.html');
}

const before = html.slice(0, startIdx + START.length);
const after = html.slice(endIdx);
const updated = `${before}\n${block}\n          ${after}`;

writeFileSync(INDEX_PATH, updated, 'utf8');
console.log(`${REVIEWS.length} depoimentos injetados em index.html`);
