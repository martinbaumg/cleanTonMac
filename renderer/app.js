'use strict';

const api = window.menage;

// ------------------------------------------------------------------- icônes

const ICONS = {
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  logs: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  ghost: '<path d="M9 10h.01M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  drive: '<path d="M22 12H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01M10 16h.01"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};
const icon = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

// --------------------------------------------------------------- formatage

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

function fmtSize(b) {
  if (b == null) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  let v = b;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) { v /= 1000; i++; }
  return `${i === 0 ? Math.round(v) : nf1.format(v)} ${units[i]}`;
}

function fmtAgo(ms) {
  if (!ms) return '—';
  const days = (Date.now() - ms) / 86400000;
  if (days < 1) return "aujourd'hui";
  if (days < 30) return rtf.format(-Math.round(days), 'day');
  if (days < 365) return rtf.format(-Math.round(days / 30.4), 'month');
  return rtf.format(-Math.round(days / 365), 'year');
}

let HOME = '';
const tilde = (p) => (HOME && p.startsWith(HOME) ? '~' + p.slice(HOME.length) : p);
const underHome = (p) => p === HOME || p.startsWith(HOME + '/');
const sum = (items) => items.reduce((a, i) => a + (i.size || 0), 0);

/** Retire les éléments contenus dans un autre élément de la liste (évite de compter deux fois). */
function dedupeNested(items) {
  const kept = [];
  for (const it of [...items].sort((a, b) => a.path.length - b.path.length)) {
    if (!kept.some((k) => it.path === k.path || it.path.startsWith(k.path + '/'))) kept.push(it);
  }
  return kept;
}

// ------------------------------------------------------------------ données

const CATS = [
  { id: 'caches', label: 'Caches des apps', icon: 'layers',
    desc: 'Fichiers temporaires que les applications recréent toutes seules quand elles en ont besoin.' },
  { id: 'logs', label: 'Journaux', icon: 'logs',
    desc: 'Fichiers de log et rapports de plantage. Ils ne servent qu\'à déboguer.' },
  { id: 'dev', label: 'Caches développeur', icon: 'terminal',
    desc: 'Caches npm, pip, uv, Maven, Xcode… Ils sont re-téléchargés automatiquement au besoin.' },
  { id: 'ai', label: 'Modèles IA', icon: 'cpu',
    desc: 'Modèles téléchargés via Hugging Face, Ollama, LM Studio, Whisper… Souvent plusieurs Go chacun.',
    note: 'Un modèle supprimé sera simplement re-téléchargé si une app en a de nouveau besoin.' },
  { id: 'orphans', label: "Restes d'apps", icon: 'ghost',
    desc: 'Données laissées par des applications qui ne sont plus installées.',
    note: 'Détection automatique par comparaison avec tes apps installées : vérifie chaque ligne avant de supprimer. Les éléments modifiés récemment appartiennent peut-être à une app encore utilisée.' },
  { id: 'downloads', label: 'Téléchargements', icon: 'download',
    desc: 'Le contenu de ton dossier Téléchargements. Les installateurs (.dmg, .pkg) ne servent plus une fois l\'app installée.' },
  { id: 'large', label: 'Gros fichiers', icon: 'drive',
    desc: 'Fichiers de plus de 200 Mo dans ton dossier personnel (hors Bibliothèque et dossiers cachés).' },
  { id: 'projects', label: 'Projets dev', icon: 'package',
    desc: 'node_modules, environnements Python, dossiers de build… Réinstallables en une commande (npm install, uv sync…).' },
];
const CAT_BY_ID = Object.fromEntries(CATS.map((c) => [c.id, c]));

const TAGS = {
  orphan: ['violet', 'App désinstallée'],
  missing: ['violet', 'Programme introuvable'],
  recent: ['warn', 'Utilisé récemment'],
  old: ['muted', 'Ancien'],
  inactive: ['muted', 'Projet inactif'],
  installer: ['blue', 'Installateur'],
};

const state = {
  view: 'dashboard',
  info: null,
  trash: null,
  results: {},             // catégorie -> { status, items, error }
  selection: new Map(),    // chemin -> élément
  filters: {},
  sort: { key: 'size', dir: -1 },
  apps: { status: 'idle', items: [], filter: '', sort: 'size' },
  explorer: { dir: null, items: null, token: 0, showHidden: true, error: null },
};

let lookup = new Map();    // chemin -> élément affiché dans la vue courante
const sizeCache = new Map();

// ------------------------------------------------------------------ actions

async function refreshInfo() {
  const [info, trash] = await Promise.all([api.systemInfo(), api.trashInfo()]);
  state.info = info;
  state.trash = trash;
  render();
}

async function scanCat(id) {
  const prev = state.results[id];
  state.results[id] = { status: 'scanning', items: prev ? prev.items : [] };
  render();
  try {
    state.results[id] = { status: 'done', items: await api.scan(id) };
  } catch (e) {
    state.results[id] = { status: 'error', items: [], error: e.message };
  }
  // Garder la sélection alignée sur les nouveaux objets
  for (const it of state.results[id].items) if (state.selection.has(it.path)) state.selection.set(it.path, it);
  render();
}

const scanAll = () => Promise.all(CATS.map((c) => scanCat(c.id)));

function allFound() {
  const byPath = new Map();
  for (const c of CATS) for (const it of state.results[c.id]?.items || []) byPath.set(it.path, it);
  return [...byPath.values()];
}

function selectSafe() {
  const safe = allFound().filter((i) => i.risk === 'safe' && !i.tags.includes('recent'));
  for (const it of safe) state.selection.set(it.path, it);
  render();
  toast(`${plural(safe.length, 'élément')} sans risque sélectionnés. Vérifie puis clique sur « Mettre à la corbeille ».`);
}

async function trashItems(items, { confirm = true } = {}) {
  const list = dedupeNested(items);
  if (!list.length) return null;
  const total = sum(list);
  if (confirm) {
    const ok = await confirmModal({
      title: `Mettre ${plural(list.length, 'élément')} à la corbeille ?`,
      body: `<p><strong>${fmtSize(total)}</strong> vont être déplacés dans la Corbeille. Tu pourras les récupérer tant qu'elle n'est pas vidée.</p>${itemsListHtml(list)}`,
      confirm: 'Mettre à la corbeille',
      danger: true,
    });
    if (!ok) return null;
  }
  const res = await api.trash(list.map((i) => i.path));
  const doneSet = new Set(res.done);
  const freed = sum(list.filter((i) => doneSet.has(i.path)));
  applyRemoval(res.done);
  refreshInfo();
  if (state.view === 'explorer' && state.explorer.dir) openDir(state.explorer.dir);
  if (res.done.length) {
    toast(`${fmtSize(freed)} déplacés dans la Corbeille. Vide-la pour récupérer l'espace.`,
      { label: 'Vider la corbeille', fn: emptyTrash });
  }
  if (res.failed.length) showFailures(res.failed);
  return res;
}

function applyRemoval(done) {
  if (!done.length) return;
  const gone = (p) => done.some((d) => p === d || p.startsWith(d + '/'));
  for (const r of Object.values(state.results)) r.items = r.items.filter((i) => !gone(i.path));
  for (const p of [...state.selection.keys()]) if (gone(p)) state.selection.delete(p);
  state.apps.items = state.apps.items.filter((a) => !gone(a.path));
  for (const p of [...sizeCache.keys()]) {
    if (gone(p) || done.some((d) => d.startsWith(p + '/'))) sizeCache.delete(p);
  }
  render();
}

async function emptyTrash() {
  const size = state.trash?.size;
  const ok = await confirmModal({
    title: 'Vider la Corbeille ?',
    body: `<p>${size != null ? `<strong>${fmtSize(size)}</strong> seront supprimés` : 'Tout son contenu sera supprimé'} définitivement. Cette action est irréversible.</p><p>macOS peut te demander d'autoriser Ménage à piloter le Finder la première fois.</p>`,
    confirm: 'Vider la corbeille',
    danger: true,
  });
  if (!ok) return;
  toast('Vidage de la Corbeille…');
  const r = await api.emptyTrash();
  toast(r.ok ? 'Corbeille vidée : l\'espace est libéré.' : `Impossible de vider la Corbeille : ${r.error}`);
  refreshInfo();
}

async function loadApps() {
  state.apps.status = 'loading';
  render();
  try {
    state.apps.items = await api.listApps();
    state.apps.status = 'done';
  } catch (e) {
    state.apps.status = 'error';
    state.apps.error = e.message;
  }
  render();
}

async function openDir(dir) {
  const ex = state.explorer;
  const token = ++ex.token;
  if (ex.dir !== dir) ex.items = null;
  ex.dir = dir;
  ex.error = null;
  state.view = 'explorer';
  render();

  let items;
  try {
    items = await api.listDir(dir);
  } catch (e) {
    if (token === ex.token) { ex.error = e.message; ex.items = []; render(); }
    return;
  }
  if (token !== ex.token) return;
  for (const it of items) if (it.isDir && sizeCache.has(it.path)) it.size = sizeCache.get(it.path);
  ex.items = items;
  render();

  // Tailles des dossiers calculées progressivement, abandonnées si on change de dossier.
  const pending = items.filter((i) => i.isDir && i.size == null);
  let next = 0;
  const worker = async () => {
    while (next < pending.length && token === ex.token) {
      const it = pending[next++];
      const size = await api.size(it.path);
      sizeCache.set(it.path, size);
      if (token !== ex.token) return;
      it.size = size;
      const sel = state.selection.get(it.path);
      if (sel) sel.size = size;
      scheduleRender();
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

let renderTimer = null;
function scheduleRender() {
  if (renderTimer) return;
  renderTimer = setTimeout(() => { renderTimer = null; render(); }, 150);
}

function setView(id) {
  state.view = id;
  if (CAT_BY_ID[id] && !state.results[id]) scanCat(id);
  if (id === 'apps' && state.apps.status === 'idle') loadApps();
  if (id === 'explorer' && !state.explorer.dir) { openDir(HOME); return; }
  render();
}

function toggle(p) {
  const it = lookup.get(p);
  if (!it || it.protected) return;
  if (state.selection.has(p)) state.selection.delete(p);
  else state.selection.set(p, it);
  const row = [...document.querySelectorAll('#view .row[data-path]')].find((r) => r.dataset.path === p);
  if (row) {
    const on = state.selection.has(p);
    row.classList.toggle('is-selected', on);
    const box = row.querySelector('input[type=checkbox]');
    if (box) box.checked = on;
  }
  renderActionBar();
}

// ------------------------------------------------------------------- rendu

const NAV = [
  { items: [{ id: 'dashboard', label: 'Tableau de bord', icon: 'gauge' }] },
  { group: 'Nettoyage', items: CATS },
  { group: 'Outils', items: [
    { id: 'apps', label: 'Applications', icon: 'grid' },
    { id: 'explorer', label: 'Explorateur', icon: 'folder' },
  ] },
];

function renderNav() {
  $('#nav').innerHTML = NAV.map((g) => `
    ${g.group ? `<div class="nav-group">${g.group}</div>` : ''}
    ${g.items.map((it) => {
      const r = state.results[it.id];
      let meta = '';
      if (r?.status === 'scanning') meta = '<span class="spinner sm"></span>';
      else if (r?.status === 'done') meta = `<span class="meta">${fmtSize(sum(r.items))}</span>`;
      return `<button class="nav-item ${state.view === it.id ? 'active' : ''}" data-view="${it.id}">
        ${icon(it.icon)}<span class="label">${it.label}</span>${meta}</button>`;
    }).join('')}`).join('');

  const d = state.info?.disk;
  $('#side-foot').innerHTML = d ? `
    <div>${icon('drive', 'sm')} Macintosh HD</div>
    <div class="disk-mini"><b style="width:${((d.total - d.free) / d.total) * 100}%"></b></div>
    <div>${fmtSize(d.free)} disponibles sur ${fmtSize(d.total)}</div>` : '';
}

function renderActionBar() {
  const bar = $('#actionbar');
  const list = dedupeNested([...state.selection.values()]);
  if (!list.length) { bar.hidden = true; return; }
  const pending = list.some((i) => i.size == null);
  bar.hidden = false;
  bar.innerHTML = `
    <div class="sum"><strong>${fmtSize(sum(list))}${pending ? '+' : ''}</strong> sélectionnés · ${plural(list.length, 'élément')}</div>
    <div class="spacer"></div>
    <button class="btn ghost" data-act="clear-selection">Tout désélectionner</button>
    <button class="btn danger" data-act="trash-selection">${icon('trash', 'sm')} Mettre à la corbeille</button>`;
}

let lastViewKey = '';
function renderView() {
  const view = $('#view');
  const key = state.view === 'explorer' ? `explorer:${state.explorer.dir}` : state.view;
  const scroll = key === lastViewKey ? view.scrollTop : 0;
  const focused = document.activeElement?.id;
  const caret = document.activeElement?.selectionStart;
  lookup = new Map();

  if (state.view === 'dashboard') view.innerHTML = viewDashboard();
  else if (state.view === 'apps') view.innerHTML = viewApps();
  else if (state.view === 'explorer') view.innerHTML = viewExplorer();
  else view.innerHTML = viewCategory(CAT_BY_ID[state.view]);

  view.scrollTop = scroll;
  lastViewKey = key;
  if (focused) {
    const el = document.getElementById(focused);
    if (el) { el.focus(); if (caret != null && el.setSelectionRange) el.setSelectionRange(caret, caret); }
  }
}

function render() {
  renderNav();
  renderView();
  renderActionBar();
}

// ------------------------------------------------------------ vue : accueil

function ring(used, total) {
  const pct = total ? used / total : 0;
  const r = 46;
  const c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 112 112">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent-2)"/>
    </linearGradient></defs>
    <circle class="track" cx="56" cy="56" r="${r}" fill="none" stroke-width="11"/>
    <circle cx="56" cy="56" r="${r}" fill="none" stroke="url(#rg)" stroke-width="11" stroke-linecap="round"
      stroke-dasharray="${c * pct} ${c}" transform="rotate(-90 56 56)"/>
    <text x="56" y="58" text-anchor="middle" font-size="21">${Math.round(pct * 100)} %</text>
    <text class="sub" x="56" y="75" text-anchor="middle" font-size="11">utilisé</text>
  </svg>`;
}

function viewDashboard() {
  const d = state.info?.disk;
  const scanning = CATS.some((c) => state.results[c.id]?.status === 'scanning');
  const scanned = CATS.some((c) => state.results[c.id]?.status === 'done');
  const all = dedupeNested(allFound());
  const safe = all.filter((i) => i.risk === 'safe' && !i.tags.includes('recent'));

  const hero = `
    <section class="hero">
      <div class="disk">
        ${d ? ring(d.total - d.free, d.total) : ''}
        <div>
          <h1>Ton Mac</h1>
          ${d ? `<p>${fmtSize(d.total - d.free)} utilisés sur ${fmtSize(d.total)}</p>
          <div class="legend"><span><i style="background:var(--accent)"></i>Utilisé</span>
          <span><i style="background:var(--line-strong)"></i>${fmtSize(d.free)} libres</span></div>` : ''}
        </div>
      </div>
      <div class="hero-cta">
        <div class="found">
          <span>Espace récupérable trouvé</span>
          <strong>${scanned || scanning ? fmtSize(sum(all)) : '—'}</strong>
          <small>${scanned ? `dont ${fmtSize(sum(safe))} sans risque` : 'Lance une analyse pour commencer'}</small>
        </div>
        <div class="actions">
          ${safe.length ? `<button class="btn big" data-act="select-safe">${icon('check', 'sm')} Sélectionner le sans-risque</button>` : ''}
          <button class="btn big primary" data-act="scan-all" ${scanning ? 'disabled' : ''}>
            ${scanning ? '<span class="spinner sm"></span> Analyse…' : `${icon('sparkles', 'sm')} ${scanned ? 'Relancer' : 'Lancer l\'analyse'}`}
          </button>
        </div>
      </div>
    </section>`;

  const fda = state.info && !state.info.fda ? `
    <div class="callout info">${icon('shield')}
      <div><strong>Accès complet au disque désactivé.</strong> Ménage fonctionne, mais certaines tailles
      (Corbeille, données protégées des apps) seront incomplètes. Autorise le Terminal (ou Ménage) dans
      Réglages › Confidentialité et sécurité › Accès complet au disque.</div>
      <button class="btn" data-act="fda">Ouvrir les réglages</button>
    </div>` : '';

  const cards = CATS.map((c) => {
    const r = state.results[c.id];
    const size = r?.status === 'done' ? fmtSize(sum(r.items)) : r?.status === 'scanning' ? '<span class="spinner"></span>' : '—';
    const foot = r?.status === 'done' ? plural(r.items.length, 'élément') : r?.status === 'error' ? 'Erreur' : r?.status === 'scanning' ? 'Analyse…' : 'Pas encore analysé';
    return `<button class="card" data-view="${c.id}">
      <div class="card-top"><div class="view-icon">${icon(c.icon)}</div><div class="card-title">${c.label}</div></div>
      <div class="card-size ${r?.status === 'done' ? '' : 'idle'}">${size}</div>
      <div class="card-foot"><span>${foot}</span>${icon('chevron', 'sm')}</div>
    </button>`;
  }).join('');

  const t = state.trash;
  const trashSize = t == null ? '<span class="spinner"></span>' : t.accessible ? fmtSize(t.size) : 'Accès restreint';
  const tools = `
    <button class="card" data-view="apps">
      <div class="card-top"><div class="view-icon">${icon('grid')}</div><div class="card-title">Applications</div></div>
      <div class="card-foot"><span>Désinstaller une app et tous ses fichiers</span>${icon('chevron', 'sm')}</div>
    </button>
    <button class="card" data-view="explorer">
      <div class="card-top"><div class="view-icon">${icon('folder')}</div><div class="card-title">Explorateur</div></div>
      <div class="card-foot"><span>Fouiller tes dossiers, triés par taille</span>${icon('chevron', 'sm')}</div>
    </button>
    <div class="card trash">
      <div class="card-top"><div class="view-icon">${icon('trash')}</div><div class="card-title">Corbeille</div></div>
      <div class="card-size ${t?.accessible ? '' : 'idle'}" style="${t?.accessible ? '' : 'font-size:15px'}">${trashSize}</div>
      <div class="card-foot"><span>L'espace n'est libéré qu'une fois vidée</span>
        <button class="btn" data-act="empty-trash">Vider</button></div>
    </div>`;

  return `${hero}${fda}
    <div class="section-title">Nettoyage</div><div class="cards">${cards}</div>
    <div class="section-title">Outils</div><div class="cards">${tools}</div>`;
}

// -------------------------------------------------------- vue : catégorie

function badgesHtml(it) {
  const out = [];
  if (it.risk === 'safe' && !it.tags.includes('recent')) out.push('<span class="badge ok">Sans risque</span>');
  for (const t of it.tags || []) if (TAGS[t]) out.push(`<span class="badge ${TAGS[t][0]}">${TAGS[t][1]}</span>`);
  return out.join('');
}

function subOf(it) {
  const parts = [it.location, it.cat === 'large' ? null : it.note, tilde(it.path)].filter(Boolean);
  return parts.join(' · ');
}

function rowHtml(it, max, { lead = '', sub, nameHtml } = {}) {
  lookup.set(it.path, it);
  const sel = state.selection.has(it.path);
  const pct = it.size == null ? 0 : Math.max(1.5, (it.size / max) * 100);
  const actions = [
    it.isDir && underHome(it.path) && state.view !== 'explorer'
      ? `<button class="icon-btn" data-act="explore" title="Ouvrir dans l'explorateur">${icon('folder', 'sm')}</button>` : '',
    `<button class="icon-btn" data-act="reveal" title="Afficher dans le Finder">${icon('search', 'sm')}</button>`,
  ].join('');
  return `<div class="row ${sel ? 'is-selected' : ''} ${it.protected ? 'is-protected' : ''}" data-path="${esc(it.path)}"
      ${it.protected ? `title="${esc(it.protected)}"` : ''}>
    <span class="check"><input type="checkbox" data-act="toggle" ${sel ? 'checked' : ''} ${it.protected ? 'disabled' : ''}></span>
    <div class="row-main">${lead}<div>
      <div class="row-title">${nameHtml || `<span class="name">${esc(it.label || it.name)}</span>`}${badgesHtml(it)}</div>
      <div class="row-sub" title="${esc(it.path)}">${esc(sub ?? subOf(it))}</div>
    </div></div>
    <div class="row-date" title="${it.mtime ? new Date(it.mtime).toLocaleString('fr-FR') : ''}">${fmtAgo(it.mtime)}</div>
    <div class="row-size">${it.size == null ? '<span class="spinner sm"></span>' : fmtSize(it.size)}<i class="bar"><b style="width:${pct}%"></b></i></div>
    <div class="row-actions">${actions}</div>
  </div>`;
}

function sortHead(label, key, align = '') {
  const s = state.sort;
  const arrow = s.key === key ? (s.dir > 0 ? ' ↑' : ' ↓') : '';
  return `<div class="sortable ${s.key === key ? 'sorted' : ''}" data-act="sort" data-key="${key}" style="${align}">${label}${arrow}</div>`;
}

function headRow(dateLabel = 'Modifié') {
  return `<div class="row row-head"><span></span>${sortHead('Nom', 'name')}${sortHead(dateLabel, 'mtime')}${sortHead('Taille', 'size', 'text-align:right')}<span></span></div>`;
}

function sortItems(items) {
  const { key, dir } = state.sort;
  return items.sort((a, b) => {
    if (key === 'name') return dir * String(a.label || a.name).localeCompare(String(b.label || b.name), 'fr');
    return dir * ((a[key] ?? -1) - (b[key] ?? -1));
  });
}

function matches(it, q) {
  if (!q) return true;
  const hay = `${it.label || ''} ${it.name} ${it.path} ${it.note || ''} ${it.location || ''}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}

function visibleItems(id) {
  const r = state.results[id];
  return sortItems((r?.items || []).filter((i) => matches(i, state.filters[id])));
}

function emptyHtml(ic, title, text = '') {
  return `<div class="empty">${icon(ic)}<strong>${title}</strong>${text}</div>`;
}

function catListHtml(cat) {
  const r = state.results[cat.id];
  const items = visibleItems(cat.id);
  if (!items.length) {
    if (r?.status === 'scanning') return `<div class="list"><div class="empty"><span class="spinner"></span><strong style="margin-top:10px">Analyse en cours…</strong></div></div>`;
    if (r?.status === 'error') return `<div class="list">${emptyHtml('alert', 'L\'analyse a échoué', esc(r.error))}</div>`;
    return `<div class="list">${emptyHtml('check', state.filters[cat.id] ? 'Aucun résultat' : 'Rien à nettoyer ici', state.filters[cat.id] ? '' : 'Cette catégorie est propre.')}</div>`;
  }
  const max = Math.max(...items.map((i) => i.size || 0), 1);
  return `<div class="list">${headRow(cat.id === 'projects' ? 'Activité' : 'Modifié')}${items.map((it) => rowHtml(it, max)).join('')}</div>`;
}

function catStatsHtml(cat) {
  const r = state.results[cat.id];
  if (!r || r.status === 'scanning') return '<span class="spinner"></span>';
  const items = visibleItems(cat.id);
  return `<span class="big">${fmtSize(sum(dedupeNested(items)))}</span><small>${plural(items.length, 'élément')}</small>`;
}

function viewCategory(cat) {
  const scanning = state.results[cat.id]?.status === 'scanning';
  return `
    <header class="view-head">
      <div class="view-icon">${icon(cat.icon, 'lg')}</div>
      <div><h1>${cat.label}</h1><p>${cat.desc}</p></div>
      <div class="head-stats" id="head-stats">${catStatsHtml(cat)}</div>
    </header>
    ${cat.note ? `<div class="callout">${icon('info')}<div>${cat.note}</div></div>` : ''}
    <div class="toolbar">
      <label class="search">${icon('search', 'sm')}<input id="filter" type="search" placeholder="Filtrer…" value="${esc(state.filters[cat.id] || '')}"></label>
      <div class="spacer"></div>
      <button class="btn ghost" data-act="select-visible">Tout sélectionner</button>
      <button class="btn ghost" data-act="unselect-visible">Tout désélectionner</button>
      <button class="btn" data-act="scan" data-cat="${cat.id}" ${scanning ? 'disabled' : ''}>${icon('refresh', 'sm')} Réanalyser</button>
    </div>
    <div id="list-wrap">${catListHtml(cat)}</div>`;
}

// ------------------------------------------------------------- vue : apps

function viewApps() {
  const a = state.apps;
  const q = a.filter.toLowerCase();
  const items = a.items.filter((x) => !q || `${x.name} ${x.id}`.toLowerCase().includes(q));
  const sorters = {
    size: (x, y) => y.size - x.size,
    lastUsed: (x, y) => (x.lastUsed || 0) - (y.lastUsed || 0),
    name: (x, y) => x.name.localeCompare(y.name, 'fr'),
  };
  items.sort(sorters[a.sort]);

  let list;
  if (a.status === 'loading' && !a.items.length) list = `<div class="list"><div class="empty"><span class="spinner"></span><strong style="margin-top:10px">Inventaire des applications…</strong></div></div>`;
  else if (a.status === 'error') list = `<div class="list">${emptyHtml('alert', 'Impossible de lister les applications', esc(a.error))}</div>`;
  else if (!items.length) list = `<div class="list">${emptyHtml('grid', 'Aucune application')}</div>`;
  else {
    list = `<div class="list">
      <div class="row app-row row-head"><div>Application</div><div>Dernière utilisation</div><div style="text-align:right">Taille</div><div></div></div>
      ${items.map((x) => `
        <div class="row app-row" data-path="${esc(x.path)}">
          <div class="row-main">
            ${x.icon ? `<img class="app-ic" src="${x.icon}" alt="">` : `<span class="app-ic">${icon('grid', 'lg')}</span>`}
            <div><div class="row-title"><span class="name">${esc(x.name)}</span>${x.lastUsed && Date.now() - x.lastUsed > 180 * 86400000 ? '<span class="badge muted">Pas utilisée depuis 6 mois</span>' : ''}</div>
            <div class="row-sub">${esc([x.id, x.version && `v${x.version}`, tilde(x.path)].filter(Boolean).join(' · '))}</div></div>
          </div>
          <div class="row-date">${x.lastUsed ? fmtAgo(x.lastUsed) : 'Inconnue'}</div>
          <div class="row-size">${fmtSize(x.size)}</div>
          <div class="row-actions">
            <button class="icon-btn" data-act="reveal" title="Afficher dans le Finder">${icon('search', 'sm')}</button>
            <button class="btn" data-act="uninstall">Désinstaller…</button>
          </div>
        </div>`).join('')}
    </div>`;
  }

  return `
    <header class="view-head">
      <div class="view-icon">${icon('grid', 'lg')}</div>
      <div><h1>Applications</h1><p>Désinstalle une app avec ses caches, préférences et données : rien ne reste derrière.</p></div>
      <div class="head-stats">${a.status === 'done' ? `<span class="big">${fmtSize(sum(a.items))}</span><small>${plural(a.items.length, 'application')}</small>` : '<span class="spinner"></span>'}</div>
    </header>
    <div class="toolbar">
      <label class="search">${icon('search', 'sm')}<input id="app-filter" type="search" placeholder="Filtrer…" value="${esc(a.filter)}"></label>
      <select id="app-sort">
        <option value="size" ${a.sort === 'size' ? 'selected' : ''}>Trier par taille</option>
        <option value="lastUsed" ${a.sort === 'lastUsed' ? 'selected' : ''}>Les moins utilisées d'abord</option>
        <option value="name" ${a.sort === 'name' ? 'selected' : ''}>Trier par nom</option>
      </select>
      <div class="spacer"></div>
      <button class="btn" data-act="load-apps" ${a.status === 'loading' ? 'disabled' : ''}>${icon('refresh', 'sm')} Actualiser</button>
    </div>
    ${list}`;
}

async function uninstall(appPath) {
  const app = state.apps.items.find((x) => x.path === appPath);
  if (!app) return;
  const m = openModal({
    wide: true,
    title: `Désinstaller ${esc(app.name)}`,
    body: '<div class="empty"><span class="spinner"></span><strong style="margin-top:10px">Recherche des fichiers associés…</strong></div>',
  });

  const related = await api.relatedFiles(appPath);
  const entries = [{ path: app.path, name: `${app.name}.app`, size: app.size, location: 'Application', isDir: true, tags: [] }, ...related];
  const checked = new Set(entries.map((e) => e.path));

  const draw = () => {
    const chosen = entries.filter((e) => checked.has(e.path));
    m.body.innerHTML = `
      <p>L'application et les fichiers ci-dessous vont être déplacés dans la Corbeille.
      ${related.length ? '' : 'Aucun fichier associé trouvé dans ta Bibliothèque.'}</p>
      <div class="list">${entries.map((e) => `
        <div class="row ${checked.has(e.path) ? 'is-selected' : ''}" data-m="toggle" data-path="${esc(e.path)}">
          <span class="check"><input type="checkbox" ${checked.has(e.path) ? 'checked' : ''}></span>
          <div class="row-main"><div><div class="row-title"><span class="name">${esc(e.name)}</span></div>
            <div class="row-sub" title="${esc(e.path)}">${esc(`${e.location} · ${tilde(e.path)}`)}</div></div></div>
          <div class="row-size">${fmtSize(e.size)}</div>
        </div>`).join('')}
      </div>`;
    m.foot.innerHTML = `
      <div class="total">Total : <strong>${fmtSize(sum(chosen))}</strong></div>
      <button class="btn" data-m="cancel">Annuler</button>
      <button class="btn danger" data-m="go" ${chosen.length ? '' : 'disabled'}>${icon('trash', 'sm')} Désinstaller</button>`;
  };
  draw();

  m.el.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-m]');
    if (!t) return;
    if (t.dataset.m === 'toggle') {
      const p = t.dataset.path;
      if (checked.has(p)) checked.delete(p); else checked.add(p);
      draw();
    } else if (t.dataset.m === 'cancel') {
      m.close();
    } else if (t.dataset.m === 'go') {
      m.close();
      const res = await trashItems(entries.filter((x) => checked.has(x.path)), { confirm: false });
      if (res?.failed.some((f) => f.path === app.path)) {
        toast(`${app.name} n'a pas pu être supprimée : fais-la glisser dans la Corbeille depuis le Finder (mot de passe requis).`);
      }
    }
  });
}

// ------------------------------------------------------ vue : explorateur

function crumbsHtml(dir) {
  const rel = dir.slice(HOME.length).split('/').filter(Boolean);
  const out = [`<button data-act="open-dir" data-path="${esc(HOME)}">~</button>`];
  let acc = HOME;
  for (const part of rel) {
    acc += '/' + part;
    out.push(icon('chevron'), `<button data-act="open-dir" data-path="${esc(acc)}">${esc(part)}</button>`);
  }
  return `<div class="crumbs">${out.join('')}</div>`;
}

function viewExplorer() {
  const ex = state.explorer;
  const dir = ex.dir || HOME;
  const quick = [
    [HOME, 'Dossier personnel'], [`${HOME}/Library`, 'Bibliothèque'],
    [`${HOME}/Library/Application Support`, 'Application Support'], [`${HOME}/Library/Caches`, 'Caches'],
    [`${HOME}/.cache`, '~/.cache'], [`${HOME}/Downloads`, 'Téléchargements'], [`${HOME}/Documents`, 'Documents'],
  ];

  let list;
  if (ex.items == null) {
    list = `<div class="list"><div class="empty"><span class="spinner"></span></div></div>`;
  } else if (ex.error) {
    list = `<div class="list">${emptyHtml('alert', 'Impossible d\'ouvrir ce dossier', esc(ex.error))}</div>`;
  } else {
    const items = ex.items.filter((i) => ex.showHidden || !i.hidden);
    items.sort((a, b) => (b.size ?? -1) - (a.size ?? -1) || a.name.localeCompare(b.name, 'fr'));
    const max = Math.max(...items.map((i) => i.size || 0), 1);
    list = items.length ? `<div class="list">${headRow()}${items.map((it) => {
      const lead = `<span class="file-ic ${it.isDir ? 'dir' : ''}">${icon(it.isDir ? 'folder' : it.isLink ? 'link' : 'file')}</span>`;
      const nameHtml = it.isDir
        ? `<a href="#" class="name" data-act="open-dir" data-path="${esc(it.path)}">${esc(it.name)}</a>`
        : `<span class="name">${esc(it.name)}</span>`;
      const sub = [it.isDir ? 'Dossier' : it.isLink ? 'Lien symbolique' : 'Fichier', it.protected].filter(Boolean).join(' · ');
      return rowHtml(it, max, { lead, sub, nameHtml });
    }).join('')}</div>` : `<div class="list">${emptyHtml('folder', 'Dossier vide')}</div>`;
  }

  const loaded = ex.items && ex.items.every((i) => i.size != null);
  const total = ex.items ? sum(ex.items) : null;

  return `
    <header class="view-head">
      <div class="view-icon">${icon('folder', 'lg')}</div>
      <div><h1>Explorateur</h1><p>Parcours ton dossier personnel, trié par taille. Clique sur un dossier pour y entrer.</p></div>
      <div class="head-stats">${ex.items ? `<span class="big">${fmtSize(total)}${loaded ? '' : '+'}</span><small>${plural(ex.items.length, 'élément')}</small>` : '<span class="spinner"></span>'}</div>
    </header>
    <div class="chips">${quick.map(([p, l]) => `<button class="chip ${p === dir ? 'on' : ''}" data-act="open-dir" data-path="${esc(p)}">${l}</button>`).join('')}</div>
    <div class="toolbar">
      <button class="icon-btn" data-act="open-dir" data-path="${esc(dir === HOME ? HOME : dir.slice(0, dir.lastIndexOf('/')))}" title="Dossier parent" ${dir === HOME ? 'disabled' : ''}>${icon('up')}</button>
      ${crumbsHtml(dir)}
      <div class="spacer"></div>
      <button class="chip ${ex.showHidden ? 'on' : ''}" data-act="toggle-hidden">Éléments cachés</button>
      <button class="btn" data-act="reload-dir">${icon('refresh', 'sm')} Recalculer</button>
    </div>
    ${list}`;
}

// ------------------------------------------------------ modales et toasts

function openModal({ title, body = '', wide = false }) {
  const root = $('#modal-root');
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
    <div class="modal-head"><h2>${title}</h2></div>
    <div class="modal-body">${body}</div>
    <div class="modal-foot"></div></div>`;
  root.appendChild(backdrop);
  let closed = false;
  const m = {
    el: backdrop,
    body: $('.modal-body', backdrop),
    foot: $('.modal-foot', backdrop),
    onClose: null,
    close() {
      if (closed) return;
      closed = true;
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      if (m.onClose) m.onClose();
    },
  };
  const onKey = (e) => { if (e.key === 'Escape') m.close(); };
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) m.close(); });
  return m;
}

function confirmModal({ title, body, confirm = 'Confirmer', danger = false }) {
  return new Promise((resolve) => {
    const m = openModal({ title: esc(title), body });
    let result = false;
    m.onClose = () => resolve(result);
    m.foot.innerHTML = `<button class="btn" data-m="no">Annuler</button>
      <button class="btn ${danger ? 'danger' : 'primary'}" data-m="yes">${esc(confirm)}</button>`;
    m.foot.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      result = b.dataset.m === 'yes';
      m.close();
    });
    $('[data-m="yes"]', m.foot).focus();
  });
}

function itemsListHtml(list) {
  const shown = [...list].sort((a, b) => (b.size || 0) - (a.size || 0));
  return `<ul class="modal-list">${shown.map((i) =>
    `<li><span title="${esc(i.path)}">${esc(i.label || i.name)}</span><span>${fmtSize(i.size)}</span></li>`).join('')}</ul>`;
}

function showFailures(failed) {
  const m = openModal({
    title: `${plural(failed.length, 'élément')} non supprimé${failed.length > 1 ? 's' : ''}`,
    body: `<p>Ces éléments sont restés en place :</p><ul class="modal-list">${failed.map((f) =>
      `<li><span title="${esc(f.path)}">${esc(tilde(f.path))}</span><span>${esc(f.error)}</span></li>`).join('')}</ul>`,
  });
  m.foot.innerHTML = '<button class="btn primary" data-m="ok">OK</button>';
  m.foot.addEventListener('click', () => m.close());
}

function toast(message, action) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div>${esc(message)}</div>${action ? `<button class="btn">${esc(action.label)}</button>` : ''}`;
  if (action) $('button', el).addEventListener('click', () => { el.remove(); action.fn(); });
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), action ? 10000 : 5000);
}

// ---------------------------------------------------------- événements

document.addEventListener('click', async (e) => {
  if (e.target.closest('#modal-root')) return;

  const nav = e.target.closest('[data-view]');
  if (nav) { setView(nav.dataset.view); return; }

  const act = e.target.closest('[data-act]');
  const row = e.target.closest('.row[data-path]');
  const p = act?.dataset.path || row?.dataset.path;

  if (!act) {
    if (row && !row.classList.contains('app-row') && !row.classList.contains('row-head')) toggle(row.dataset.path);
    return;
  }
  if (act.tagName === 'A') e.preventDefault();

  switch (act.dataset.act) {
    case 'toggle': toggle(p); break;
    case 'reveal': api.reveal(p); break;
    case 'explore': openDir(p); break;
    case 'open-dir': openDir(p); break;
    case 'scan': scanCat(act.dataset.cat); break;
    case 'scan-all': scanAll(); break;
    case 'select-safe': selectSafe(); break;
    case 'fda': api.openFullDiskAccess(); break;
    case 'empty-trash': emptyTrash(); break;
    case 'load-apps': loadApps(); break;
    case 'uninstall': uninstall(p); break;
    case 'clear-selection': state.selection.clear(); render(); break;
    case 'trash-selection': trashItems([...state.selection.values()]); break;
    case 'toggle-hidden': state.explorer.showHidden = !state.explorer.showHidden; render(); break;
    case 'reload-dir':
      for (const k of [...sizeCache.keys()]) if (k.startsWith(state.explorer.dir + '/')) sizeCache.delete(k);
      openDir(state.explorer.dir);
      break;
    case 'sort': {
      const key = act.dataset.key;
      state.sort = state.sort.key === key ? { key, dir: -state.sort.dir } : { key, dir: key === 'name' ? 1 : -1 };
      render();
      break;
    }
    case 'select-visible':
    case 'unselect-visible':
      for (const it of lookup.values()) {
        if (it.protected) continue;
        if (act.dataset.act === 'select-visible') state.selection.set(it.path, it);
        else state.selection.delete(it.path);
      }
      render();
      break;
    default: break;
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'filter' && CAT_BY_ID[state.view]) {
    const cat = CAT_BY_ID[state.view];
    state.filters[cat.id] = e.target.value;
    lookup = new Map();
    $('#list-wrap').innerHTML = catListHtml(cat);
    $('#head-stats').innerHTML = catStatsHtml(cat);
  } else if (e.target.id === 'app-filter') {
    state.apps.filter = e.target.value;
    renderView();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'app-sort') { state.apps.sort = e.target.value; renderView(); }
});

// -------------------------------------------------------------- démarrage

(async function init() {
  state.info = await api.systemInfo();
  HOME = state.info.home;
  render();
  api.trashInfo().then((t) => { state.trash = t; render(); });
  scanAll();
})();
