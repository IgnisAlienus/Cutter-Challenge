const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  closeWindows: () => ipcRenderer.send('close-windows'),
  changePage: (page) => ipcRenderer.send('change-page', page),
});
