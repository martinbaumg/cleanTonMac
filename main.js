'use strict';

const { app, BrowserWindow, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const scanner = require('./src/scanner');

const HOME = scanner.HOME;
const H = (...p) => path.join(HOME, ...p);
const APP_DIR = __dirname;

// Seuls les chemins renvoyés par une analyse ou l'explorateur peuvent être mis à la corbeille.
const known = new Set();
const remember = (items) => {
  for (const it of items) if (it && it.path) known.add(path.resolve(it.path));
  return items;
};

const PROTECTED = new Set([
  HOME, H('Library'), H('Library/Application Support'), H('Library/Caches'), H('Library/Preferences'),
  H('Library/Containers'), H('Library/Group Containers'), H('Library/Logs'), H('Library/LaunchAgents'),
  H('Library/Saved Application State'), H('Library/Mobile Documents'), H('Library/CloudStorage'),
  H('Library/Keychains'), H('Library/Mail'), H('Library/Messages'), H('Library/Safari'),
  H('Documents'), H('Desktop'), H('Downloads'), H('Pictures'), H('Movies'), H('Music'), H('Public'),
  H('Applications'), H('.Trash'), H('.cache'), H('.config'), H('.local'), H('.ssh'), H('.gnupg'),
  H('.zshrc'), H('.zprofile'), H('.bashrc'), H('.bash_profile'), H('.profile'), H('.gitconfig'),
]);
const PROTECTED_TREES = [H('Library/Keychains'), H('.ssh'), H('.gnupg')];

function protectedReason(p) {
  const r = path.resolve(p);
  const userData = app.getPath('userData');
  const inside = (t) => r === t || r.startsWith(t + '/');
  if (inside(APP_DIR) || inside(userData) || userData.startsWith(r + '/') || APP_DIR.startsWith(r + '/')) return 'Utilisé par Ménage';
  if (PROTECTED.has(r)) return 'Dossier système protégé';
  if (PROTECTED_TREES.some(inside)) return 'Dossier sensible protégé';
  if (r.startsWith(HOME + '/')) return null;
  if (/^\/Applications\/(?:[^/]+\/)?[^/]+\.app$/.test(r)) return null;
  return 'En dehors de ton dossier personnel';
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    title: 'Ménage',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Liens externes : navigateur par défaut, jamais dans la fenêtre.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e) => e.preventDefault());

  if (process.env.MENAGE_SNAPSHOT) debugSnapshot(process.env.MENAGE_SNAPSHOT);
}

// Mode test : exécute un script dans la page, capture la fenêtre et quitte.
function debugSnapshot(out) {
  win.webContents.on('console-message', (e) => console.log(`[page:${e.level}] ${e.message}`));
  win.webContents.once('did-finish-load', async () => {
    try {
      if (process.env.MENAGE_EVAL) await win.webContents.executeJavaScript(process.env.MENAGE_EVAL);
      await new Promise((r) => setTimeout(r, Number(process.env.MENAGE_WAIT || 4000)));
      const img = await win.webContents.capturePage();
      fs.writeFileSync(out, img.toPNG());
    } catch (e) { console.error(e); }
    app.quit();
  });
}

const handle = (channel, fn) => ipcMain.handle(channel, (_e, ...args) => fn(...args));

handle('system:info', () => scanner.systemInfo());

handle('scan', async (cat) =>
  remember(await scanner.scan(cat, { exclude: [app.getPath('userData'), APP_DIR] })));

handle('apps:list', async () => {
  const apps = remember(await scanner.listApps());
  await Promise.all(apps.map(async (a) => {
    try {
      a.icon = (await nativeImage.createThumbnailFromPath(a.path, { width: 64, height: 64 })).toDataURL();
    } catch {
      try { a.icon = (await app.getFileIcon(a.path, { size: 'normal' })).toDataURL(); } catch { /* icône facultative */ }
    }
  }));
  return apps;
});

handle('apps:related', async (appPath) => remember(await scanner.relatedFiles(appPath)));

handle('fs:list', async (dir) => {
  const r = path.resolve(dir);
  if (r !== HOME && !r.startsWith(HOME + '/')) throw new Error('Seul ton dossier personnel peut être exploré.');
  const items = await scanner.listDir(r);
  for (const it of items) it.protected = protectedReason(it.path);
  return remember(items);
});

handle('fs:size', (p) => scanner.sizeOf(path.resolve(p)));

handle('trash', async (paths) => {
  const sorted = [...new Set(paths.map((p) => path.resolve(p)))].sort((a, b) => a.length - b.length);
  const done = [];
  const failed = [];
  for (const p of sorted) {
    if (done.some((d) => p.startsWith(d + '/'))) { done.push(p); continue; } // parent déjà parti
    const why = known.has(p) ? protectedReason(p) : 'Élément inconnu : relance l\'analyse';
    if (why) { failed.push({ path: p, error: why }); continue; }
    try {
      await shell.trashItem(p);
      done.push(p);
      known.delete(p);
    } catch (e) {
      failed.push({ path: p, error: e.message });
    }
  }
  return { done, failed };
});

handle('trash:info', () => scanner.trashInfo());
handle('trash:empty', () => scanner.emptyTrash());
handle('reveal', (p) => shell.showItemInFolder(p));
handle('open:fda', () => shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
