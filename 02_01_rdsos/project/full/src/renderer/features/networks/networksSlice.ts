import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'renderer/store';
import { Packet } from 'lib/types';

export interface Network {
  ssid: string;
  bssid: string;
  channel: number;
  frequency: number;
  signal: number;
  noise: number;
  rate: number;
}

interface NetworksState {
  [ssid: string]: Network;
}

const todosSlice = createSlice({
  name: 'networks',
  initialState: {} as NetworksState,
  reducers: {
    packetReceived(state, action: PayloadAction<Packet>) {
      const packet = action.payload;

      if (!packet?.tags?.ssid) {
        return;
      }

      state[packet.tags.ssid] = {
        ssid: packet.tags.ssid,
        bssid: packet.bssId,
        channel: packet.tags.channel || 0,
        frequency: (packet.radiotap.frequency || 0) / 1000,
        noise: packet.radiotap.dbmNoise || 0,
        rate: (packet.radiotap.rate || 0) * 0.5,
        signal: packet.radiotap.dbmSignal || 0,
      };
    },
  },
});

export const selectNetworks = (state: RootState) =>
  Object.values(state.networks).sort((a, b) => b.signal - a.signal);

export const { packetReceived } = todosSlice.actions;
export default todosSlice.reducer;