// Dex OS browser demo. Everything here is pretend: no network calls, and the
// only thing it keeps is your wallpaper, theme, notes and reminders, in this
// browser's local storage.
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const store = {
  get(k, d) { try { const v = localStorage.getItem('dexdemo.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('dexdemo.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

/* ---------- Wallpapers, ported from crates/dexos-ui/src/wallpaper.rs ---------- */
const PAL = {
  aurora: { name: 'Aurora', dark: true, bg: ['#0B1020', '#1A0F2B'], c: ['#2456D6', '#7B3FD0', '#0FA3A3', '#C2437A'] },
  midnight: { name: 'Midnight', dark: true, bg: ['#05070F', '#0E1530'], c: ['#2F4FD8', '#14B8E6', '#5B3FD0', '#1E88E5'] },
  ember: { name: 'Ember', dark: true, bg: ['#1A0A12', '#2A0F1E'], c: ['#F05A28', '#C2185B', '#FFB03A', '#7A1FA2'] },
  graphite: { name: 'Graphite', dark: true, bg: ['#0E0F12', '#1A1C22'], c: ['#5A6478', '#8C96A8', '#3F4A60', '#B7C0CF'] },
  dawn: { name: 'Dawn', dark: false, bg: ['#EEF3FF', '#FFF1F3'], c: ['#8FB2FF', '#C9A6FF', '#8EE3D8', '#FFB3C8'] },
  sky: { name: 'Sky', dark: false, bg: ['#EAF4FF', '#F4F0FF'], c: ['#7FB8FF', '#B3D4FF', '#B9A8FF', '#9FE7FF'] },
};
const D_STEM = 'M37.5 29 A8.5 8.5 0 0 1 46 37.5 V90.5 A8.5 8.5 0 0 1 29 90.5 V37.5 A8.5 8.5 0 0 1 37.5 29 Z';
const D_BOWL = 'M58 29 H64 A35 35 0 0 1 64 99 H58 A8.5 8.5 0 0 1 58 82 H64 A18 18 0 0 0 64 46 H58 A8.5 8.5 0 0 1 58 29 Z';
const HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">';
const background = p => `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg[0]}"/><stop offset="1" stop-color="${p.bg[1]}"/></linearGradient><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="120"/></filter><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs><rect width="1920" height="1080" fill="url(#bg)"/>`;

function dexGlow(p) {
  const s = 7.2, tx = 1290 - 64 * s, ty = 540 - 64 * s, edge = p.dark ? '.35' : '.7';
  return `${HEAD}${background(p)}<defs><linearGradient id="dg" gradientUnits="userSpaceOnUse" x1="29" y1="29" x2="99" y2="99"><stop offset="0" stop-color="${p.c[0]}"/><stop offset="1" stop-color="${p.c[1]}"/></linearGradient><filter id="dglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs><g filter="url(#soft)" opacity=".7"><ellipse cx="420" cy="860" rx="520" ry="300" fill="${p.c[2]}"/><ellipse cx="1320" cy="540" rx="520" ry="420" fill="${p.c[0]}"/><ellipse cx="300" cy="180" rx="320" ry="200" fill="${p.c[3]}" opacity=".6"/></g><g transform="translate(${tx} ${ty}) scale(${s})"><g filter="url(#dglow)" opacity=".75"><path d="${D_STEM}" fill="url(#dg)"/><path d="${D_BOWL}" fill="url(#dg)"/></g><path d="${D_STEM}" fill="url(#dg)"/><path d="${D_BOWL}" fill="url(#dg)"/><g fill="none" stroke="#ffffff" stroke-width=".5" opacity="${edge}"><path d="${D_STEM}"/><path d="${D_BOWL}"/></g></g></svg>`;
}
function dexGlass(p) {
  const s = 11, tx = 1180 - 29 * s, ty = 640 - 64 * s;
  const fields = (blur, o) => `<g filter="url(#${blur})" opacity="${o}"><ellipse cx="1500" cy="300" rx="520" ry="320" fill="${p.c[0]}"/><ellipse cx="520" cy="820" rx="560" ry="300" fill="${p.c[1]}"/><ellipse cx="1700" cy="900" rx="380" ry="240" fill="${p.c[2]}"/><ellipse cx="900" cy="200" rx="320" ry="180" fill="${p.c[3]}"/></g>`;
  const [frost, edge] = p.dark ? ['.10', '.30'] : ['.40', '.85'];
  const shape = `transform="translate(${tx} ${ty}) scale(${s})"`;
  return `${HEAD}${background(p)}<defs><filter id="frost" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter><clipPath id="dclip"><path ${shape} d="${D_STEM}"/><path ${shape} d="${D_BOWL}"/></clipPath><linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".35"/><stop offset=".45" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs>${fields('soft', '.8')}<g transform="translate(${tx} ${ty + 18}) scale(${s})" opacity=".35" filter="url(#glow)"><path d="${D_STEM}" fill="#000000"/><path d="${D_BOWL}" fill="#000000"/></g><g clip-path="url(#dclip)"><rect width="1920" height="1080" fill="${p.bg[0]}"/>${fields('frost', '1')}<rect width="1920" height="1080" fill="#ffffff" opacity="${frost}"/><rect width="1920" height="1080" fill="url(#sheen)"/></g><g ${shape} fill="none" stroke="#ffffff" stroke-width=".35" opacity="${edge}"><path d="${D_STEM}"/><path d="${D_BOWL}"/></g></svg>`;
}
const FAMILIES = [['glass', 'Dex Glass', dexGlass], ['glow', 'Dex Glow', dexGlow]];
const WALLS = FAMILIES.flatMap(([fam, , fn]) => Object.keys(PAL).map(pal => ({ id: `${fam}-${pal}`, fam, pal, fn })));
const wallCache = {};
function wallUrl(id) {
  if (!wallCache[id]) {
    const w = WALLS.find(x => x.id === id) || WALLS[0];
    wallCache[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(w.fn(PAL[w.pal]));
  }
  return wallCache[id];
}

/* ---------- State ---------- */
const S = {
  wall: store.get('wall', 'glass-aurora'),
  light: store.get('light', false),
  vol: 45, bright: 100,
  on: { wifi: true, bt: false, dnd: false, eye: false, rec: false, power: false, air: false, mute: false, hot: false, vpn: false, share: false, link: false, cast: false, modes: false, caf: false },
};
if (!WALLS.some(w => w.id === S.wall)) S.wall = 'glass-aurora';

const screen = $('#screen');
let scale = 1;

/* ---------- Fit the 1280x800 screen into the window ---------- */
function fit() {
  const st = $('#stage');
  const pad = innerWidth < 700 ? 6 : 22;
  scale = Math.min((st.clientWidth - pad * 2) / 1280, (st.clientHeight - pad * 2) / 800);
  const x = (st.clientWidth - 1280 * scale) / 2, y = (st.clientHeight - 800 * scale) / 2;
  screen.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  const portraitPhone = innerWidth < 700 && innerHeight > innerWidth;
  $('#rotate').hidden = !portraitPhone || store.get('rotateOk', false);
}
addEventListener('resize', fit);
$('#rotateOk').onclick = () => { store.set('rotateOk', true); $('#rotate').hidden = true; };

/* ---------- Clock ---------- */
function tick() {
  const d = new Date();
  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const [hm, ap] = t.split(/\s/);
  $$('[data-time-short]').forEach(e => e.textContent = hm);
  $$('[data-time-plain]').forEach(e => e.textContent = hm);
  $$('[data-ampm]').forEach(e => e.textContent = ap || '');
  $$('[data-date-long]').forEach(e => e.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  $$('[data-date-short]').forEach(e => e.textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
}

/* ---------- Apps ---------- */
const APPS = [
  { id: 'calculator', name: 'Calculator', w: 340, h: 520, render: calcApp },
  { id: 'calendar', name: 'Calendar' },
  { id: 'clock', name: 'Clock', w: 560, h: 470, render: clockApp },
  { id: 'contacts', name: 'Contacts' },
  { id: 'store', name: 'Dex Store', w: 820, h: 560, render: storeApp },
  { id: 'terminal', name: 'Dex-Top', w: 720, h: 440, render: termApp },
  { id: 'dexter', name: 'Dexter', w: 500, h: 580, render: dexterApp },
  { id: 'wellbeing', name: 'Digital Wellbeing' },
  { id: 'mail', name: 'Email' },
  { id: 'gallery', name: 'Gallery', w: 780, h: 520, render: galleryApp },
  { id: 'gamehub', name: 'Game Hub' },
  { id: 'installer', name: 'Install Dex OS', w: 600, h: 470, render: installerApp },
  { id: 'messages', name: 'Messages' },
  { id: 'music', name: 'Music' },
  { id: 'files', name: 'My Files', w: 800, h: 500, render: filesApp },
  { id: 'notes', name: 'Notes', w: 740, h: 480, render: notesApp },
  { id: 'screenrec', name: 'Screen recorder' },
  { id: 'secure', name: 'Secure Folder' },
  { id: 'settings', name: 'Settings', w: 1060, h: 650, render: settingsApp },
  { id: 'smartselect', name: 'Smart Select' },
  { id: 'texteditor', name: 'Text Editor', w: 640, h: 440, render: textApp },
  { id: 'themes', name: 'Themes' },
  { id: 'tips', name: 'Tips', w: 600, h: 580, render: tipsApp },
  { id: 'recorder', name: 'Voice Recorder' },
  { id: 'weather', name: 'Weather', w: 540, h: 620, render: weatherApp },
  { id: 'windows', name: 'Windows', w: 560, h: 420, render: windowsApp },
  { id: 'android', name: 'Android app', icon: 'apps', w: 560, h: 400, render: androidApp, hidden: true },
];
const APP = Object.fromEntries(APPS.map(a => [a.id, a]));
const icon = a => `icons/${a.icon || a.id}.svg`;
const PINNED = ['store', 'files', 'dexter', 'terminal', 'settings'];

function appButton(a, cls = 'app') {
  const b = h(`<button class="${cls}" data-app="${a.id}"><img src="${icon(a)}" alt=""><span>${esc(a.name)}</span></button>`);
  b.onclick = () => open(a.id);
  return b;
}

/* ---------- Window manager ---------- */
const wins = new Map();
let zTop = 10, cascade = 0, front = null;
const AREA = { w: 1280, h: 714 };

function open(id, arg) {
  const app = APP[id];
  if (!app) return;
  closeOverlays();
  let w = wins.get(id);
  if (w) {
    w.el.classList.remove('min');
    focus(id);
    if (arg !== undefined && w.onArg) w.onArg(arg);
    return w;
  }
  const W = app.w || 520, H = app.h || 400;
  const x = Math.round((AREA.w - W) / 2 + cascade * 26);
  const y = Math.max(0, Math.round((AREA.h - H) / 2 - 12 + cascade * 22));
  cascade = (cascade + 1) % 5;
  const el = h(`<section class="win" style="left:${x}px;top:${y}px;width:${W}px;height:${H}px" aria-label="${esc(app.name)}">
    <div class="tbar"><img src="${icon(app)}" alt="">${esc(app.name)}<div class="ctl">
      <button class="mn" aria-label="Minimize"><i class="ph ph-minus"></i></button>
      <button class="mx" aria-label="Maximize"><i class="ph ph-square"></i></button>
      <button class="x" aria-label="Close"><i class="ph ph-x"></i></button></div></div>
    <div class="body"></div></section>`);
  $('#wins').append(el);
  w = { id, app, el, cleanup: [] };
  wins.set(id, w);
  (app.render || placeholderApp)($('.body', el), w, arg);
  el.addEventListener('pointerdown', () => focus(id));
  $('.mn', el).onclick = e => { e.stopPropagation(); minimize(id); };
  $('.mx', el).onclick = e => { e.stopPropagation(); el.classList.toggle('max'); };
  $('.x', el).onclick = e => { e.stopPropagation(); close(id); };
  drag(el);
  focus(id);
  return w;
}
function focus(id) {
  const w = wins.get(id);
  if (!w) return;
  w.el.style.zIndex = ++zTop;
  front = id;
  wins.forEach(o => o.el.classList.toggle('top', o === w));
  renderDock();
}
function topVisible() {
  let best = null;
  wins.forEach(w => { if (!w.el.classList.contains('min') && (!best || +w.el.style.zIndex > +best.el.style.zIndex)) best = w; });
  return best;
}
function minimize(id) {
  const w = wins.get(id);
  if (!w) return;
  w.el.classList.add('min');
  const next = topVisible();
  next ? focus(next.id) : (front = null, renderDock());
}
function close(id) {
  const w = wins.get(id);
  if (!w) return;
  w.cleanup.forEach(f => f());
  wins.delete(id);
  w.el.classList.add('closing');
  setTimeout(() => w.el.remove(), 160);
  const next = topVisible();
  next ? focus(next.id) : (front = null, renderDock());
}
function drag(el) {
  const bar = $('.tbar', el);
  bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) el.classList.toggle('max'); });
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || el.classList.contains('max')) return;
    const sx = e.clientX, sy = e.clientY, l = el.offsetLeft, t = el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    const move = ev => {
      const nl = l + (ev.clientX - sx) / scale, nt = t + (ev.clientY - sy) / scale;
      el.style.left = Math.round(Math.min(AREA.w - 80, Math.max(80 - el.offsetWidth, nl))) + 'px';
      el.style.top = Math.round(Math.min(AREA.h - 36, Math.max(0, nt))) + 'px';
    };
    const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });
}

/* ---------- Dock ---------- */
function renderDock() {
  const d = $('#dock');
  d.innerHTML = '';
  const apps = h(`<button class="dk" data-tip="Apps" aria-label="Apps"><img src="icons/apps.svg" alt=""></button>`);
  apps.onclick = () => toggle('#drawer');
  d.append(apps);
  const item = id => {
    const a = APP[id], w = wins.get(id);
    const b = h(`<button class="dk" data-tip="${esc(a.name)}" aria-label="${esc(a.name)}"><img src="${icon(a)}" alt=""></button>`);
    if (w) b.classList.add('run');
    if (w && front === id && !w.el.classList.contains('min')) b.classList.add('front');
    b.onclick = () => {
      const w2 = wins.get(id);
      if (!w2) return open(id);
      closeOverlays();
      if (front === id && !w2.el.classList.contains('min')) minimize(id); else { w2.el.classList.remove('min'); focus(id); }
    };
    return b;
  };
  PINNED.forEach(id => d.append(item(id)));
  const extra = [...wins.keys()].filter(id => !PINNED.includes(id));
  if (extra.length) { d.append(h('<span class="sep"></span>')); extra.forEach(id => d.append(item(id))); }
}

/* ---------- Overlays (drawer, quick panel, recents, search results) ---------- */
function toggle(sel) {
  const el = $(sel);
  const show = el.hidden;
  closeOverlays();
  el.hidden = !show;
  $('#qpBtn').classList.toggle('on', sel === '#qp' && show);
  if (sel === '#drawer' && show) { $('#drawerIn').value = ''; fillDrawer(''); setTimeout(() => $('#drawerIn').focus(), 30); }
  if (sel === '#recents' && show) fillRecents();
}
function closeOverlays() {
  ['#drawer', '#qp', '#recents', '#results'].forEach(s => $(s).hidden = true);
  $('#qpBtn').classList.remove('on');
}
function anyOverlay() { return ['#drawer', '#qp', '#recents', '#results'].some(s => !$(s).hidden); }

screen.addEventListener('pointerdown', e => {
  const t = e.target;
  if (!$('#qp').hidden && !t.closest('#qp') && !t.closest('#qpBtn')) { $('#qp').hidden = true; $('#qpBtn').classList.remove('on'); }
  if (!$('#drawer').hidden && !t.closest('#drawer') && !t.closest('.dock')) $('#drawer').hidden = true;
  if (!$('#results').hidden && !t.closest('#search')) $('#results').hidden = true;
});

function fillDrawer(q) {
  const g = $('#appGrid');
  g.innerHTML = '';
  APPS.filter(a => !a.hidden && a.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(a => g.append(appButton(a)));
  if (!g.children.length) g.append(h(`<p class="p" style="grid-column:1/-1;text-align:center">No apps called "${esc(q)}".</p>`));
}
$('#drawerIn').addEventListener('input', e => fillDrawer(e.target.value));
$('#drawerIn').addEventListener('keydown', e => { if (e.key === 'Enter') { const b = $('#appGrid .app'); if (b) b.click(); } });

function fillRecents() {
  const l = $('#rcList');
  l.innerHTML = '';
  if (!wins.size) { l.append(h('<p class="rc-empty">No recent apps.</p>')); $('#rcClose').hidden = true; return; }
  $('#rcClose').hidden = false;
  wins.forEach(w => {
    const c = h(`<button class="rc-card"><header><img src="${icon(w.app)}" alt="">${esc(w.app.name)}</header><div><img src="${icon(w.app)}" alt=""></div></button>`);
    c.onclick = () => { $('#recents').hidden = true; w.el.classList.remove('min'); focus(w.id); };
    l.append(c);
  });
}
$('#rcClose').onclick = () => { [...wins.keys()].forEach(close); $('#recents').hidden = true; };

/* ---------- Toasts ---------- */
function toast(appId, title, text, force) {
  if (S.on.dnd && !force) return;
  const box = $('#toasts');
  const a = APP[appId];
  const t = h(`<div class="toast">${a ? `<img src="${icon(a)}" alt="">` : '<img src="icons/apps.svg" alt="">'}<div><b>${esc(title)}</b><p>${esc(text)}</p></div></div>`);
  box.prepend(t);
  while (box.children.length > 3) box.lastChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 5200);
}

/* ---------- Lock screen ---------- */
let unlockedOnce = false;
function unlock() {
  const l = $('#lock');
  if (l.hidden || l.classList.contains('away')) return;
  $('#desk').hidden = false;
  l.classList.add('away');
  setTimeout(() => { l.hidden = true; }, 450);
  if (!unlockedOnce) {
    unlockedOnce = true;
    setTimeout(() => toast('tips', 'Welcome to Dex OS', 'Open My Files, go to Downloads and double-click the .exe to see what happens. The Tips app has more ideas.', true), 700);
  }
}
function lock() {
  closeOverlays();
  const l = $('#lock');
  l.hidden = false;
  requestAnimationFrame(() => { l.classList.remove('away'); l.focus(); });
}
{
  const l = $('#lock');
  let sy = null;
  l.addEventListener('pointerdown', e => { sy = e.clientY; });
  l.addEventListener('pointerup', e => { if (sy !== null) unlock(); sy = null; });
  l.addEventListener('keydown', e => { if (e.key !== 'Tab') { e.preventDefault(); unlock(); } });
  document.addEventListener('keydown', e => {
    if (!l.hidden && !l.classList.contains('away') && !e.metaKey && !e.ctrlKey && e.key !== 'Tab') unlock();
  });
}

/* ---------- Wallpaper and theme ---------- */
function applyWall() {
  $('#wall').src = wallUrl(S.wall);
  $$('.walls button').forEach(b => b.classList.toggle('on', b.dataset.wall === S.wall));
}
function setWall(id) { S.wall = id; store.set('wall', id); applyWall(); }
function setLight(v) { S.light = v; store.set('light', v); screen.classList.toggle('light', v); sync(); }

/* Everything that mirrors a setting (switches, tiles, icons) updates here. */
function sync() {
  const val = k => k === 'dark' ? !S.light : S.on[k];
  $$('[data-k]').forEach(e => e.classList.toggle('on', !!val(e.dataset.k)));
  $$('[data-tog]').forEach(e => e.classList.toggle('on', !!val(e.dataset.tog)));
  $('#wifiSub').textContent = S.on.wifi ? 'Home network' : 'Off';
  $('#btSub').textContent = S.on.bt ? 'On, nothing connected' : 'Off';
  $('#netIcon').className = 'ph ' + (S.on.air ? 'ph-airplane' : S.on.wifi ? 'ph-globe-simple' : 'ph-wifi-slash');
  const v = S.on.mute ? 0 : S.vol;
  $('#volIcon').className = 'ph ' + (v === 0 ? 'ph-speaker-x' : v < 40 ? 'ph-speaker-low' : 'ph-speaker-high');
  $$('input[data-vol]').forEach(r => { r.value = S.vol; r.style.setProperty('--v', S.vol + '%'); });
  $('#shield').classList.toggle('on', S.on.eye);
  $('#dim').style.background = `rgba(0,0,0,${((100 - S.bright) / 100 * 0.65).toFixed(3)})`;
}
function setOn(k, v) {
  if (k === 'dark') return setLight(!v);
  S.on[k] = v;
  if (k === 'air' && v) { S.on.wifi = false; S.on.bt = false; }
  if ((k === 'wifi' || k === 'bt') && v) S.on.air = false;
  sync();
}

/* ---------- Quick panel ---------- */
const TILES = [
  ['dnd', 'Do not disturb', 'ph-moon'], ['dark', 'Dark mode', 'ph-circle-half'], ['eye', 'Eye comfort shield', 'ph-eye'], ['shot', 'Screenshot', 'ph-selection-all'], ['rec', 'Screen recorder', 'ph-record'],
  ['power', 'Power mode', 'ph-leaf'], ['air', 'Airplane', 'ph-airplane'], ['mute', 'Mute', 'ph-speaker-slash'], ['hot', 'Hotspot', 'ph-broadcast'], ['vpn', 'VPN', 'ph-key'],
  ['share', 'Share nearby', 'ph-share-network'], ['link', 'Link to devices', 'ph-devices'], ['cast', 'Cast screen', 'ph-screencast'], ['modes', 'Modes', 'ph-sparkle'], ['caf', 'Caffeine', 'ph-coffee'],
];
function buildQp() {
  const g = $('#qpGrid');
  TILES.forEach(([k, label, ic]) => {
    const b = h(`<button class="tile" data-tog="${k}"><i class="ph ${ic}"></i><span>${label}</span></button>`);
    b.onclick = () => {
      if (k === 'shot') { closeOverlays(); screenshot(); return; }
      const now = k === 'dark' ? !S.light : S.on[k];
      setOn(k, !now);
      if (k === 'rec') toast('screenrec', now ? 'Recording stopped' : 'Recording your screen', now ? 'On Dex OS this would be in Videos now.' : 'Tap the tile again to stop.', true);
      if (k === 'caf' && !now) toast('settings', 'Caffeine is on', 'Your screen will stay awake until you turn it off.');
      if (k === 'dnd' && !now) toast('settings', 'Do not disturb', 'Notifications will wait quietly until you turn this off.', true);
    };
    g.append(b);
  });
  $$('.qp-big .big').forEach(b => b.onclick = () => setOn(b.dataset.tog, !S.on[b.dataset.tog]));
  const vol = $('#vol');
  vol.dataset.vol = '';
  vol.addEventListener('input', () => { S.vol = +vol.value; if (S.vol > 0) S.on.mute = false; sync(); });
  $('#qpBtn').onclick = () => toggle('#qp');
  $('#qpLock').onclick = lock;
  $('#qpSet').onclick = () => open('settings');
  $$('.qp-cards [data-open]').forEach(b => b.onclick = () => { const [id, arg] = b.dataset.open.split(':'); open(id, arg); });
}
function screenshot() {
  const f = $('#flash');
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  setTimeout(() => toast('gallery', 'Screenshot taken', "On Dex OS it'd be saved to Pictures. This demo doesn't keep files.", true), 350);
}

/* ---------- Home screen ---------- */
function buildHome() {
  const sc = $('#shortcuts');
  ['files', 'weather', 'terminal', 'settings'].forEach(id => sc.append(appButton(APP[id])));

  // Calendar for the current month, weeks starting Sunday.
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  $('#calTitle').textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const g = $('#calGrid');
  'SMTWTFS'.split('').forEach(d => g.append(h(`<b>${d}</b>`)));
  const first = new Date(y, m, 1).getDay();
  for (let i = 0; i < 42; i++) {
    const d = new Date(y, m, 1 - first + i);
    const s = h(`<span>${d.getDate()}</span>`);
    if (d.getMonth() !== m) s.classList.add('out');
    else if (d.getDay() === 0) s.classList.add('sun');
    if (d.toDateString() === now.toDateString()) s.classList.add('today');
    g.append(s);
  }

  // Reminders
  let rem = store.get('reminders', []);
  const draw = () => {
    const ul = $('#remList');
    ul.innerHTML = '';
    rem.forEach((r, i) => {
      const li = h(`<li><button aria-label="Mark done"></button><span>${esc(r)}</span></li>`);
      $('button', li).onclick = () => { rem.splice(i, 1); store.set('reminders', rem); draw(); };
      ul.append(li);
    });
    $('#remEmpty').hidden = rem.length > 0;
    $('#remCount').textContent = `${rem.length} open`;
  };
  $('#remForm').onsubmit = e => {
    e.preventDefault();
    const v = $('#remIn').value.trim();
    if (!v) return;
    rem.push(v.slice(0, 80)); store.set('reminders', rem); $('#remIn').value = ''; draw();
  };
  draw();

  $('#askForm').onsubmit = e => {
    e.preventDefault();
    const q = $('#askIn').value.trim();
    $('#askIn').value = '';
    open('dexter', q || undefined);
  };

  // Device care, wobbling a little like the real one.
  const care = () => {
    const cpu = 2 + Math.round(Math.random() * 11), mem = 17 + Math.round(Math.random() * 4);
    $('#cpuV').textContent = cpu + '%'; $('#cpuB').style.width = Math.max(3, cpu) + '%';
    $('#memV').textContent = mem + '%'; $('#memB').style.width = mem + '%';
  };
  care(); setInterval(care, 2500);

  // Search
  const inp = $('#searchIn'), res = $('#results');
  const run = () => {
    const q = inp.value.trim();
    res.innerHTML = '';
    if (!q) { res.hidden = true; return; }
    APPS.filter(a => !a.hidden && a.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5).forEach(a => {
      const b = h(`<button><img src="${icon(a)}" alt="">${esc(a.name)}</button>`);
      b.onclick = () => { inp.value = ''; res.hidden = true; open(a.id); };
      res.append(b);
    });
    const web = h(`<button class="web"><i class="ph ph-globe"></i>Search the web for "${esc(q)}"</button>`);
    web.onclick = () => { inp.value = ''; res.hidden = true; toast('apps', 'Web search', 'On Dex OS this opens your browser with the results. The demo stays offline.'); };
    res.append(web);
    res.hidden = false;
  };
  inp.addEventListener('input', run);
  inp.addEventListener('focus', run);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = $('button', res); if (b) b.click(); } });
}

/* ---------- Taskbar buttons ---------- */
$('#homeBtn').onclick = () => { closeOverlays(); wins.forEach((w, id) => w.el.classList.add('min')); front = null; renderDock(); };
$('#rcBtn').onclick = () => toggle('#recents');
$('#kbBtn').onclick = () => toast('settings', 'On-screen keyboard', 'On a touch screen, the keyboard opens from here.');
function back() {
  if (anyOverlay()) return closeOverlays();
  const w = topVisible();
  if (w) close(w.id);
}
$('#backBtn').onclick = back;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#lock').hidden) back(); });

/* ================= The apps ================= */

function placeholderApp(body, w) {
  const a = w.app;
  body.innerHTML = `<div class="ph-app"><img src="${icon(a)}" alt=""><h2>${esc(a.name)}</h2>
    <p class="p">${esc(a.name)} comes with Dex OS, but it isn't part of this demo. A handful of apps work here: try My Files, Settings, Dex-Top, Notes or Calculator.</p>
    <a class="pbtn" href="../#get" target="_top">Get Dex OS</a></div>`;
}

function windowsApp(body, w, arg) {
  const show = file => {
    body.innerHTML = `<div class="ph-app"><img src="icons/windows.svg" alt=""><h2>${file ? esc(file) : 'Windows programs'}</h2>
      <p class="p">${file ? `On a real install, ${esc(file)} would open right here, in its own window like any other app.` : 'This is where you manage the Windows side of Dex OS.'}
      Dex OS runs Windows programs in a small copy of Windows that stays out of sight, so you just see the program.</p>
      <p class="p">A web browser can't run Windows, so this is as far as the demo goes.</p></div>`;
  };
  show(arg);
  w.onArg = show;
}
function androidApp(body, w, arg) {
  const show = file => {
    body.innerHTML = `<div class="ph-app"><img src="icons/apps.svg" alt=""><h2>${esc(file || 'Android app')}</h2>
      <p class="p">On Dex OS, double-clicking an .apk installs the Android app and opens it in its own window, next to everything else.</p>
      <p class="p">That part needs the real thing.</p></div>`;
  };
  show(arg);
  w.onArg = show;
}

function installerApp(body) {
  body.innerHTML = `<div class="ph-app"><img src="icons/installer.svg" alt=""><h2>Install Dex OS</h2>
    <p class="p">On the USB stick, this is where you install Dex OS onto your PC, either in place of Windows or next to it. In a browser there's nothing to install it on.</p>
    <a class="pbtn" href="../#get" target="_top">How to get it</a></div>`;
}

/* Settings */
const SET_PAGES = [
  ['style', 'Wallpaper and style', 'Wallpapers, dark mode', 'ph-palette', '#e0569b'],
  ['display', 'Display', 'Brightness, eye comfort', 'ph-sun', '#f0a020'],
  ['sound', 'Sound', 'Volume, mute', 'ph-speaker-high', '#22a861'],
  ['network', 'Connections', 'Wi-Fi, Bluetooth, airplane mode', 'ph-wifi-high', '#2f80ed'],
  ['updates', 'Software update', 'Updates and rollback', 'ph-arrows-clockwise', '#6a4be0'],
  ['about', 'About Dex OS', 'Version, this device', 'ph-info', '#6b7385'],
];
function settingsApp(body, w, arg) {
  body.innerHTML = `<div class="set"><aside><h2 class="h1">Settings</h2><nav></nav>
    <div class="search small" style="margin:auto 0 0;width:auto"><i class="ph ph-magnifying-glass"></i><input type="text" placeholder="Search settings" aria-label="Search settings"></div></aside><main></main></div>`;
  const nav = $('nav', body), main = $('main', body);
  SET_PAGES.forEach(([id, name, sub, ic, col]) => {
    const b = h(`<button data-p="${id}"><i class="ph ${ic}" style="background:${col}"></i><span>${name}<small>${sub}</small></span></button>`);
    b.onclick = () => show(id);
    nav.append(b);
  });
  $('aside input', body).addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('nav button', body).forEach(b => b.hidden = !b.textContent.toLowerCase().includes(q));
  });
  const sw = (k, title, sub) => `<div class="row"><div>${title}${sub ? `<small>${sub}</small>` : ''}</div><button class="sw" data-k="${k}" aria-label="${title}"></button></div>`;
  const show = id => {
    if (!SET_PAGES.some(p => p[0] === id)) id = 'style';
    $$('nav button', body).forEach(b => b.classList.toggle('on', b.dataset.p === id));
    const p = SET_PAGES.find(x => x[0] === id);
    let html = `<h2 class="h1" style="font-size:24px">${p[1]}</h2>`;
    if (id === 'style') {
      html += sw('dark', 'Dark mode', 'Easier on the eyes at night');
      FAMILIES.forEach(([fam, name]) => {
        html += `<h3 class="h2">${name}</h3><div class="walls">` + Object.keys(PAL).map(pal => `<button data-wall="${fam}-${pal}"><img alt="" loading="lazy" src="${wallUrl(fam + '-' + pal)}"><span>${PAL[pal].name}${PAL[pal].dark ? ' <i class="ph ph-moon"></i>' : ''}</span></button>`).join('') + '</div>';
      });
      html += `<p class="p" style="margin-top:18px">Dex OS comes with 94 wallpapers, all drawn in code so they stay sharp on any screen. These are two of the families.</p>`;
    } else if (id === 'display') {
      html += `<div class="row" style="display:block">Brightness<input type="range" min="30" max="100" value="${S.bright}" data-bright style="width:100%;margin-top:10px;--v:${(S.bright - 30) / 70 * 100}%" aria-label="Brightness"></div>`;
      html += sw('eye', 'Eye comfort shield', 'Warmer colours, less blue light');
      html += sw('dark', 'Dark mode');
    } else if (id === 'sound') {
      html += `<div class="row" style="display:block">Volume<input type="range" min="0" max="100" data-vol style="width:100%;margin-top:10px" aria-label="Volume"></div>`;
      html += sw('mute', 'Mute');
      html += `<p class="p">Output: speakers. (The demo doesn't play any sound, so your ears are safe.)</p>`;
    } else if (id === 'network') {
      html += sw('wifi', 'Wi-Fi', S.on.wifi ? 'Connected to Home network' : 'Off');
      html += sw('bt', 'Bluetooth', 'Earbuds, mice, controllers');
      html += sw('air', 'Airplane mode', 'Turns off Wi-Fi and Bluetooth');
      html += sw('hot', 'Mobile hotspot', 'Share this PC\'s connection');
    } else if (id === 'updates') {
      html += `<div class="row"><div>Dex OS 0.1 "Sphynx"<small id="updMsg">You're up to date.</small></div><button class="pbtn" id="updBtn">Check for updates</button></div>
        <p class="p" style="margin-top:14px">Updates download in the background and install to a separate copy of the system. If your PC doesn't start properly after one, Dex OS goes back to the version that worked, on its own.</p>`;
    } else if (id === 'about') {
      html += `<div class="row about" style="display:block"><dl>
        <dt>Version</dt><dd>Dex OS 0.1 "Sphynx" (early preview)</dd>
        <dt>Built on</dt><dd>Fedora Linux 44</dd>
        <dt>Desktop</dt><dd>Dex's own, written in Rust</dd>
        <dt>Running on</dt><dd>Your web browser, which is why some things are pretend</dd></dl></div>
        <p class="p" style="margin-top:14px">Dex OS is free and isn't made by or affiliated with the Fedora Project.</p>`;
    }
    main.innerHTML = html;
    main.scrollTop = 0;
    $$('.sw', main).forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      setOn(k, !(k === 'dark' ? !S.light : S.on[k]));
      if (id === 'network') show('network');
    });
    $$('.walls button', main).forEach(b => b.onclick = () => setWall(b.dataset.wall));
    const br = $('[data-bright]', main);
    if (br) br.addEventListener('input', () => { S.bright = +br.value; br.style.setProperty('--v', (S.bright - 30) / 70 * 100 + '%'); sync(); });
    const vr = $('[data-vol]', main);
    if (vr) vr.addEventListener('input', () => { S.vol = +vr.value; if (S.vol > 0) S.on.mute = false; sync(); });
    const ub = $('#updBtn', main);
    if (ub) ub.onclick = () => {
      ub.disabled = true; ub.textContent = 'Checking...';
      setTimeout(() => { ub.disabled = false; ub.textContent = 'Check for updates'; $('#updMsg', main).textContent = "Still up to date. In the demo, it always will be."; }, 1400);
    };
    applyWall(); sync();
  };
  show(arg);
  w.onArg = show;
}

/* Calculator: a plain four-function one, no eval. */
function calcApp(body, w) {
  body.innerHTML = `<div class="calc"><div class="scr"><div class="expr"></div><div class="out">0</div></div><div class="keys"></div></div>`;
  const keys = ['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '⌫', '='];
  const kEl = $('.keys', body), out = $('.out', body), ex = $('.expr', body);
  let cur = '0', acc = null, op = null, fresh = true;
  const fmt = n => !Number.isFinite(n) ? 'Error' : String(+n.toPrecision(12));
  const calc = (a, b, o) => o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : b === 0 ? NaN : a / b;
  const press = k => {
    if (/[0-9]/.test(k)) { cur = fresh || cur === '0' ? k : (cur.length < 15 ? cur + k : cur); fresh = false; }
    else if (k === '.') { if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; }
    else if (k === 'C') { cur = '0'; acc = null; op = null; fresh = true; }
    else if (k === '⌫') { if (!fresh) cur = cur.length > 1 ? cur.slice(0, -1) : '0'; }
    else if (k === '±') { cur = fmt(-parseFloat(cur)); }
    else if (k === '%') { cur = fmt(parseFloat(cur) / 100); }
    else if (k === '=') { if (op !== null) { ex.textContent = `${fmt(acc)} ${op} ${cur} =`; cur = fmt(calc(acc, parseFloat(cur), op)); acc = null; op = null; fresh = true; } }
    else {
      if (op !== null && !fresh) cur = fmt(calc(acc, parseFloat(cur), op));
      acc = parseFloat(cur); op = k; fresh = true; ex.textContent = `${cur} ${k}`;
    }
    if (cur === 'Error') { acc = null; op = null; fresh = true; }
    out.textContent = cur;
    out.style.fontSize = cur.length > 11 ? '30px' : '';
  };
  keys.forEach(k => {
    const b = h(`<button class="${'÷×−+'.includes(k) ? 'op' : k === '=' ? 'eq' : ''}">${k}</button>`);
    b.onclick = () => press(k);
    kEl.append(b);
  });
  w.el.tabIndex = -1;
  w.el.addEventListener('keydown', e => {
    const map = { '/': '÷', '*': '×', '-': '−', '+': '+', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', '.': '.', '%': '%' };
    const k = /^[0-9]$/.test(e.key) ? e.key : map[e.key];
    if (k) { e.preventDefault(); e.stopPropagation(); press(k); }
  });
  setTimeout(() => w.el.focus(), 50);
}

/* Notes, kept in this browser */
function notesApp(body) {
  let notes = store.get('notes', [{ body: 'Welcome to Notes\nWhatever you type here stays in this browser, even if you close the tab.' }]);
  let cur = 0;
  body.innerHTML = `<div class="notes"><aside></aside><textarea aria-label="Note"></textarea></div>`;
  const side = $('aside', body), ta = $('textarea', body);
  const title = n => (n.body.split('\n')[0] || 'New note').slice(0, 40);
  const draw = () => {
    side.innerHTML = '';
    const nb = h('<button class="new"><i class="ph ph-plus"></i> New note</button>');
    nb.onclick = () => { notes.unshift({ body: '' }); cur = 0; save(); draw(); ta.focus(); };
    side.append(nb);
    notes.forEach((n, i) => {
      const b = h(`<button class="${i === cur ? 'on' : ''}">${esc(title(n))}<small>${esc(n.body.split('\n').slice(1).join(' ') || ' ')}</small></button>`);
      b.onclick = () => { cur = i; draw(); };
      side.append(b);
    });
    ta.value = notes[cur] ? notes[cur].body : '';
  };
  const save = () => store.set('notes', notes);
  ta.addEventListener('input', () => {
    if (!notes[cur]) { notes.unshift({ body: '' }); cur = 0; }
    notes[cur].body = ta.value; save();
    const b = side.children[cur + 1];
    if (b) b.innerHTML = `${esc(title(notes[cur]))}<small>${esc(notes[cur].body.split('\n').slice(1).join(' ') || ' ')}</small>`;
  });
  draw();
}

/* Clock with a few cities and a stopwatch */
function clockApp(body, w) {
  body.innerHTML = `<div class="clockapp"><p class="big-t"></p><p class="p date"></p>
    <div class="zones"></div><p class="sw-t">00:00.0</p>
    <button class="pbtn" data-a="go">Start</button> <button class="gbtn" data-a="reset">Reset</button></div>`;
  const zones = [['London', 'Europe/London'], ['New York', 'America/New_York'], ['Tokyo', 'Asia/Tokyo']];
  const zEl = $('.zones', body);
  const upd = () => {
    const d = new Date();
    $('.big-t', body).textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    $('.date', body).textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    zEl.innerHTML = zones.map(([n, tz]) => `<div><b>${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })}</b><span>${n}</span></div>`).join('');
  };
  upd();
  const iv = setInterval(upd, 1000);
  let t0 = 0, acc = 0, run = null;
  const swt = $('.sw-t', body);
  const show = ms => { const s = ms / 1000; swt.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`; };
  $('[data-a=go]', body).onclick = e => {
    if (run) { clearInterval(run); run = null; acc += Date.now() - t0; e.target.textContent = 'Start'; }
    else { t0 = Date.now(); run = setInterval(() => show(acc + Date.now() - t0), 100); e.target.textContent = 'Stop'; }
  };
  $('[data-a=reset]', body).onclick = () => { acc = 0; t0 = Date.now(); show(0); };
  w.cleanup.push(() => { clearInterval(iv); clearInterval(run); });
}

/* Weather, clearly sample data */
function weatherApp(body) {
  const days = [['Today', 'ph-cloud-sun', 'Partly cloudy', '58° / 39°'], ['Fri', 'ph-sun', 'Sunny', '61° / 40°'], ['Sat', 'ph-cloud', 'Cloudy', '55° / 37°'], ['Sun', 'ph-cloud-rain', 'Showers', '49° / 35°'], ['Mon', 'ph-sun', 'Sunny', '57° / 36°']];
  const hours = [['Now', 'ph-cloud-sun', 54], ['1 PM', 'ph-cloud-sun', 56], ['2 PM', 'ph-sun', 58], ['3 PM', 'ph-sun', 57], ['4 PM', 'ph-cloud', 55], ['5 PM', 'ph-cloud', 52]];
  body.innerHTML = `<div class="wx"><span class="note">Sample forecast. On Dex OS it uses your location.</span>
    <div class="now"><i class="ph ph-cloud-sun"></i><div><b>54°</b><div>Partly cloudy</div></div></div>
    <div class="hours">${hours.map(([t, i, d]) => `<div><span>${t}</span><i class="ph ${i}"></i><b>${d}°</b></div>`).join('')}</div>
    <div class="days">${days.map(([d, i, s, t]) => `<div><b>${d}</b><i class="ph ${i}"></i><span>${s}</span><span>${t}</span></div>`).join('')}</div></div>`;
}

/* My Files with a couple of surprises in Downloads */
const FS = {
  Home: ['Desktop/', 'Documents/', 'Downloads/', 'Music/', 'Pictures/', 'Videos/'],
  Desktop: [],
  Documents: ['trip-notes.txt', 'Budget 2026.pdf'],
  Downloads: ['SetupMyApp.exe', 'PuzzleGame.apk', 'trip-notes.txt', 'beach.jpg'],
  Music: [],
  Pictures: ['beach.jpg', 'mountains.jpg', 'Screenshots/'],
  Screenshots: [],
  Videos: [],
};
const FILE_ICON = n => n.endsWith('/') ? ['ph-fill ph-folder', '#f5a623'] : n.endsWith('.exe') ? ['ph ph-windows-logo', '#2f80ed'] : n.endsWith('.apk') ? ['ph ph-android-logo', '#3ddc84'] : n.endsWith('.jpg') ? ['ph ph-image', '#e0569b'] : n.endsWith('.pdf') ? ['ph ph-file-pdf', '#e5484d'] : ['ph ph-file-text', '#8c96a8'];
function filesApp(body, w) {
  body.innerHTML = `<div class="files"><aside></aside><main><div class="path"></div><div class="items"></div><p class="hint"></p></main></div>`;
  const side = $('aside', body);
  const places = [['Home', 'ph-house'], ['Desktop', 'ph-desktop'], ['Documents', 'ph-file-text'], ['Downloads', 'ph-download-simple'], ['Pictures', 'ph-image'], ['Music', 'ph-music-notes'], ['Videos', 'ph-film-strip']];
  let dir = 'Downloads';
  places.forEach(([p, ic]) => {
    const b = h(`<button data-d="${p}"><i class="ph ${ic}"></i>${p}</button>`);
    b.onclick = () => go(p);
    side.append(b);
  });
  const openFile = n => {
    if (n.endsWith('/')) return go(n.slice(0, -1));
    if (n.endsWith('.exe')) { toast('windows', 'Opening in Windows', `${n} is a Windows program. Dex OS opens those for you.`); return open('windows', n); }
    if (n.endsWith('.apk')) return open('android', n);
    if (n.endsWith('.txt')) return open('texteditor', n);
    if (n.endsWith('.jpg')) return open('gallery');
    toast('files', n, "There's no PDF viewer in the demo, but Dex OS has one.");
  };
  const go = d => {
    dir = d;
    $$('button', side).forEach(b => b.classList.toggle('on', b.dataset.d === d));
    $('.path', body).textContent = d === 'Home' ? 'Home' : `Home › ${d}`;
    const items = $('.items', body);
    items.innerHTML = '';
    (FS[d] || []).forEach(n => {
      const [ic, col] = FILE_ICON(n);
      const b = h(`<button class="item"><i class="${ic}" style="color:${col}"></i>${esc(n.replace(/\/$/, ''))}</button>`);
      b.onclick = () => { $$('.item', items).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); };
      b.ondblclick = () => openFile(n);
      b.onkeydown = e => { if (e.key === 'Enter') openFile(n); };
      items.append(b);
    });
    if (!items.children.length) items.append(h('<p class="p">This folder is empty.</p>'));
    $('.hint', body).textContent = d === 'Downloads' ? 'Double-click SetupMyApp.exe or PuzzleGame.apk to see how Dex OS handles them.' : '';
  };
  go(dir);
}

function textApp(body, w, arg) {
  const text = 'Trip notes\n\n- Pack the charger\n- Download the boarding pass\n- Ask Sam about the car\n\nYou can edit this, but the demo forgets it when you close the window.';
  body.innerHTML = `<div class="notes"><textarea aria-label="Text"></textarea></div>`;
  $('textarea', body).value = text;
}

function galleryApp(body) {
  body.innerHTML = `<div class="gal"></div><p class="p" style="padding:0 16px 14px">Click a picture to use it as your wallpaper.</p>`;
  const g = $('.gal', body);
  WALLS.forEach(wl => {
    const b = h(`<button aria-label="Use as wallpaper"><img alt="" loading="lazy" src="${wallUrl(wl.id)}"></button>`);
    b.onclick = () => { setWall(wl.id); toast('gallery', 'Wallpaper set', 'Nice pick.'); };
    g.append(b);
  });
}

/* Dex Store: apps come from Flathub on the real thing */
function storeApp(body) {
  const apps = [
    ['Firefox', 'Web browser', 'ph-globe', '#ff7139'], ['VLC', 'Plays any video', 'ph-play', '#f08c1e'], ['GIMP', 'Photo editing', 'ph-paint-brush', '#7d6b5c'],
    ['LibreOffice', 'Documents and spreadsheets', 'ph-file-doc', '#18a303'], ['OBS Studio', 'Record and stream', 'ph-record', '#302e31'], ['Blender', '3D modelling', 'ph-cube', '#e87d0d'],
    ['Discord', 'Chat with friends', 'ph-chats-circle', '#5865f2'], ['Spotify', 'Music', 'ph-music-notes', '#1db954'],
  ];
  body.innerHTML = `<div class="pad store"><h2 class="h1" style="font-size:24px">Popular apps</h2>
    <p class="p">Dex Store gets its desktop apps from Flathub, and it handles Android apps too. Installing is pretend in this demo.</p>
    <div class="grid"></div></div>`;
  const g = $('.grid', body);
  apps.forEach(([n, d, ic, col]) => {
    const it = h(`<div class="it"><span class="av" style="background:${col}"><i class="ph ${ic}"></i></span><div><b>${n}</b><small>${d}</small></div><button>Install</button></div>`);
    const b = $('button', it);
    b.onclick = () => {
      if (b.classList.contains('done')) return;
      let p = 0; b.disabled = true;
      const iv = setInterval(() => {
        p += 12 + Math.random() * 18;
        if (p >= 100) { clearInterval(iv); b.textContent = 'Open'; b.classList.add('done'); b.disabled = false; toast('store', `${n} is installed`, "Well, it would be. This is the demo."); }
        else b.textContent = Math.round(p) + '%';
      }, 260);
    };
    g.append(it);
  });
}

/* Tips */
function tipsApp(body) {
  const tips = [
    ['ph-cursor-click', 'Quick panel', 'Click the icons in the top-right corner for Wi-Fi, dark mode, eye comfort and the rest.'],
    ['ph-squares-four', 'All your apps', 'The Dex button at the left of the taskbar opens every app. Start typing to find one.'],
    ['ph-windows-logo', 'Windows programs', 'Open My Files, go to Downloads and double-click SetupMyApp.exe.'],
    ['ph-terminal-window', 'A terminal, if you want one', 'Open Dex-Top and type dexfetch. You never need it for everyday things.'],
    ['ph-palette', 'Make it yours', 'Settings > Wallpaper and style has the wallpapers. Gallery can set one too.'],
    ['ph-lock', 'Lock the screen', 'The power button at the top of the quick panel locks it. Any key unlocks it again.'],
  ];
  body.innerHTML = `<div class="pad tips"><h2 class="h1" style="font-size:24px">Things to try</h2>${tips.map(([i, t, p]) => `<div class="tip"><i class="ph ${i}"></i><div><b>${t}</b><p>${p}</p></div></div>`).join('')}</div>`;
}

/* Dexter, with a few canned answers */
const DEXTER = [
  [/windows|\.exe|\bexe\b/i, "Windows programs open with a double-click. Dex OS runs them in a small copy of Windows that stays out of sight, and each one shows up as its own window."],
  [/android|apk/i, 'Android apps work too. Double-click an .apk and it installs and opens in its own window.'],
  [/steam|game|gaming|nvidia|gpu/i, "Steam comes installed, and so does the NVIDIA driver, so you can sign in and start downloading your games."],
  [/update|roll ?back|break|broke/i, "If your PC doesn't start right after an update, Dex OS goes back to the last version that worked, by itself."],
  [/free|cost|price|pay|money/i, "It's free."],
  [/install|usb|download|get it|try/i, "You write Dex OS to a USB stick, start your PC from it, and try it without installing anything. It's still an early preview, so the download isn't public yet."],
  [/fedora|linux|rust|made|built/i, 'Dex OS is built on Fedora Linux. The desktop and most of the apps are written from scratch in Rust.'],
  [/wallpaper|dark|theme|colou?r/i, 'Open Settings and go to Wallpaper and style. Dark mode is also in the quick panel, in the top-right corner.'],
  [/privacy|track|data|ads?\b/i, "No ads, and nothing about you gets sent anywhere unless you choose to."],
  [/^(hi|hey|hello|yo|sup)\b/i, 'Hi! Ask me about Windows apps, Android apps, gaming, updates or installing.'],
];
function dexterApp(body, w, arg) {
  body.innerHTML = `<div class="chat"><div class="log"></div>
    <div class="chips2"><button>Can it run Windows apps?</button><button>What about games?</button><button>What if an update breaks?</button><button>How do I install it?</button></div>
    <form class="pill-input"><input type="text" placeholder="Ask Dexter..." aria-label="Message" autocomplete="off"><button class="send" aria-label="Send"><i class="ph-fill ph-paper-plane-tilt"></i></button></form></div>`;
  const log = $('.log', body), inp = $('input', body);
  const say = (who, text) => { log.append(h(`<div class="msg ${who}">${esc(text)}</div>`)); log.scrollTop = log.scrollHeight; };
  const ask = q => {
    if (!q) return;
    say('me', q);
    const hit = DEXTER.find(([re]) => re.test(q));
    setTimeout(() => say('bot', hit ? hit[1] : "I'm only a stand-in in this demo, so I don't know much. Try asking about Windows apps, Android apps, gaming, updates or installing."), 450);
  };
  say('bot', "Hi, I'm Dexter. In this demo I only know a few things about Dex OS, so ask away and I'll do my best.");
  $$('.chips2 button', body).forEach(b => b.onclick = () => ask(b.textContent));
  $('form', body).onsubmit = e => { e.preventDefault(); const q = inp.value.trim(); inp.value = ''; ask(q); };
  if (arg) ask(arg);
  w.onArg = q => q && ask(q);
  setTimeout(() => inp.focus(), 60);
}

/* Dex-Top: a pretend terminal */
function termApp(body, w) {
  body.innerHTML = `<div class="term"><pre class="out"></pre><div class="ln"><span class="pr">ada@dexos:~$ </span><input aria-label="Command" autocomplete="off" spellcheck="false"></div></div>`;
  const out = $('.out', body), inp = $('input', body), term = $('.term', body);
  const print = html => { out.innerHTML += html + '\n'; term.scrollTop = term.scrollHeight; };
  const hist = []; let hi = 0;
  const cmds = {
    help: () => 'Try: <span class="g">dexfetch</span>, ls, whoami, date, uname -a, echo, open &lt;app&gt;, clear',
    dexfetch: () => {
      const d = new Date();
      return `<span class="b">  ██  █████▄   </span>  <span class="m">ada</span>@<span class="m">dexos</span>
<span class="b">  ██       ██  </span>  -----------
<span class="b">  ██       ██  </span>  <span class="b">OS</span>: Dex OS 0.1 "Sphynx" (Fedora 44 base)
<span class="b">  ██       ██  </span>  <span class="b">Kernel</span>: 7.3.3
<span class="b">  ██  █████▀   </span>  <span class="b">Desktop</span>: Dex shell (Rust)
                   <span class="b">Host</span>: your web browser
                   <span class="b">Wallpaper</span>: ${esc(S.wall)}
                   <span class="b">Time</span>: ${d.toLocaleTimeString('en-US')}`;
    },
    ls: () => '<span class="b">Desktop  Documents  Downloads  Music  Pictures  Videos</span>',
    pwd: () => '/home/ada',
    whoami: () => 'ada',
    date: () => new Date().toString(),
    uname: a => a.includes('-a') ? 'Linux dexos 7.3.3-200.fc44.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' : 'Linux',
    echo: a => esc(a.join(' ')),
    clear: () => { out.innerHTML = ''; return null; },
    sudo: () => 'Nice try. This terminal lives in a web browser.',
    exit: () => { setTimeout(() => close('terminal'), 100); return null; },
    open: a => { const q = a.join(' ').toLowerCase(); const app = APPS.find(x => !x.hidden && (x.id === q || x.name.toLowerCase() === q)); if (app) { open(app.id); return `Opening ${esc(app.name)}...`; } return `No app called "${esc(q)}".`; },
  };
  print('Dex-Top, the Dex OS terminal. This one is pretend. Type <span class="g">help</span>.');
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { if (hi > 0) inp.value = hist[--hi]; e.preventDefault(); return; }
    if (e.key === 'ArrowDown') { inp.value = hi < hist.length - 1 ? hist[++hi] : (hi = hist.length, ''); e.preventDefault(); return; }
    if (e.key !== 'Enter') return;
    const line = inp.value; inp.value = '';
    if (line.trim()) { hist.push(line); hi = hist.length; }
    print(`<span class="pr">ada@dexos:~$ </span>${esc(line)}`);
    const [c, ...args] = line.trim().split(/\s+/);
    if (!c) return;
    const f = cmds[c];
    const r = f ? f(args) : `${esc(c)}: not in this demo. Type <span class="g">help</span> to see what works.`;
    if (r !== null && r !== undefined) print(r);
  });
  term.addEventListener('click', () => inp.focus());
  setTimeout(() => inp.focus(), 60);
}

/* ---------- Start ---------- */
screen.classList.toggle('light', S.light);
applyWall();
buildHome();
buildQp();
renderDock();
sync();
tick();
setInterval(tick, 1000);
fit();
$('#lock').focus({ preventScroll: true });
})();
