import { contextBridge, ipcRenderer } from 'electron';
import { BeaconFrame } from 'lib/wifi';

export type Channels = 'networks';

contextBridge.exposeInMainWorld('electron', {
  onMonitorWifi: (
    channel: string,
    callback: (data: BeaconFrame | null) => void
  ) => {
    return ipcRenderer.on('networks', (event, data: BeaconFrame | null) =>
      callback(data)
    );
  },
});
