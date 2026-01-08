const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updater', {
  check: () => ipcRenderer.invoke('update:check'),

  onChecking: (cb) => ipcRenderer.on('update:checking', () => cb()),
  onAvailable: (cb) => ipcRenderer.on('update:available', (_e, info) => cb(info)),
  onNone: (cb) => ipcRenderer.on('update:none', (_e, info) => cb(info)),
  onProgress: (cb) => ipcRenderer.on('update:progress', (_e, p) => cb(p)),
  onDownloaded: (cb) => ipcRenderer.on('update:downloaded', (_e, info) => cb(info)),
  onError: (cb) => ipcRenderer.on('update:error', (_e, msg) => cb(msg))
});