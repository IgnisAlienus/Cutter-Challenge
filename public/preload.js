const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  closeWindows: () => ipcRenderer.send('close-windows'),
});
