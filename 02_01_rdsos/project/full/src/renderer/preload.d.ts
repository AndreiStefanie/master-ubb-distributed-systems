import { BeaconFrame } from 'lib/wifi';

declare global {
  interface Window {
    electron: {
      onMonitorWifi: (
        channel: string,
        callback: (data: BeaconFrame | null) => void
      ) => void;
    };
  }
}

export {};
