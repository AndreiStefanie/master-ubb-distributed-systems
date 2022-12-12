import { contextBridge, ipcRenderer } from 'electron';
import { Packet } from 'lib/types';

export type Channels = 'networks';

contextBridge.exposeInMainWorld('electron', {
  onMonitorWifi: (channel: string, callback: (data: Packet | null) => void) => {
    return ipcRenderer.on('networks', (event, data: Packet | null) =>
      callback(data)
    );
  },
});
