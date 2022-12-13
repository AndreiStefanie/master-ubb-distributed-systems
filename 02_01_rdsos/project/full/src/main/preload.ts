import { contextBridge, ipcRenderer } from 'electron';
import { EthFrame } from 'lib/ethTypes';
import { BeaconFrame } from 'lib/wifiTypes';

export type Channels = 'networks' | 'data';

contextBridge.exposeInMainWorld('electron', {
  onBeaconFrame: (
    channel: Channels,
    callback: (data: BeaconFrame | null) => void
  ) => {
    return ipcRenderer.on(channel, (_, packet: BeaconFrame | null) =>
      callback(packet)
    );
  },
  onEthFrame: (
    channel: Channels,
    callback: (data: EthFrame | null) => void
  ) => {
    return ipcRenderer.on(channel, (_, frame: EthFrame | null) =>
      callback(frame)
    );
  },
});
