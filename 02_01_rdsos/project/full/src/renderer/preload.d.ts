import { EthFrame } from 'lib/ethTypes';
import { BeaconFrame } from 'lib/wifiTypes';
import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      onBeaconFrame: (
        channel: Channels,
        callback: (data: BeaconFrame | null) => void
      ) => void;
      onEthFrame: (
        channel: Channels,
        callback: (data: EthFrame) => void
      ) => void;
      scan: () => void;
      sniff: () => void;
    };
  }
}

export {};
