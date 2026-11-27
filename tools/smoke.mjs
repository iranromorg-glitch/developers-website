// Headless smoke test for LINEUP (uses jsdom). Run: npm i jsdom && npm run smoke
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost:8080/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

const errors = [];
window.addEventListener('error', e => errors.push(e.message));
for (const f of ['js/data.js', 'js/app.js']) window.eval(fs.readFileSync(f, 'utf8'));

const $ = (s, c) => (c || window.document).querySelector(s);
const $$ = (s) => [...window.document.querySelectorAll(s)];
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; } else console.log('ok —', msg); };

assert($$('.model-slot').length === 6, 'six runway slots rendered');
assert($('#bb-look-name').textContent.length > 0, 'front look named');
assert($$('#in-look-list .piece-card').length >= 2, 'in-this-look cards rendered');
assert($$('#ep-grid .piece-card').length === 17, 'every-piece grid shows women pieces');
assert($$('#bb-progress .bb-seg').length === 6, 'six progress segments');

$('#next-look').click();
await new Promise(r => setTimeout(r, 650));
assert($('#bb-counter').textContent === '02 / 06', 'next-look advances the lineup');

const dot = $('#bb-colour-dots .colour-dot:nth-child(2)');
dot.click();
await new Promise(r => setTimeout(r, 450));
assert($('#bb-price').textContent.length > 0, 'colourway updates price');

$('#in-look-list [data-add]').click();
assert($('#bag-badge').textContent === '1', 'add-to-bag updates badge');

$('#bb-shop').click();
await new Promise(r => setTimeout(r, 120));
assert($('#product-view').classList.contains('open'), 'product page opens');
$$('#pi-pieces-list .size-pill').forEach((p, i) => { if (i % 4 === 0) p.click(); });
$('#pi-add').click();
assert($('#bag-badge').textContent !== '0', 'add-to-bag from product page works');

if (errors.length) { console.error('page errors:', errors); process.exitCode = 1; }
process.exit(process.exitCode || 0);
