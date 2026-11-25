const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('khDesktop', {
  printers: () => ipcRenderer.invoke('printers'),
  print: (o) => ipcRenderer.invoke('print', o)
});
// نهاية الملف: preload.js
