'use strict';

// Moteur d'analyse : ne dépend pas d'Electron, testable avec `node`.

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

const HOME = os.homedir();
const H = (...p) => path.join(HOME, ...p);
const MB = 1000 * 1000;
const DAY = 24 * 3600 * 1000;

// ---------------------------------------------------------------- utilitaires

function run(cmd, args, { timeout = 0 } = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { maxBuffer: 256 * 1024 * 1024, timeout, encoding: 'utf8' },
      (err, stdout, stderr) => resolve({ err, stdout: stdout || '', stderr: stderr || '' }));
  });
}

function limiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || !queue.length) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => { active--; next(); });
  };
  return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
}

const duLimit = limiter(6);
const cmdLimit = limiter(8);

async function lstat(p) { try { return await fsp.lstat(p); } catch { return null; } }
async function readdir(p) { try { return await fsp.readdir(p, { withFileTypes: true }); } catch { return []; } }
const exists = async (p) => !!(await lstat(p));
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const decodeXml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** Taille réellement occupée sur le disque (octets). */
async function sizeOf(p) {
  const st = await lstat(p);
  if (!st) return 0;
  if (!st.isDirectory()) return st.blocks ? st.blocks * 512 : st.size;
  return duLimit(async () => {
    const { stdout } = await run('du', ['-sk', p]);
    const m = stdout.match(/^(\d+)/m);
    return m ? parseInt(m[1], 10) * 1024 : 0;
  });
}

async function makeItem(p, extra = {}) {
  const st = await lstat(p);
  if (!st) return null;
  const size = extra.size ?? await sizeOf(p);
  return {
    path: p,
    name: path.basename(p),
    size,
    mtime: st.mtimeMs,
    isDir: st.isDirectory(),
    risk: 'review',
    tags: [],
    ...extra,
  };
}

const compact = (items, min = 0) => items.filter((i) => i && i.size >= min).sort((a, b) => b.size - a.size);

// ---------------------------------------------------- applications installées

// Mots trop génériques pour identifier une app à eux seuls.
const GENERIC = new Set(['app', 'apps', 'mac', 'macos', 'osx', 'desktop', 'client', 'helper', 'agent', 'main',
  'electron', 'github', 'tauri', 'dev', 'beta', 'free', 'pro', 'lite', 'plus', 'launcher', 'updater', 'service',
  'services', 'daemon', 'data', 'cache', 'caches', 'shared', 'common', 'default', 'user', 'settings', 'plugin',
  'plugins', 'extension', 'extensions', 'mobile', 'ios', 'www', 'inc', 'ltd', 'llc', 'the', 'com', 'org', 'net', 'io']);

const TLDS = new Set(['com', 'org', 'net', 'io', 'co', 'app', 'dev', 'me', 'de', 'fr', 'uk', 'us', 'ai', 'sh', 'so',
  'tv', 'cc', 'info', 'edu', 'jp', 'cn', 'ru', 'ch', 'nl', 'it', 'es', 'se', 'no', 'fi', 'dk', 'ca', 'au', 'be', 'at',
  'pl', 'cz', 'eu', 'xyz', 'tech', 'im', 'is', 'to', 'ly', 'md', 'gg', 'group']);

// Dossiers système qui ne correspondent à aucune app.
const SYSTEM_NAMES = new Set(['addressbook', 'callhistorydb', 'callhistorytransactions', 'clouddocs', 'crashreporter',
  'diskimages', 'dock', 'fileprovider', 'knowledge', 'mobilesync', 'syncservices', 'icloud', 'icdd',
  'networkserviceproxy', 'animoji', 'askpermission', 'coreparsec', 'differentialprivacy', 'facetime', 'homeenergyd',
  'locationaccessstored', 'videosubscriptionsd', 'transparencyd', 'accountsd', 'identityservicesd', 'controlcenter',
  'cloudkit', 'familycircle', 'geoservices', 'siri', 'spotlight', 'screentimeagent', 'quicklook', 'dmd', 'ams',
  'bluetooth', 'contextstoreagent', 'sirittsd', 'keychains', 'diagnosticreports', 'coreduet', 'passkit', 'metadata',
  'sharedfilelistd', 'com', 'byhost', 'mobiledocuments', 'cloudstorage', 'containermanager', 'appstore',
  'storeassetd', 'mediaanalysis', 'photoanalysisd', 'assistant', 'assistantservices', 'callservices', 'contacts',
  'reminders', 'calendars', 'mail', 'messages', 'safari', 'notes', 'photos', 'music', 'tv', 'podcasts', 'books',
  'maps', 'news', 'stocks', 'weather', 'home', 'shortcuts', 'freeform', 'journal', 'passwords', 'preview',
  'textedit', 'automator', 'script editor', 'terminal', 'finder', 'systempreferences', 'systemsettings', 'wallpaper',
  'avatarcache', 'dataaccess', 'intelligenceplatform', 'biome', 'tipsd', 'homekit', 'gamekit', 'studentd',
  'configurationprofiles', 'cups', 'workflow', 'tvappservices', 'icloudmailagent', 'coresimulator', 'photossearch']);

// Outils en ligne de commande dont le nom de dossier diffère du nom de commande.
const TOOL_NAMES = new Set(['pip', 'homebrew', 'electron', 'msplaywright', 'puppeteer', 'nodegyp', 'pypoetry', 'yarn', 'pnpm', 'typescript',
  'gobuild', 'jedi', 'black', 'ruff', 'mypy', 'precommit', 'deno', 'bun', 'cocoapods', 'carthage', 'gradle',
  'vscodecpptools', 'jetbrains', 'nodejs', 'npm', 'pipenv', 'virtualenv', 'uv', 'huggingface', 'firebase', 'qtproject']);

let appIndexCache = null;

async function findAppBundles() {
  const roots = ['/Applications', H('Applications'), '/System/Applications'];
  const out = [];
  async function walk(dir, depth) {
    for (const e of await readdir(dir)) {
      const full = path.join(dir, e.name);
      if (e.name.endsWith('.app')) out.push(full);
      else if (e.isDirectory() && depth < 2 && !e.name.startsWith('.')) await walk(full, depth + 1);
    }
  }
  for (const r of roots) await walk(r, 0);
  return out;
}

async function readAppInfo(appPath) {
  const plist = path.join(appPath, 'Contents', 'Info.plist');
  const { stdout } = await cmdLimit(() => run('plutil', ['-convert', 'xml1', '-o', '-', plist]));
  const get = (k) => {
    const m = stdout.match(new RegExp(`<key>${k}</key>\\s*<string>([^<]*)</string>`));
    return m ? decodeXml(m[1]).trim() : '';
  };
  const file = path.basename(appPath, '.app');
  return {
    path: appPath,
    file,
    id: get('CFBundleIdentifier'),
    name: get('CFBundleDisplayName') || get('CFBundleName') || file,
    exec: get('CFBundleExecutable'),
    version: get('CFBundleShortVersionString') || get('CFBundleVersion'),
    system: appPath.startsWith('/System/'),
  };
}

async function teamIdOf(appPath) {
  const { stderr } = await cmdLimit(() => run('codesign', ['-dv', '--verbose=2', appPath], { timeout: 15000 }));
  const m = stderr.match(/TeamIdentifier=([A-Z0-9]{10})/);
  return m ? m[1] : null;
}

async function commandNames() {
  const dirs = new Set([
    '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin',
    H('.local/bin'), H('.cargo/bin'), H('.bun/bin'), H('go/bin'), H('.deno/bin'), H('.npm-global/bin'),
    ...(process.env.PATH || '').split(':').filter(Boolean),
  ]);
  for (const v of await readdir(H('.nvm/versions/node'))) dirs.add(H('.nvm/versions/node', v.name, 'bin'));
  const names = new Set();
  for (const d of dirs) for (const e of await readdir(d)) names.add(norm(e.name));
  // Formules et casks Homebrew installés
  for (const d of ['/opt/homebrew/Cellar', '/opt/homebrew/Caskroom', '/usr/local/Cellar', '/usr/local/Caskroom']) {
    for (const e of await readdir(d)) names.add(norm(e.name));
  }
  names.delete('');
  return names;
}

async function appIndex(force = false) {
  if (appIndexCache && !force) return appIndexCache;
  const apps = await Promise.all((await findAppBundles()).map(readAppInfo));

  const ids = new Set();
  const vendors = new Set();
  const exact = new Set();
  const fuzzy = new Set();
  for (const a of apps) {
    const id = a.id.toLowerCase();
    if (id) {
      ids.add(id);
      const parts = id.split('.');
      if (!a.system && parts.length >= 2 && !GENERIC.has(parts[1])) vendors.add(norm(parts[1]));
      for (const part of parts.slice(1)) {
        const k = norm(part);
        if (k.length >= 4 && !GENERIC.has(k)) (a.system ? exact : fuzzy).add(k);
      }
    }
    for (const n of [a.name, a.file, a.exec]) {
      const k = norm(n);
      if (k.length < 2) continue;
      exact.add(k);
      if (!a.system && k.length >= 4 && !GENERIC.has(k)) fuzzy.add(k);
    }
  }

  const teams = new Set((await Promise.all(apps.filter((a) => !a.system).map((a) => teamIdOf(a.path)))).filter(Boolean));
  const procs = new Set((await run('ps', ['-axo', 'comm='])).stdout.split('\n')
    .map((l) => norm(path.basename(l.trim()))).filter((k) => k.length >= 3));
  const cli = await commandNames();

  appIndexCache = { apps, ids, vendors, exact, fuzzy, teams, procs, cli };
  return appIndexCache;
}

function stripName(name) {
  return name
    .replace(/\.(plist|savedstate|binarycookies|db|sqlite|log)$/i, '')
    .replace(/^group\./i, '');
}

function matchName(n, idx) {
  if (n.length < 3) return true; // trop court pour conclure : prudence
  if (idx.exact.has(n) || idx.procs.has(n) || idx.cli.has(n) || idx.vendors.has(n)) return true;
  for (const k of idx.fuzzy) {
    if ((n.length >= 4 && k.includes(n)) || (k.length >= 4 && n.includes(k))) return true;
  }
  return false;
}

const looksLikeBundleId = (lower) => {
  const parts = lower.split('.').filter(Boolean);
  return parts.length >= 3 || (parts.length === 2 && TLDS.has(parts[0]));
};

/** Vrai si le nom semble appartenir à une app installée, à macOS ou à un outil présent. */
function isKnown(rawName, idx) {
  let name = stripName(rawName);
  const team = name.match(/^([A-Z0-9]{10})\.(.+)$/);
  if (team) {
    if (idx.teams.has(team[1])) return true;
    name = team[2];
  }
  const lower = name.toLowerCase();
  if (lower.includes('apple') || SYSTEM_NAMES.has(lower) || SYSTEM_NAMES.has(norm(lower)) || TOOL_NAMES.has(norm(lower))) return true;

  if (looksLikeBundleId(lower)) {
    for (const id of idx.ids) {
      if (lower === id || lower.startsWith(id + '.') || id.startsWith(lower + '.')) return true;
    }
    const parts = lower.split('.');
    const vendor = norm(parts[1]);
    if (vendor && !GENERIC.has(vendor) && idx.vendors.has(vendor)) return true;
    const candidates = parts.slice(1).map(norm).filter((k) => k.length >= 3 && !GENERIC.has(k));
    return candidates.some((k) => matchName(k, idx));
  }
  return matchName(norm(name), idx);
}

/** Nom lisible de l'app propriétaire d'un dossier nommé par identifiant (ex. com.spotify.client → Spotify). */
function ownerName(rawName, idx) {
  const lower = stripName(rawName).toLowerCase();
  for (const a of idx.apps) {
    const id = a.id.toLowerCase();
    if (id && (lower === id || lower.startsWith(id + '.'))) return a.name;
  }
  return null;
}

// ------------------------------------------------------------------- analyses

async function scanCaches() {
  const idx = await appIndex();
  const base = H('Library/Caches');
  const entries = (await readdir(base)).filter((e) =>
    !e.name.startsWith('.') && !/apple/i.test(e.name) && !SYSTEM_NAMES.has(norm(e.name)));
  const items = await Promise.all(entries.map(async (e) => {
    const it = await makeItem(path.join(base, e.name), { risk: 'safe', tags: [] });
    if (!it) return null;
    const owner = ownerName(e.name, idx);
    if (owner) it.label = owner;
    if (!isKnown(e.name, idx)) it.tags.push('orphan');
    return it;
  }));
  return compact(items, MB);
}

async function scanLogs() {
  const idx = await appIndex();
  const base = H('Library/Logs');
  const entries = (await readdir(base)).filter((e) => !e.name.startsWith('.'));
  const items = await Promise.all(entries.map(async (e) => {
    const it = await makeItem(path.join(base, e.name), { risk: 'safe', tags: [] });
    if (!it) return null;
    if (e.name === 'DiagnosticReports') it.label = 'Rapports de plantage';
    else if (!isKnown(e.name, idx)) it.tags.push('orphan');
    return it;
  }));
  return compact(items, 100 * 1000);
}

const DEV_PATHS = [
  ['.npm/_cacache', 'Cache npm'],
  ['.npm/_npx', 'Paquets npx temporaires'],
  ['.cache/uv', 'Cache uv (Python)'],
  ['.cache/pip', 'Cache pip'],
  ['.cache/pre-commit', 'Environnements pre-commit'],
  ['.cache/yarn', 'Cache Yarn'],
  ['.yarn/berry/cache', 'Cache Yarn Berry'],
  ['Library/pnpm/store', 'Store pnpm'],
  ['.pnpm-store', 'Store pnpm'],
  ['.bun/install/cache', 'Cache Bun'],
  ['.gradle/caches', 'Cache Gradle'],
  ['.m2/repository', 'Dépôt Maven local'],
  ['.cargo/registry', 'Registre Cargo (Rust)'],
  ['.cargo/git', 'Dépôts git Cargo'],
  ['go/pkg/mod', 'Modules Go'],
  ['.cocoapods/repos', 'Dépôts CocoaPods'],
  ['.nvm/.cache', 'Cache nvm'],
  ['.node-gyp', 'En-têtes node-gyp'],
  ['.electron-gyp', 'En-têtes electron-gyp'],
  ['.conda/pkgs', 'Paquets conda'],
  ['miniconda3/pkgs', 'Paquets Miniconda'],
  ['anaconda3/pkgs', 'Paquets Anaconda'],
  ['miniforge3/pkgs', 'Paquets Miniforge'],
  ['Library/Developer/Xcode/DerivedData', 'Xcode · DerivedData'],
  ['Library/Developer/Xcode/iOS DeviceSupport', 'Xcode · Symboles iOS'],
  ['Library/Developer/Xcode/watchOS DeviceSupport', 'Xcode · Symboles watchOS'],
  ['Library/Developer/CoreSimulator/Caches', 'Simulateurs · Caches'],
  ['Library/Developer/Xcode/Archives', 'Xcode · Archives', 'review'],
  ['Library/Developer/CoreSimulator/Devices', 'Simulateurs iOS', 'review'],
  ['.rustup/toolchains', 'Toolchains Rust', 'review'],
  ['.android/avd', 'Émulateurs Android', 'review'],
];

// Sous-dossiers de ~/.cache gérés par la catégorie « Modèles IA ».
const AI_CACHE_DIRS = new Set(['huggingface', 'torch', 'whisper', 'lm-studio', 'clip', 'modelscope', 'tts',
  'gpt4all', 'sentence_transformers', 'chroma', 'ollama']);

async function scanDev() {
  const listed = new Set(DEV_PATHS.map(([p]) => H(p)));
  const known = DEV_PATHS.map(([p, label, risk]) => makeItem(H(p), { label, risk: risk || 'safe' }));
  const others = (await readdir(H('.cache')))
    .filter((e) => e.isDirectory() && !AI_CACHE_DIRS.has(e.name) && !listed.has(H('.cache', e.name)))
    .map((e) => makeItem(H('.cache', e.name), { label: `~/.cache/${e.name}` }));
  return compact(await Promise.all([...known, ...others]), MB);
}

async function hfItems(dir) {
  const kinds = { models: 'Modèle', datasets: 'Dataset', spaces: 'Space' };
  const out = [];
  const all = (await readdir(dir)).map((e) => e.name.match(/^(?:models|datasets|spaces)--(.+)$/)).filter(Boolean).map((m) => m[1].replace(/--/g, '/'));
  for (const e of await readdir(dir)) {
    const full = path.join(dir, e.name);
    const m = e.name.match(/^(models|datasets|spaces)--(.+)$/);
    if (m) {
      const extras = (await readdir(full)).map((f) => f.name).filter((f) => !['blobs', 'refs', 'snapshots', '.no_exist'].includes(f));
      const via = extras.map((f) => f.match(/^(.+)-revision$/)).filter(Boolean).map((x) => x[1]);
      const refs = await lstat(path.join(full, 'refs'));
      out.push(makeItem(full, {
        label: m[2].replace(/--/g, '/'),
        note: `Hugging Face · ${kinds[m[1]]}${via.length ? ` · téléchargé par ${via.join(', ')}` : ''}`,
        mtime: refs ? refs.mtimeMs : undefined,
        keep: true,
      }));
    } else if (e.name === 'blobs') {
      out.push(makeItem(full, {
        label: 'Fichiers partagés Hugging Face',
        note: `Contenu réel de ${all.length ? all.join(', ') : 'modèles supprimés'} · supprimer les modèles ne libère rien tant que ce dossier reste`,
      }));
    }
  }
  return out;
}

async function scanAI() {
  const jobs = [];
  jobs.push(...await hfItems(H('.cache/huggingface/hub')));
  jobs.push(makeItem(H('.cache/huggingface/xet'), { label: 'Cache de téléchargement Hugging Face', risk: 'safe' }));
  jobs.push(makeItem(H('.cache/huggingface/datasets'), { label: 'Datasets Hugging Face (préparés)' }));

  // Ollama : un seul bloc, les fichiers sont partagés entre modèles.
  const manifests = H('.ollama/models/manifests');
  const models = [];
  async function walk(dir, parts) {
    for (const e of await readdir(dir)) {
      if (e.isDirectory()) await walk(path.join(dir, e.name), [...parts, e.name]);
      else models.push(`${parts.slice(2).join('/').replace(/^library\//, '')}:${e.name}`);
    }
  }
  await walk(manifests, []);
  jobs.push(makeItem(H('.ollama/models'), {
    label: 'Modèles Ollama (tous)',
    note: models.length ? `${models.join(', ')} · pour un seul : ollama rm <nom>` : 'Pour en retirer un seul : ollama rm <nom>',
  }));

  // LM Studio : un élément par modèle.
  for (const root of [H('.lmstudio/models'), H('.cache/lm-studio/models')]) {
    for (const pub of await readdir(root)) {
      if (!pub.isDirectory()) continue;
      for (const model of await readdir(path.join(root, pub.name))) {
        if (model.isDirectory()) {
          jobs.push(makeItem(path.join(root, pub.name, model.name), { label: `${pub.name}/${model.name}`, note: 'LM Studio' }));
        }
      }
    }
  }

  const singles = [
    ['.cache/torch', 'Modèles PyTorch Hub'],
    ['.cache/whisper', 'Modèles Whisper (OpenAI)'],
    ['.cache/clip', 'Modèles CLIP'],
    ['.cache/modelscope', 'Modèles ModelScope'],
    ['.cache/tts', 'Modèles Coqui TTS'],
    ['Library/Application Support/tts', 'Modèles Coqui TTS'],
    ['.cache/gpt4all', 'Modèles GPT4All'],
    ['Library/Application Support/nomic.ai/GPT4All', 'Modèles GPT4All'],
    ['.cache/sentence_transformers', 'Sentence Transformers'],
    ['.cache/chroma', 'Modèles ChromaDB'],
    ['.keras/models', 'Modèles Keras'],
    ['.insightface', 'Modèles InsightFace'],
    ['.u2net', 'Modèles rembg (u2net)'],
    ['.diffusionbee', 'DiffusionBee'],
  ];
  for (const [p, label] of singles) jobs.push(makeItem(H(p), { label }));
  const items = await Promise.all(jobs);
  // Les modèles récents sont probablement encore utilisés.
  for (const it of items) if (it && Date.now() - it.mtime < 7 * DAY) it.tags.push('recent');
  return compact(items.filter((i) => i && (i.keep || i.size >= MB)));
}

const ORPHAN_LOCATIONS = [
  { dir: 'Library/Application Support', label: 'Application Support' },
  { dir: 'Library/Containers', label: 'Containers', idOnly: true },
  { dir: 'Library/Group Containers', label: 'Group Containers' },
  { dir: 'Library/Preferences', label: 'Préférences', idOnly: true, files: true },
  { dir: 'Library/Saved Application State', label: 'État des fenêtres', idOnly: true },
  { dir: 'Library/HTTPStorages', label: 'Stockage HTTP', idOnly: true },
  { dir: 'Library/WebKit', label: 'Données WebKit', idOnly: true },
  { dir: 'Library/Cookies', label: 'Cookies', idOnly: true, files: true },
  { dir: 'Library/Application Scripts', label: 'Scripts d\'app', idOnly: true },
  { dir: 'Library/LaunchAgents', label: 'Agent de démarrage', launchAgent: true },
];

async function launchAgentProgram(plist) {
  const { stdout } = await cmdLimit(() => run('plutil', ['-convert', 'xml1', '-o', '-', plist]));
  const prog = stdout.match(/<key>Program<\/key>\s*<string>([^<]*)<\/string>/);
  if (prog) return decodeXml(prog[1]);
  const args = stdout.match(/<key>ProgramArguments<\/key>\s*<array>\s*<string>([^<]*)<\/string>/);
  return args ? decodeXml(args[1]) : null;
}

async function scanOrphans({ exclude = [] } = {}) {
  const idx = await appIndex(true);
  const excluded = new Set(exclude.map((p) => path.resolve(p)));
  const jobs = [];
  for (const loc of ORPHAN_LOCATIONS) {
    const base = H(loc.dir);
    for (const e of await readdir(base)) {
      const full = path.join(base, e.name);
      if (e.name.startsWith('.') || excluded.has(full)) continue;
      if (loc.files && !e.isFile()) continue;

      if (loc.launchAgent) {
        if (!e.name.endsWith('.plist') || /apple/i.test(e.name)) continue;
        jobs.push((async () => {
          const prog = await launchAgentProgram(full);
          if (!prog || !prog.startsWith('/') || await exists(prog)) return null;
          return makeItem(full, { location: loc.label, tags: ['missing'], note: `Lance ${prog}, qui n'existe plus` });
        })());
        continue;
      }

      const stripped = stripName(e.name).replace(/^[A-Z0-9]{10}\./, '');
      if (loc.idOnly && !looksLikeBundleId(stripped.toLowerCase())) continue;
      if (isKnown(e.name, idx)) continue;
      jobs.push(makeItem(full, { location: loc.label, tags: ['orphan'] }));
    }
  }
  const items = await Promise.all(jobs);
  for (const it of items) if (it && Date.now() - it.mtime < 14 * DAY) it.tags.push('recent');
  return compact(items);
}

async function scanDownloads() {
  const base = H('Downloads');
  const entries = (await readdir(base)).filter((e) => !e.name.startsWith('.'));
  const items = await Promise.all(entries.map(async (e) => {
    const it = await makeItem(path.join(base, e.name));
    if (!it) return null;
    if (/\.(dmg|pkg|mpkg|iso|xip)$/i.test(e.name)) { it.tags.push('installer'); it.risk = 'safe'; }
    if (Date.now() - it.mtime > 90 * DAY) it.tags.push('old');
    return it;
  }));
  return compact(items);
}

// Paquets macOS dont il ne faut jamais toucher l'intérieur.
const PACKAGE_PRUNE = ['*.app', '*.photoslibrary', '*.musiclibrary', '*.tvlibrary', '*.fcpbundle',
  '*.imovielibrary', '*.logicx', '*.band', '*.photolibrary', '*.aplibrary'];

function pruneArgs(extraPaths, extraNames = []) {
  const clauses = [];
  for (const p of extraPaths) clauses.push('-path', p);
  for (const n of [...PACKAGE_PRUNE, '.git', ...extraNames]) clauses.push('-name', n);
  const args = ['('];
  clauses.forEach((c, i) => { if (i % 2 === 0 && i > 0) args.push('-o'); args.push(c); });
  args.push(')', '-prune', '-o');
  return args;
}

async function scanLarge() {
  const args = [HOME, '-xdev', ...pruneArgs([H('Library'), H('.*')], ['node_modules']),
    '-type', 'f', '-size', '+200M', '-print'];
  const { stdout } = await run('find', args, { timeout: 180000 });
  const files = stdout.split('\n').filter(Boolean);
  const items = await Promise.all(files.map(async (f) => {
    const it = await makeItem(f, { note: path.dirname(f).replace(HOME, '~') });
    if (it && Date.now() - it.mtime > 180 * DAY) it.tags.push('old');
    return it;
  }));
  return compact(items);
}

const PROJECT_DIRS = {
  node_modules: { label: 'node_modules', needs: ['package.json'] },
  '.venv': { label: 'Environnement Python', inside: 'pyvenv.cfg' },
  venv: { label: 'Environnement Python', inside: 'pyvenv.cfg' },
  target: { label: 'Build Rust (target)', needs: ['Cargo.toml'] },
  Pods: { label: 'CocoaPods', needs: ['Podfile'] },
  '.next': { label: 'Build Next.js', needs: ['package.json'] },
  '.turbo': { label: 'Cache Turborepo', needs: ['package.json'] },
  '.parcel-cache': { label: 'Cache Parcel', needs: ['package.json'] },
  '.gradle': { label: 'Cache Gradle du projet', needs: ['build.gradle', 'build.gradle.kts', 'settings.gradle', 'settings.gradle.kts'] },
};

async function projectActivity(projectDir, skip) {
  let latest = 0;
  for (const e of await readdir(projectDir)) {
    if (e.name === skip || e.name === '.git' || PROJECT_DIRS[e.name]) continue;
    const st = await lstat(path.join(projectDir, e.name));
    if (st && st.mtimeMs > latest) latest = st.mtimeMs;
  }
  return latest;
}

async function scanProjects({ exclude = [] } = {}) {
  const excluded = exclude.map((p) => path.resolve(p));
  const names = Object.keys(PROJECT_DIRS);
  const match = ['('];
  names.forEach((n, i) => { if (i) match.push('-o'); match.push('-name', n); });
  match.push(')');
  const args = [HOME, '-xdev', ...pruneArgs([H('Library'), H('.*')]), '-type', 'd', ...match, '-print', '-prune'];
  const { stdout } = await run('find', args, { timeout: 180000 });
  const dirs = stdout.split('\n').filter(Boolean);

  const items = await Promise.all(dirs.map(async (d) => {
    if (excluded.some((x) => d === x || d.startsWith(x + '/'))) return null;
    const kind = PROJECT_DIRS[path.basename(d)];
    const project = path.dirname(d);
    if (kind.needs) {
      const found = await Promise.all(kind.needs.map((f) => exists(path.join(project, f))));
      if (!found.some(Boolean)) return null;
    }
    if (kind.inside && !(await exists(path.join(d, kind.inside)))) return null;
    const activity = (await projectActivity(project, path.basename(d))) || undefined;
    const inactive = activity && Date.now() - activity > 30 * DAY;
    return makeItem(d, {
      label: path.basename(project),
      note: `${kind.label} · ${project.replace(HOME, '~')}`,
      mtime: activity,
      risk: inactive ? 'safe' : 'review',
      tags: inactive ? ['inactive'] : ['recent'],
    });
  }));
  return compact(items, MB);
}

// --------------------------------------------------------------- applications

async function lastUsed(p) {
  const { stdout } = await cmdLimit(() => run('mdls', ['-name', 'kMDItemLastUsedDate', '-raw', p]));
  const m = stdout.trim().match(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) \+0000$/);
  return m ? Date.parse(`${m[1]}T${m[2]}Z`) : null;
}

async function listApps() {
  const idx = await appIndex(true);
  const apps = idx.apps.filter((a) => !a.system && !a.id.toLowerCase().startsWith('com.apple.'));
  return Promise.all(apps.map(async (a) => ({
    ...a,
    size: await sizeOf(a.path),
    lastUsed: await lastUsed(a.path),
  })));
}

const RELATED_DIRS = [
  ['Library/Application Support', 'Application Support'],
  ['Library/Caches', 'Caches'],
  ['Library/Containers', 'Containers'],
  ['Library/Group Containers', 'Group Containers'],
  ['Library/Preferences', 'Préférences'],
  ['Library/Preferences/ByHost', 'Préférences'],
  ['Library/Saved Application State', 'État des fenêtres'],
  ['Library/HTTPStorages', 'Stockage HTTP'],
  ['Library/WebKit', 'Données WebKit'],
  ['Library/Cookies', 'Cookies'],
  ['Library/Logs', 'Journaux'],
  ['Library/LaunchAgents', 'Agent de démarrage'],
  ['Library/Application Scripts', 'Scripts d\'app'],
];

async function relatedFiles(appPath) {
  const idx = await appIndex();
  const a = idx.apps.find((x) => x.path === appPath);
  if (!a) return [];
  const id = a.id.toLowerCase();
  const names = new Set([a.name, a.file].filter(Boolean).map((s) => s.toLowerCase()));
  const jobs = [];
  for (const [dir, label] of RELATED_DIRS) {
    for (const e of await readdir(H(dir))) {
      const n = stripName(e.name).replace(/^[A-Z0-9]{10}\./, '').toLowerCase();
      const byId = id && (n === id || n.startsWith(id + '.'));
      if (byId || names.has(n)) jobs.push(makeItem(H(dir, e.name), { location: label }));
    }
  }
  return compact(await Promise.all(jobs));
}

// ------------------------------------------------------------------ explorateur

async function listDir(dir) {
  const entries = await readdir(dir);
  const items = await Promise.all(entries.map(async (e) => {
    const p = path.join(dir, e.name);
    const st = await lstat(p);
    if (!st) return null;
    const isDir = st.isDirectory();
    return {
      path: p,
      name: e.name,
      isDir,
      isLink: st.isSymbolicLink(),
      size: isDir ? null : (st.blocks ? st.blocks * 512 : st.size),
      mtime: st.mtimeMs,
      hidden: e.name.startsWith('.'),
    };
  }));
  return items.filter(Boolean);
}

// ------------------------------------------------------------ système / corbeille

function hasFullDiskAccess() {
  for (const p of [H('Library/Safari'), H('Library/Application Support/com.apple.TCC')]) {
    try { fs.readdirSync(p); return true; } catch (e) { if (e.code !== 'ENOENT') return false; }
  }
  return false;
}

async function systemInfo() {
  let disk = null;
  try {
    const s = await fsp.statfs('/');
    disk = { total: s.blocks * s.bsize, free: s.bavail * s.bsize };
  } catch { /* pas critique */ }
  return { home: HOME, user: os.userInfo().username, disk, fda: hasFullDiskAccess() };
}

async function trashInfo() {
  const p = H('.Trash');
  try { await fsp.readdir(p); } catch { return { size: null, accessible: false }; }
  return { size: await sizeOf(p), accessible: true };
}

async function emptyTrash() {
  const { err, stderr } = await run('osascript', ['-e', 'tell application "Finder" to empty trash']);
  return err ? { ok: false, error: stderr.trim() || err.message } : { ok: true };
}

// --------------------------------------------------------------------- export

const SCANS = {
  caches: scanCaches,
  logs: scanLogs,
  dev: scanDev,
  ai: scanAI,
  orphans: scanOrphans,
  downloads: scanDownloads,
  large: scanLarge,
  projects: scanProjects,
};

async function scan(cat, opts) {
  const fn = SCANS[cat];
  if (!fn) throw new Error(`Catégorie inconnue : ${cat}`);
  const items = await fn(opts);
  return items.map((it) => ({ ...it, cat }));
}

module.exports = {
  HOME, scan, sizeOf, listApps, relatedFiles, listDir, systemInfo, trashInfo, emptyTrash, appIndex, isKnown,
};
