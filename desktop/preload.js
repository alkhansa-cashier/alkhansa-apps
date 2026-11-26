const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('khDesktop', {
  printers: () => ipcRenderer.invoke('printers'),
  print: (o) => ipcRenderer.invoke('print', o),
  update: (u) => ipcRenderer.invoke('update', u),
  onUpd: (cb) => { ipcRenderer.removeAllListeners('upd-p'); ipcRenderer.on('upd-p', (e, p) => cb(p)); }
});
// نهاية الملف: preload.js
