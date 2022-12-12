import { Packet } from 'lib/types';

declare global {
  interface Window {
    electron: {
      onMonitorWifi: (
        channel: string,
        callback: (data: Packet | null) => void
      ) => void;
    };
  }
}

export {};
