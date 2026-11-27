/* ════════════════════════════════════════════════════════════
   LINEUP — Fall '26 · interactive layer
   ════════════════════════════════════════════════════════════ */
'use strict';

const { LOOKS, LOOKS_BY_ID, lookTotal, formatPrice, sizeRangeFor } = window.LINEUP;

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FREE_SHIP = 150;
const SHIP_COST = 6;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ─────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────── */
const DEFAULT_ORDERS = {
  women: LOOKS.filter(l => l.gender === 'women').map(l => l.id),
  men: LOOKS.filter(l => l.gender === 'men').map(l => l.id),
};

function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

const state = {
  gender: 'women',
  orders: JSON.parse(JSON.stringify(DEFAULT_ORDERS)),
  colour: loadJSON('lineup.colour', {}),          // lookId -> colourway id
  bag: loadJSON('lineup.bag', []),                // line items
  saved: new Set(loadJSON('lineup.saved', [])),   // piece ids
  excluded: {},                                   // lookId -> Set(pieceId)
  sizes: loadJSON('lineup.sizes', {}),            // `${lookId}:${pieceId}` -> size
  bagOpen: false,
  searchOpen: false,
  productId: null,                                // look id on product page
  productView: 'still',                           // gallery selection: 'turn' | 'still' | productId
  animating: false,
  turnTimer: null,
  turnFrame: 0,
  autoplay: true,
  drag: null,
  resumeTimer: null,
};

const persist = () => {
  try {
    localStorage.setItem('lineup.colour', JSON.stringify(state.colour));
    localStorage.setItem('lineup.bag', JSON.stringify(state.bag));
    localStorage.setItem('lineup.saved', JSON.stringify([...state.saved]));
    localStorage.setItem('lineup.sizes', JSON.stringify(state.sizes));
  } catch { /* private mode */ }
};

const colourIdOf = look => state.colour[look.id] || look.colours[0].id;
const colourwayOf = look => look.colours.find(c => c.id === colourIdOf(look)) || look.colours[0];
const heroPiece = look => look.pieces[0];
const isHero = (look, piece) => heroPiece(look).id === piece.id;

const effectivePrice = (look, piece) => piece.price + (isHero(look, piece) ? (colourwayOf(look).delta || 0) : 0);
const pieceColourLabel = (look, piece) => (isHero(look, piece) ? colourwayOf(look).name : piece.colour);
const includedPieces = look => look.pieces.filter(p => !(state.excluded[look.id]?.has(p.id)));
const lookTotalLive = look => includedPieces(look).reduce((s, p) => s + effectivePrice(look, p), 0);

const frontId = () => state.orders[state.gender][0];
const lookNo = look => String(look.index).padStart(2, '0');

/* ─────────────────────────────────────────────
   SVG ICONS
   ───────────────────────────────────────────── */
const ICON = {
  heart: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.7-9.8-9.2C.9 7.7 3.4 4.5 6.8 4.5c2.1 0 3.9 1.1 5.2 3 1.3-1.9 3.1-3 5.2-3 3.4 0 5.9 3.2 4.6 6.3C19.5 15.3 12 20 12 20Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>',
};

/* ─────────────────────────────────────────────
   TOASTS
   ───────────────────────────────────────────── */
function toast(msg) {
  const host = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-tick">${ICON.tick}</span><span>${msg}</span>`;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 320); }, 2400);
  while (host.children.length > 3) host.firstElementChild.remove();
}

/* ─────────────────────────────────────────────
   STAGE — build, layout, move
   ───────────────────────────────────────────── */
const stage = $('#stage');
let slotEls = {};   // lookId -> element

function buildStage({ stagger = false } = {}) {
  Object.values(slotEls).forEach(el => el.remove());
  slotEls = {};
  const order = state.orders[state.gender];
  order.forEach((lookId, i) => {
    const look = LOOKS_BY_ID[lookId];
    const cw = colourwayOf(look);
    const el = document.createElement('button');
    el.className = `model-slot slot-${i}${i === 0 ? ' is-front' : ''}${stagger ? ' pre-enter' : ''}`;
    el.dataset.look = lookId;
    el.style.setProperty('--d', `${i * 80}ms`);
    el.setAttribute('aria-label', i === 0 ? `Open ${look.name}` : `Bring ${look.name} to the front`);
    el.innerHTML = `
      <span class="model-shadow" aria-hidden="true"></span>
      <span class="float-wrap" style="filter:${cw.filter || 'none'}"><img class="model-cut" src="${look.model.w}" alt="${look.name} — model wearing the look" draggable="false" data-colour="${cw.id}"></span>
      <span class="look-tag" aria-hidden="true">${look.name}</span>`;
    el.addEventListener('click', () => onSlotClick(lookId));
    stage.appendChild(el);
    slotEls[lookId] = el;
  });
  if (stagger) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      Object.values(slotEls).forEach(el => el.classList.remove('pre-enter'));
    }));
  }
}

/* class hook for stagger-in */
const preEnterCSS = document.createElement('style');
preEnterCSS.textContent = '.model-slot.pre-enter{opacity:0 !important;transform:translateX(calc(-50% + var(--exit,0px))) translateY(30px) scale(var(--s,1)) !important;transition-delay:var(--d,0ms);}';
document.head.appendChild(preEnterCSS);

function layoutSlots() {
  const order = state.orders[state.gender];
  order.forEach((lookId, i) => {
    const el = slotEls[lookId];
    if (!el) return;
    const keep = ['pre-enter', 'soft-in'].filter(c => el.classList.contains(c));
    el.className = `model-slot slot-${i}${i === 0 ? ' is-front' : ''}${keep.length ? ' ' + keep.join(' ') : ''}`;
    el.style.zIndex = 60 - i * 5;
    el.setAttribute('aria-label', i === 0 ? `Open ${LOOKS_BY_ID[lookId].name}` : `Bring ${LOOKS_BY_ID[lookId].name} to the front`);
    const img = $('.model-cut', el);
    const look2 = LOOKS_BY_ID[lookId];
    const cw = colourwayOf(look2);
    if (img.dataset.colour !== cw.id) {
      img.dataset.colour = cw.id;
      img.src = look2.model.w;
      $('.float-wrap', el).style.filter = cw.filter || 'none';
    }
  });
}

function onSlotClick(lookId) {
  if (state.animating) return;
  const order = state.orders[state.gender];
  const at = order.indexOf(lookId);
  if (at === 0) { openProduct(lookId); return; }
  state.orders[state.gender] = [lookId, ...order.slice(0, at), ...order.slice(at + 1)];
  layoutSlots();
  syncAll();
}

function nextLook() {
  if (state.animating) return;
  state.animating = true;
  const order = state.orders[state.gender];
  const leavingId = order[0];
  const el = slotEls[leavingId];
  el?.classList.add('exit-right');
  setTimeout(() => {
    state.orders[state.gender] = [...order.slice(1), order[0]];
    if (el) {
      el.style.transition = 'none';
      layoutSlots();
      el.getBoundingClientRect();      // reflow — jump to back slot silently
      el.style.transition = '';
      el.classList.remove('exit-right');
      el.classList.add('soft-in');
      setTimeout(() => el.classList.remove('soft-in'), 750);
    } else {
      layoutSlots();
    }
    syncAll();
    state.animating = false;
  }, REDUCED ? 30 : 460);
}

function prevLook() {
  if (state.animating) return;
  state.animating = true;
  const order = state.orders[state.gender];
  const backId = order[order.length - 1];
  const el = slotEls[backId];
  el?.classList.add('exit-fade');
  setTimeout(() => {
    state.orders[state.gender] = [backId, ...order.slice(0, -1)];
    if (el) {
      el.style.transition = 'none';
      layoutSlots();
      el.classList.remove('exit-fade');
      el.classList.add('enter-right');  // held off-right & invisible
      el.getBoundingClientRect();
      el.style.transition = '';
      el.getBoundingClientRect();
      requestAnimationFrame(() => el.classList.remove('enter-right'));
    } else {
      layoutSlots();
    }
    syncAll();
    state.animating = false;
  }, REDUCED ? 30 : 380);
}

/* extra fade-in hook */
const softInCSS = document.createElement('style');
softInCSS.textContent = '.model-slot.soft-in{animation:softIn .7s var(--ease) both}@keyframes softIn{from{opacity:0}}';
document.head.appendChild(softInCSS);

/* swipe + keys */
(function bindGestures() {
  let startX = null;
  stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 42) (dx < 0 ? nextLook : prevLook)();
    startX = null;
  }, { passive: true });
  stage.addEventListener('pointerdown', e => { startX = e.clientX; }, { passive: true });
  stage.addEventListener('pointerup', e => {
    if (startX == null || Math.abs(e.clientX - startX) < 48) { startX = null; return; }
    (e.clientX - startX < 0 ? nextLook : prevLook)();
    startX = null;
  }, { passive: true });
  window.addEventListener('keydown', e => {
    if ($('#product-view').classList.contains('open')) return;
    if (state.searchOpen || state.bagOpen) return;
    if (e.key === 'ArrowRight') nextLook();
    else if (e.key === 'ArrowLeft') prevLook();
  });
})();

/* ─────────────────────────────────────────────
   SYNC EVERYTHING (bottom bar, panel, grid, badge …)
   ───────────────────────────────────────────── */
function syncAll() {
  const look = LOOKS_BY_ID[frontId()];
  const cw = colourwayOf(look);

  /* bottom bar */
  $('#bb-look-name').textContent = look.name;
  $('#bb-counter').textContent = `${lookNo(look)} / 06`;
  $('#bb-price').textContent = formatPrice(lookTotal(look, cw.id));
  $('#bb-colour-name').textContent = cw.name;
  $('#bb-360').style.visibility = look.turntable ? 'visible' : 'hidden';
  $$('#bb-progress .bb-seg').forEach((seg, i) => seg.classList.toggle('active', i === look.index - 1));
  renderColourDots($('#bb-colour-dots'), look, cw, (id) => setColour(look.id, id));

  /* in this look panel */
  $('#in-look-title').textContent = look.name;
  $('#in-look-count').textContent = `${look.pieces.length} pieces`;
  renderInLook(look);

  /* every piece grid + header copy */
  $('#lineup-gender-word').textContent = state.gender === 'women' ? 'Women' : 'Men';
  $('#ep-gender').textContent = state.gender;
  const genderPieces = LOOKS.filter(l => l.gender === state.gender).flatMap(l => l.pieces.map(p => ({ look: l, piece: p })));
  $('#ep-count').textContent = genderPieces.length;
  renderGrid(genderPieces);

  /* if the product page is open for a look of this gender, refresh it too */
  if (state.productId && $('#product-view').classList.contains('open')) {
    const pl = LOOKS_BY_ID[state.productId];
    if (pl) updateProductTotals(pl);
  }
}

function renderColourDots(host, look, activeCw, onPick, { large = false } = {}) {
  host.innerHTML = look.colours.map(c => `
    <button class="colour-dot${c.id === activeCw.id ? ' active' : ''}" data-colour="${c.id}" data-look="${look.id}"
      style="background:${c.hex}" aria-label="Colour ${c.name}" aria-pressed="${c.id === activeCw.id}"></button>`).join('');
}

function renderInLook(look) {
  const list = $('#in-look-list');
  const cw = colourwayOf(look);
  list.innerHTML = look.pieces.map((p, i) => pieceCardHTML(look, p, i, { context: 'panel' })).join('');
  $$('.heart-btn', list).forEach(b => b.classList.toggle('saved', state.saved.has(b.dataset.save)));
}

function pieceCardHTML(look, piece, i, { context } = {}) {
  const cw = colourwayOf(look);
  const saved = state.saved.has(piece.id);
  const price = effectivePrice(look, piece);
  return `
  <article class="piece-card" style="--i:${i}" data-card="${piece.id}">
    <div class="photo-wrap">
      <button class="piece-photo" data-open="${look.id}" aria-label="Open ${look.name} — ${piece.name}">
        <img src="${piece.img}" alt="${piece.name} — ${pieceColourLabel(look, piece)}" loading="lazy" onerror="this.onerror=null;this.style.visibility='hidden'">
      </button>
      <button class="heart-btn${saved ? ' saved' : ''}" data-save="${piece.id}" aria-pressed="${saved}" aria-label="Save ${piece.name} to wishlist">${ICON.heart}</button>
    </div>
    <div class="piece-info">
      <p class="piece-name">${piece.name}</p>
      <p class="piece-colour">${pieceColourLabel(look, piece)} · ${lookNo(look)}</p>
      <p class="piece-price">${formatPrice(price)}</p>
    </div>
    <button class="add-mini" data-add="${piece.id}" data-look="${look.id}" aria-label="Add ${piece.name} to bag, size M">${ICON.plus}</button>
  </article>`;
}

function renderGrid(entries) {
  $('#ep-grid').innerHTML = entries.map(({ look, piece }, i) => pieceCardHTML(look, piece, i, { context: 'grid' })).join('');
  $$('#ep-grid .heart-btn').forEach(b => b.classList.toggle('saved', state.saved.has(b.dataset.save)));
}

function setColour(lookId, colourId, { instant = false } = {}) {
  const look = LOOKS_BY_ID[lookId];
  if (colourIdOf(look) === colourId) { syncColourUI(look); return; }
  state.colour[lookId] = colourId;
  persist();

  /* hero image dissolve (front slot only, instant elsewhere) */
  if (state.orders[state.gender][0] === lookId && slotEls[lookId]) {
    const wrap = $('.float-wrap', slotEls[lookId]);
    const img = $('.model-cut', slotEls[lookId]);
    const cw = colourwayOf(look);
    const apply = () => {
      img.dataset.colour = colourId;
      wrap.style.filter = cw.filter || 'none';
      requestAnimationFrame(() => wrap.classList.remove('dissolving'));
    };
    wrap.classList.add('dissolving');
    setTimeout(apply, REDUCED ? 0 : 320);
  } else if (slotEls[lookId]) {
    const img = $('.model-cut', slotEls[lookId]);
    img.dataset.colour = colourId;
    img.src = look.model.w;
    $('.float-wrap', slotEls[lookId]).style.filter = colourwayOf(look).filter || 'none';
  }

  syncColourUI(look);
}

function syncColourUI(look) {
  const cw = colourwayOf(look);
  /* rebuild everything that carries price/colour */
  renderColourDots($('#bb-colour-dots'), LOOKS_BY_ID[frontId()] || look, colourwayOf(LOOKS_BY_ID[frontId()] || look), null);
  $('#bb-colour-name').textContent = colourwayOf(LOOKS_BY_ID[frontId()] || look).name;
  $('#bb-price').textContent = formatPrice(lookTotal(LOOKS_BY_ID[frontId()] || look, colourwayOf(LOOKS_BY_ID[frontId()] || look).id));
  renderInLook(LOOKS_BY_ID[frontId()] || look);
  const genderPieces = LOOKS.filter(l => l.gender === state.gender).flatMap(l => l.pieces.map(p => ({ look: l, piece: p })));
  renderGrid(genderPieces);
  /* product page if open */
  if (state.productId && $('#product-view').classList.contains('open')) {
    refreshProductColour(LOOKS_BY_ID[state.productId]);
  }
}

/* ─────────────────────────────────────────────
   BAG
   ───────────────────────────────────────────── */
function bagQty() { return state.bag.reduce((s, l) => s + l.qty, 0); }
function bagSubtotal() { return state.bag.reduce((s, l) => s + l.price * l.qty, 0); }

function addToBag(look, piece, size, qty = 1) {
  const cw = colourwayOf(look);
  const key = `${piece.id}|${cw.id}|${size}`;
  const existing = state.bag.find(l => l.key === key);
  if (existing) existing.qty += qty;
  else state.bag.push({
    key, pieceId: piece.id, lookId: look.id, size, qty,
    name: piece.name, price: effectivePrice(look, piece),
    colour: pieceColourLabel(look, piece), colourId: cw.id,
    img: piece.img,
  });
  persist(); renderBag(true);
  toast(`${piece.name} · size ${size} added to bag`);
}

function renderBag(pop = false) {
  const qty = bagQty(), subtotal = bagSubtotal();
  const badge = $('#bag-badge');
  badge.textContent = qty;
  badge.classList.toggle('show', qty > 0);
  if (pop) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
  $('#bag-count-label').textContent = `${qty} item${qty === 1 ? '' : 's'}`;

  /* free shipping progress */
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  $('#ship-line').innerHTML = remaining > 0
    ? `You're <strong>${formatPrice(remaining)}</strong> away from free shipping`
    : `<strong>Free shipping unlocked</strong> — nicely done`;
  $('#ship-fill').style.width = `${Math.min(100, (subtotal / FREE_SHIP) * 100)}%`;

  $('#bag-empty').style.display = state.bag.length ? 'none' : 'block';
  $('#bag-foot').style.display = state.bag.length ? 'block' : 'none';
  $('#bag-items').innerHTML = state.bag.map(l => `
    <div class="bag-item" data-key="${l.key}">
      <img class="bag-item-img" src="${l.img}" alt="${l.name}" onerror="this.onerror=null;this.src='${LOOKS_BY_ID[l.lookId].model.w}'">
      <div>
        <p class="bag-item-name">${l.name}</p>
        <p class="bag-item-meta">${l.colour} · Size ${l.size}</p>
        <div class="qty-stepper" role="group" aria-label="Quantity">
          <button data-qty="-1" aria-label="Decrease quantity">−</button>
          <span>${l.qty}</span>
          <button data-qty="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="bag-item-right">
        <span class="bag-item-price">${formatPrice(l.price * l.qty)}</span>
        <button class="bag-remove" data-remove="${l.key}">Remove</button>
      </div>
    </div>`).join('');
  $('#bag-subtotal').textContent = formatPrice(subtotal);
}

function openBag() {
  state.bagOpen = true;
  const drawer = $('#bag-drawer'), bd = $('#backdrop');
  drawer.hidden = false; bd.hidden = false;
  void drawer.offsetWidth;
  drawer.classList.add('open'); bd.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeBag() {
  state.bagOpen = false;
  $('#bag-drawer').classList.remove('open');
  $('#backdrop').classList.remove('show');
  document.body.style.overflow = '';
  setTimeout(() => { $('#bag-drawer').hidden = true; $('#backdrop').hidden = true; }, 560);
}

/* ─────────────────────────────────────────────
   GLOBAL CLICK DELEGATION
   ───────────────────────────────────────────── */
document.addEventListener('click', e => {
  const t = e.target;

  const addBtn = t.closest('[data-add]');
  if (addBtn) {
    const pieceId = addBtn.dataset.add;
    const look = LOOKS.find(l => l.pieces.some(p => p.id === pieceId));
    const piece = look.pieces.find(p => p.id === pieceId);
    const range = sizeRangeFor(piece, look.gender);
    const size = range.includes('M') ? 'M' : range[Math.floor(range.length / 2)];
    addToBag(look, piece, size, 1);
    return;
  }
  const saveBtn = t.closest('[data-save]');
  if (saveBtn) {
    const id = saveBtn.dataset.save;
    state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
    persist();
    $$(`[data-save="${id}"]`).forEach(b => { b.classList.toggle('saved', state.saved.has(id)); b.setAttribute('aria-pressed', state.saved.has(id)); });
    toast(state.saved.has(id) ? 'Saved to wishlist' : 'Removed from wishlist');
    return;
  }
  const openBtn = t.closest('[data-open]');
  if (openBtn) { if (t.closest('#search-results')) return; openProduct(openBtn.dataset.open); return; }
  const dot = t.closest('[data-colour]');
  if (dot) { setColour(dot.dataset.look, dot.dataset.colour); return; }
});

/* ─────────────────────────────────────────────
   GENDER TABS
   ───────────────────────────────────────────── */
function setGender(gender, { animate = true } = {}) {
  if (state.gender === gender && Object.keys(slotEls).length) return;
  const apply = () => {
    state.gender = gender;
    $$('.gender-tab').forEach(tab => {
      const active = tab.dataset.gender === gender;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active);
    });
    buildStage({ stagger: animate });
    layoutSlots();
    syncAll();
  };
  if (!animate || REDUCED) { apply(); return; }
  stage.classList.add('switching');
  setTimeout(() => { stage.classList.remove('switching'); apply(); }, 340);
}

$('#tab-women').addEventListener('click', () => setGender('women'));
$('#tab-men').addEventListener('click', () => setGender('men'));
$('#wordmark').addEventListener('click', () => { location.hash = ''; });

$('#prev-look').addEventListener('click', prevLook);
$('#next-look').addEventListener('click', nextLook);
$('#bb-shop').addEventListener('click', () => openProduct(frontId()));
$('#bb-360').addEventListener('click', () => {
  if (REDUCED) return;
  stage.classList.remove('turning'); void stage.offsetWidth; stage.classList.add('turning');
  setTimeout(() => stage.classList.remove('turning'), 4400);
});

/* ═════════════════════════════════════════════
   PRODUCT PAGE — gallery, 360, info, reserve
   ═════════════════════════════════════════════ */
const productView = $('#product-view');
const galleryHero = $('#gallery-hero');
const galleryStage = $('#gallery-stage');
const galleryCaption = $('#gallery-caption');

const hasTurnFrames = look => !!look.turntable;

function openProduct(lookId) {
  if (location.hash.slice(1) !== `look-${lookId}`) location.hash = `look-${lookId}`;
  showProduct(lookId);
}

function route() {
  const m = location.hash.match(/^#look-([a-z0-9]+)/i);
  if (m && LOOKS_BY_ID[m[1]]) {
    const id = LOOKS_BY_ID[m[1]].id;
    if (state.productId === id && productView.classList.contains('open')) return;
    showProduct(id);
  } else {
    hideProduct();
  }
}

function showProduct(lookId) {
  const look = LOOKS_BY_ID[lookId];
  state.productId = lookId;
  state.productView = look.turntable ? 'turn' : 'still';
  if (!state.excluded[look.id]) state.excluded[look.id] = new Set();

  populateProductInfo(look);
  buildGallery(look);

  productView.hidden = false;
  requestAnimationFrame(() => productView.classList.add('open'));
  document.body.style.overflow = 'hidden';
  $('#product-scroll').scrollTop = 0;
}

function hideProduct() {
  if (!state.productId && productView.hidden) return;
  state.productId = null;
  stopTurnLoop();
  productView.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { productView.hidden = true; }, 400);
}

/* ---------- info column ---------- */
function populateProductInfo(look) {
  const cw = colourwayOf(look);
  $('#pi-kicker').textContent = `Look ${lookNo(look)} · ${look.gender === 'women' ? 'Women' : 'Men'}`;
  $('#pi-name').textContent = look.name;
  $('#pi-desc').textContent = look.desc;
  $('#crumb-gender').textContent = look.gender === 'women' ? 'Women' : 'Men';
  $('#crumb-look').textContent = `Look ${lookNo(look)}`;
  $('#pi-colour-name').textContent = cw.name;
  $('#mab-name').textContent = look.name;
  renderColourDots($('#pi-colour-dots'), look, cw, null, { large: true });
  buildPiecesList(look);
  buildAccordions(look);
  buildAlsoRail(look);
  updateProductTotals(look);
  /* reset reserve */
  $('#reserve-panel').classList.remove('open');
  $('#reserve-toggle').setAttribute('aria-expanded', 'false');
  $('#reserve-form').hidden = false;
  $('#reserve-success').hidden = true;
}

function buildPiecesList(look) {
  const gender = look.gender;
  $('#pi-pieces-list').innerHTML = look.pieces.map(p => {
    const sizeKey = `${look.id}:${p.id}`;
    const selected = state.sizes[sizeKey];
    const excluded = state.excluded[look.id]?.has(p.id);
    const range = sizeRangeFor(p, gender);
    return `
    <div class="pi-piece${excluded ? ' excluded' : ''}" data-piece-row="${p.id}">
      <button class="check-btn" data-include="${p.id}" aria-pressed="${!excluded}" aria-label="Include ${p.name} in the bag">${ICON.check}</button>
      <div class="pi-thumb"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${colourwayOf(look).img}'"></div>
      <div class="pi-piece-body">
        <div class="pi-piece-top"><span class="pi-piece-name">${p.name}</span><span class="pi-piece-price">${formatPrice(effectivePrice(look, p))}</span></div>
        <p class="pi-piece-meta">${pieceColourLabel(look, p)} · Look ${lookNo(look)}</p>
        <div class="size-row" role="group" aria-label="Size">
          ${range.map(s => `<button class="size-pill${selected === s ? ' selected' : ''}" data-size="${s}" data-piece="${p.id}" aria-pressed="${selected === s}">${s}</button>`).join('')}
        </div>
        <p class="choose-size-msg">Choose a size</p>
      </div>
    </div>`;
  }).join('');
  const excludedCount = state.excluded[look.id]?.size || 0;
  $('#toggle-all-pieces').textContent = excludedCount ? 'Include all' : 'Exclude all';
}

function updateProductTotals(look) {
  const inc = includedPieces(look);
  const total = lookTotalLive(look);
  $('#pi-total').textContent = formatPrice(total);
  $('#pi-pieces').textContent = `${inc.length} of ${look.pieces.length} pieces`;
  $('#pi-add-price').textContent = formatPrice(total);
  $('#mab-price').textContent = formatPrice(total);
  $('#pi-add').style.opacity = inc.length ? 1 : .45;
  $('#toggle-all-pieces').textContent = (state.excluded[look.id]?.size || 0) ? 'Include all' : 'Exclude all';
  /* update per-piece price labels (colourway delta on hero piece) */
  $$('.pi-piece', $('#pi-pieces-list')).forEach(row => {
    const p = look.pieces.find(pp => pp.id === row.dataset.pieceRow);
    if (p) $('.pi-piece-price', row).textContent = formatPrice(effectivePrice(look, p));
    const meta = $('.pi-piece-meta', row);
    if (meta) meta.textContent = `${pieceColourLabel(look, p)} · Look ${lookNo(look)}`;
  });
}

function buildAccordions(look) {
  const items = [
    ['Fabric and care', look.fabric],
    ['Size and fit', look.fit],
    ['Shipping and returns', 'Orders leave our SoHo atelier within 48 hours. Free US shipping over $150, flat $6 below that. Free 30-day returns — print the prepaid label in your box and send it back whenever. Exchanges ship free too.'],
  ];
  $('#accordions').innerHTML = items.map(([title, body], i) => `
    <div class="accordion${i === 0 ? ' open' : ''}">
      <button class="acc-btn" aria-expanded="${i === 0}"><span>${title}</span>${ICON.chev}</button>
      <div class="acc-panel"><div class="acc-panel-inner"><p>${body}</p></div></div>
    </div>`).join('');
  $$('#accordions .acc-btn').forEach(btn => btn.addEventListener('click', () => {
    const acc = btn.closest('.accordion');
    acc.classList.toggle('open');
    btn.setAttribute('aria-expanded', acc.classList.contains('open'));
  }));
}

function buildAlsoRail(look) {
  const others = LOOKS.filter(l => l.gender === look.gender && l.id !== look.id);
  $('#also-rail').innerHTML = others.map(l => {
    const cw = colourwayOf(l);
    const filt = cw.filter && cw.filter !== 'none' ? ` style="filter:${cw.filter}"` : '';
    return `
    <button class="also-card" data-open="${l.id}" aria-label="Open ${l.name}">
      <span class="also-tile"><img src="${l.model.w}" alt="${l.name}" loading="lazy"${filt}></span>
      <span class="also-name">${l.name}</span>
      <span class="also-price">${formatPrice(lookTotal(l, cw.id))}</span>
      <span class="also-dots">${l.colours.map(c => `<span class="also-dot" style="background:${c.hex}"></span>`).join('')}</span>
    </button>`;
  }).join('');
}

/* ---------- gallery ---------- */
function buildGallery(look) {
  const cw = colourwayOf(look);
  const modelSrc = look.model.w;
  const modelFilter = cw.filter || 'none';
  const turnOk = hasTurnFrames(look);
  if (state.productView === 'turn' && !turnOk) state.productView = 'still';

  const items = [];
  if (turnOk) items.push({ id: 'turn', label: '360° view', img: modelSrc, contain: true, badge: true, filter: modelFilter });
  items.push({ id: 'still', label: 'Model', img: modelSrc, contain: true, filter: modelFilter });
  look.pieces.forEach(p => items.push({ id: p.id, label: p.name, img: p.img, contain: false }));

  /* thumbnails */
  $('#gallery-thumbs').innerHTML = items.map(it => `
    <button class="g-thumb${it.contain ? ' contain' : ''}${state.productView === it.id ? ' active' : ''}" role="tab" aria-selected="${state.productView === it.id}" data-view="${it.id}" aria-label="${it.label}">
      <img src="${it.img}" alt="${it.label}" loading="lazy" style="${it.filter && it.filter !== 'none' ? `filter:${it.filter}` : ''}">
      ${it.badge ? '<span class="badge-360">360°</span>' : ''}
    </button>`).join('');

  /* hero views */
  const shadow = '<span class="model-shadow" aria-hidden="true"></span>';
  const views = [];
  if (turnOk) views.push(`
    <div class="g-view turn-view${state.productView === 'turn' ? ' active' : ''}" data-view-id="turn">
      <div class="turn-rotor" id="turn-rotor">
        <img class="turn-img" src="${modelSrc}" alt="${look.name} — 360 turntable" draggable="false" style="${modelFilter !== 'none' ? `filter:${modelFilter}` : ''}" data-base-filter="${modelFilter === 'none' ? '' : modelFilter}">
      </div>
      ${shadow}
    </div>`);
  views.push(`
    <div class="g-view float-view${state.productView === 'still' ? ' active' : ''}" data-view-id="still">
      <img class="still-img" src="${modelSrc}" alt="${look.name} — model" draggable="false" style="${modelFilter !== 'none' ? `filter:${modelFilter}` : ''}">
      ${shadow}
    </div>`);
  look.pieces.forEach(p => views.push(`
    <div class="g-view fill${state.productView === p.id ? ' active' : ''}" data-view-id="${p.id}">
      <img src="${p.img}" alt="${p.name} — product illustration" loading="lazy">
    </div>`));
  galleryStage.innerHTML = views.join('');

  galleryHero.dataset.mode = state.productView;
  galleryCaption.textContent = captionFor(look, state.productView);
  $('#drag-hint').classList.remove('show');
  $('#turn-toggle-label').textContent = state.autoplay ? 'Pause' : 'Play';
  $('#turn-toggle').classList.toggle('paused', !state.autoplay);
  $('#turn-toggle').setAttribute('aria-pressed', String(state.autoplay));

  startTurnIfNeeded(look);
}

function captionFor(look, view) {
  if (view === 'turn') return `Look ${lookNo(look)} — Full 360° turntable`;
  if (view === 'still') return `Look ${lookNo(look)} — ${look.name}`;
  const p = look.pieces.find(pp => pp.id === view);
  return p ? p.name : look.name;
}

function setGalleryView(look, viewId) {
  state.productView = viewId;
  $$('.g-thumb', $('#gallery-thumbs')).forEach(th => {
    const on = th.dataset.view === viewId;
    th.classList.toggle('active', on);
    th.setAttribute('aria-selected', on);
  });
  $$('.g-view', galleryStage).forEach(v => v.classList.toggle('active', v.dataset.viewId === viewId));
  galleryHero.dataset.mode = viewId;
  galleryCaption.textContent = captionFor(look, viewId);
  $('#drag-hint').classList.remove('show');
  startTurnIfNeeded(look);
}

/* ---------- 360° turntable (live CSS flipbook) ---------- */
let turnAngle = 0;
let lastTurnTs = 0;
const TURN_SPEED = 360 / 7500;   // deg per ms — one revolution ≈ 7.5s

function stopTurnLoop() {
  if (state.turnTimer) { cancelAnimationFrame(state.turnTimer); state.turnTimer = null; }
}
function renderTurnFrame() {
  const rotor = $('#turn-rotor');
  if (!rotor) return;
  rotor.style.transform = `rotateY(${turnAngle}deg)`;
  /* pseudo lighting through the turn */
  const shadeV = 1 - 0.24 * Math.abs(Math.sin((turnAngle * Math.PI) / 180));
  const img = $('.turn-img', rotor);
  const base = img.dataset.baseFilter || '';
  img.style.filter = `${base} brightness(${shadeV.toFixed(3)})`.trim();
}
function turnTick(ts) {
  if (!state.turnTimer) return;
  const dt = lastTurnTs ? ts - lastTurnTs : 16;
  lastTurnTs = ts;
  turnAngle = (turnAngle + dt * TURN_SPEED) % 360;
  renderTurnFrame();
  state.turnTimer = requestAnimationFrame(turnTick);
}
function startTurnIfNeeded(look) {
  stopTurnLoop();
  const active = state.productView === 'turn' && hasTurnFrames(look);
  if (!active) { updateDragHint(false); return; }
  if (state.autoplay && !REDUCED) {
    lastTurnTs = 0;
    state.turnTimer = requestAnimationFrame(turnTick);
  } else {
    renderTurnFrame();
  }
  updateDragHint(true);
}
function updateDragHint(active) {
  const hint = $('#drag-hint');
  hint.classList.remove('show');
  if (!active || state.drag || state.hintedDrag) return;
  clearTimeout(state.hintTimer);
  state.hintTimer = setTimeout(() => { if (state.productView === 'turn' && !state.drag) hint.classList.add('show'); }, 900);
}

$('#turn-toggle').addEventListener('click', () => {
  state.autoplay = !state.autoplay;
  $('#turn-toggle-label').textContent = state.autoplay ? 'Pause' : 'Play';
  $('#turn-toggle').classList.toggle('paused', !state.autoplay);
  $('#turn-toggle').setAttribute('aria-pressed', String(state.autoplay));
  if (state.productId) startTurnIfNeeded(LOOKS_BY_ID[state.productId]);
});

/* drag / swipe to spin */
galleryStage.addEventListener('pointerdown', e => {
  if (state.productView !== 'turn' || !state.productId) return;
  const look = LOOKS_BY_ID[state.productId];
  if (!hasTurnFrames(look)) return;
  state.drag = { startX: e.clientX, startAngle: turnAngle };
  state.hintedDrag = true;
  $('#drag-hint').classList.remove('show');
  stopTurnLoop();
  clearTimeout(state.resumeTimer);
  try { galleryStage.setPointerCapture(e.pointerId); } catch {}
});
galleryStage.addEventListener('pointermove', e => {
  if (!state.drag) return;
  turnAngle = (state.drag.startAngle + (e.clientX - state.drag.startX) * 0.45) % 360;
  if (turnAngle < 0) turnAngle += 360;
  renderTurnFrame();
});
function endDrag() {
  if (!state.drag) return;
  state.drag = null;
  state.resumeTimer = setTimeout(() => {
    if (state.productId) startTurnIfNeeded(LOOKS_BY_ID[state.productId]);
  }, 2500);
}
galleryStage.addEventListener('pointerup', endDrag);
galleryStage.addEventListener('pointercancel', endDrag);

$('#gallery-thumbs').addEventListener('click', e => {
  const th = e.target.closest('[data-view]');
  if (!th || !state.productId) return;
  setGalleryView(LOOKS_BY_ID[state.productId], th.dataset.view);
});

/* ---------- colour refresh on product page ---------- */
function refreshProductColour(look) {
  const keepStillOk = state.productView;
  populateProductInfo(look);
  const turnOk = hasTurnFrames(look);
  const viewStillValid = turnOk || keepStillOk !== 'turn';
  buildGallery(look);
  if (!viewStillValid) setGalleryView(look, 'still');
  else setGalleryView(look, state.productView);
}

/* ---------- pieces include/exclude, sizes ---------- */
document.addEventListener('click', e => {
  const sizeBtn = e.target.closest('[data-size]');
  if (sizeBtn && state.productId) {
    const row = sizeBtn.closest('.pi-piece');
    state.sizes[`${state.productId}:${sizeBtn.dataset.piece}`] = sizeBtn.dataset.size;
    persist();
    $$('.size-pill', row).forEach(b => { const on = b === sizeBtn; b.classList.toggle('selected', on); b.setAttribute('aria-pressed', on); });
    row.classList.remove('size-missing');
    return;
  }
  const incBtn = e.target.closest('[data-include]');
  if (incBtn && state.productId) {
    const look = LOOKS_BY_ID[state.productId];
    const set = (state.excluded[look.id] ||= new Set());
    set.has(incBtn.dataset.include) ? set.delete(incBtn.dataset.include) : set.add(incBtn.dataset.include);
    const row = incBtn.closest('.pi-piece');
    row.classList.toggle('excluded', set.has(incBtn.dataset.include));
    incBtn.setAttribute('aria-pressed', String(!set.has(incBtn.dataset.include)));
    updateProductTotals(look);
    return;
  }
});

$('#toggle-all-pieces').addEventListener('click', () => {
  if (!state.productId) return;
  const look = LOOKS_BY_ID[state.productId];
  const set = (state.excluded[look.id] ||= new Set());
  if (set.size) set.clear(); else look.pieces.forEach(p => set.add(p.id));
  buildPiecesList(look);
  updateProductTotals(look);
});

function attemptAddAll() {
  if (!state.productId) return;
  const look = LOOKS_BY_ID[state.productId];
  const inc = includedPieces(look);
  if (!inc.length) { toast('Select at least one piece'); return; }
  const missing = inc.filter(p => !state.sizes[`${look.id}:${p.id}`]);
  if (missing.length) {
    missing.forEach(p => {
      const row = $(`.pi-piece[data-piece-row="${p.id}"]`);
      if (row) { row.classList.remove('size-missing'); void row.offsetWidth; row.classList.add('size-missing'); }
    });
    const first = $(`.pi-piece[data-piece-row="${missing[0].id}"]`);
    first?.scrollIntoView?.({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => $$('.pi-piece.size-missing').forEach(r => r.classList.remove('size-missing')), 2600);
    toast('Choose a size');
    return;
  }
  inc.forEach(p => addToBag(look, p, state.sizes[`${look.id}:${p.id}`]));
  openBag();
}
$('#pi-add').addEventListener('click', attemptAddAll);
$('#mab-add').addEventListener('click', attemptAddAll);

/* ---------- reserve in store ---------- */
const reservePanel = $('#reserve-panel');
$('#reserve-toggle').addEventListener('click', () => {
  const open = reservePanel.classList.toggle('open');
  $('#reserve-toggle').setAttribute('aria-expanded', String(open));
});
$('#reserve-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#reserve-name'), email = $('#reserve-email');
  const okName = name.value.trim().length >= 2;
  const okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.value.trim());
  name.style.borderColor = okName ? '' : 'var(--red)';
  email.style.borderColor = okEmail ? '' : 'var(--red)';
  if (!okName || !okEmail) { toast(okEmail ? 'Please enter your name' : 'Please enter a valid email'); return; }
  const store = $('#reserve-form input[name="store"]:checked')?.value;
  const day = $('#reserve-form input[name="day"]:checked')?.value;
  $('#reserve-success-sub').textContent = `Look ${lookNo(LOOKS_BY_ID[state.productId])} held at ${store}, for pickup ${day.toLowerCase()}. A confirmation is on its way to ${email.value.trim()}.`;
  $('#reserve-form').hidden = true;
  $('#reserve-success').hidden = false;
  toast('Reserved — free for 48 hours');
});

/* ---------- back to lineup ---------- */
$('#back-to-lineup').addEventListener('click', () => { location.hash = ''; });
window.addEventListener('hashchange', route);

/* ═════════════════════════════════════════════
   BAG DRAWER wiring
   ═════════════════════════════════════════════ */
$('#bag-btn').addEventListener('click', openBag);
$('#bag-close').addEventListener('click', closeBag);
$('#backdrop').addEventListener('click', closeBag);

$('#bag-items').addEventListener('click', e => {
  const qtyBtn = e.target.closest('[data-qty]');
  if (qtyBtn) {
    const row = qtyBtn.closest('.bag-item');
    const key = row.dataset.key;
    const line = state.bag.find(l => l.key === key);
    if (line) {
      line.qty += Number(qtyBtn.dataset.qty);
      if (line.qty <= 0) state.bag = state.bag.filter(l => l.key !== key);
      persist(); renderBag();
    }
    return;
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) { state.bag = state.bag.filter(l => l.key !== rm.dataset.remove); persist(); renderBag(); toast('Removed from bag'); }
});

$('#bag-checkout').addEventListener('click', function () {
  if (!state.bag.length) return;
  this.disabled = true;
  $('span', this).textContent = 'Placing order…';
  setTimeout(() => {
    const orderNo = 'LN-' + Math.floor(1000 + Math.random() * 9000);
    state.bag = [];
    persist(); renderBag();
    this.disabled = false;
    $('span', this).textContent = 'Checkout';
    closeBag();
    toast(`Order ${orderNo} confirmed — thank you`);
  }, 1100);
});

/* ═════════════════════════════════════════════
   SEARCH
   ═════════════════════════════════════════════ */
const searchOverlay = $('#search-overlay');
const searchInput = $('#search-input');
const searchResults = $('#search-results');
const searchEmpty = $('#search-empty');

function openSearch() {
  state.searchOpen = true;
  searchOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  renderSearch('');
  setTimeout(() => searchInput.focus(), 60);
}
function closeSearch() {
  state.searchOpen = false;
  searchOverlay.hidden = true;
  document.body.style.overflow = state.productId ? 'hidden' : '';
  searchInput.value = '';
}
function renderSearch(q) {
  q = q.trim().toLowerCase();
  let hits = [];
  if (!q) hits = LOOKS.flatMap(l => l.pieces.map(p => ({ look: l, piece: p }))).slice(0, 8);
  else {
    for (const l of LOOKS) for (const p of l.pieces) {
      const hay = `${p.name} ${p.kind} ${p.colour} ${l.name} ${l.gender}`;
      if (hay.toLowerCase().includes(q)) hits.push({ look: l, piece: p });
    }
    const seen = new Set();
    hits = hits.filter(h => !seen.has(h.piece.id) && seen.add(h.piece.id)).slice(0, 12);
  }
  searchEmpty.hidden = hits.length > 0;
  searchResults.innerHTML = hits.map(({ look, piece }) => `
    <button class="search-card" data-open="${look.id}">
      <span class="search-card-img"><img src="${piece.img}" alt="${piece.name}" loading="lazy" onerror="this.onerror=null;this.src='${colourwayOf(look).img}'"></span>
      <span class="search-card-name">${piece.name}</span>
      <span class="search-card-price">${formatPrice(effectivePrice(look, piece))} · ${look.gender === 'women' ? 'Women' : 'Men'}</span>
    </button>`).join('');
}
let searchDebounce;
searchInput.addEventListener('input', e => { clearTimeout(searchDebounce); searchDebounce = setTimeout(() => renderSearch(e.target.value), 110); });
$('#search-btn').addEventListener('click', openSearch);
$('#search-close').addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
searchResults.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) { closeSearch(); openProduct(b.dataset.open); } });

/* ═════════════════════════════════════════════
   ACCOUNT POPOVER
   ═════════════════════════════════════════════ */
const accountPop = $('#account-pop');
$('#account-btn').addEventListener('click', e => {
  e.stopPropagation();
  accountPop.hidden = !accountPop.hidden;
});
document.addEventListener('click', e => { if (!accountPop.hidden && !e.target.closest('#account-pop') && !e.target.closest('#account-btn')) accountPop.hidden = true; });
$('#account-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = $('#account-email');
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.value.trim());
  email.style.borderColor = ok ? '' : 'var(--red)';
  if (!ok) { toast('Please enter a valid email'); return; }
  $('#account-form').hidden = true;
  $('#account-done').hidden = false;
  toast('Welcome to LINEUP Members');
});

/* ═════════════════════════════════════════════
   ESCAPE
   ═════════════════════════════════════════════ */
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (state.searchOpen) return closeSearch();
  if (!accountPop.hidden) { accountPop.hidden = true; return; }
  if (state.bagOpen) return closeBag();
  if (state.productId) { location.hash = ''; }
});

/* progress segments */
(function renderSegments() {
  $('#bb-progress').innerHTML = Array.from({ length: 6 }, () => '<span class="bb-seg"></span>').join('');
})();

/* ═════════════════════════════════════════════
   INIT
   ═════════════════════════════════════════════ */
buildStage();
layoutSlots();
syncAll();
renderBag();
route();
if (REDUCED) document.documentElement.classList.add('reduced-motion');
