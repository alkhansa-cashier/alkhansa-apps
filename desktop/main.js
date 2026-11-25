// الخنساء: نسخة الويندوز (Electron)
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
let win;

function create() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1280, height: 800, show: false, backgroundColor: '#EEF1F6',
    title: process.env.KH_TITLE || 'الخنساء',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  // روابط واتساب وغيرها تفتح بالمتصفح
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });
}

const single = app.requestSingleInstanceLock();
if (!single) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(create);
  app.on('window-all-closed', () => app.quit());
}

ipcMain.handle('printers', async () => {
  const l = await win.webContents.getPrintersAsync();
  return l.map(p => ({ name: p.name, isDefault: !!p.isDefault }));
});

// طباعة صورة الفاتورة بعرض الورق مباشرة بدون نافذة
ipcMain.handle('print', async (e, o) => {
  const w = o.widthMm || 80, pm = Math.min(w, o.printMm || (w === 58 ? 48 : 72)), off = Math.max(0, +o.offMm || 0);
  const h = o.hMm ? +o.hMm : Math.max(30, Math.ceil(pm * (o.ratio || 1.5)) + 4);
  const pw = new BrowserWindow({ show: false, webPreferences: { offscreen: false } });
  const html = `<!DOCTYPE html><html dir="ltr"><head><style>@page{size:${w}mm ${h}mm;margin:0}html,body{margin:0;padding:0}img{width:${pm}mm;display:block;margin-left:${off}mm;image-rendering:pixelated}</style></head><body><img src="${o.img}"></body></html>`;
  await pw.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  return await new Promise(res => {
    pw.webContents.print({
      silent: true, printBackground: true, deviceName: o.printer || '',
      margins: { marginType: 'none' }, pageSize: { width: w * 1000, height: h * 1000 }
    }, (ok, err) => { pw.close(); res({ ok, err: err || '' }); });
  });
});
// نهاية الملف: main.js
