'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const call = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('cleanTonMac', {
  systemInfo: call('system:info'),
  scan: call('scan'),
  listApps: call('apps:list'),
  relatedFiles: call('apps:related'),
  listDir: call('fs:list'),
  size: call('fs:size'),
  trash: call('trash'),
  trashInfo: call('trash:info'),
  emptyTrash: call('trash:empty'),
  reveal: call('reveal'),
  openFullDiskAccess: call('open:fda'),
});
