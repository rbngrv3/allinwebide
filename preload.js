const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('studio', {
  isDesktop: true,
  controlWindow: (action) => ipcRenderer.invoke('window:control', action),
  openProject: () => ipcRenderer.invoke('project:open'),
  saveProject: (payload) => ipcRenderer.invoke('project:save', payload),
  revealProject: () => ipcRenderer.invoke('project:reveal'),
  pluginRequest: (payload) => ipcRenderer.invoke('plugin:request', payload),
  createTerminal: (profile) => ipcRenderer.invoke('terminal:create', profile),
  executeTerminal: (command, profile) => ipcRenderer.invoke('terminal:execute', { command, profile }),
  writeTerminal: (id, data) => ipcRenderer.send('terminal:write', id, data),
  resizeTerminal: (id, cols, rows) => ipcRenderer.send('terminal:resize', id, cols, rows),
  closeTerminal: (id) => ipcRenderer.send('terminal:close', id),
  onTerminalData: (callback) => ipcRenderer.on('terminal:data', (_event, payload) => callback(payload)),
  onTerminalExit: (callback) => ipcRenderer.on('terminal:exit', (_event, payload) => callback(payload))
});
