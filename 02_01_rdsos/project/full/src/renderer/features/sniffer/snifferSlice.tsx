import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'renderer/store';
import { BeaconFrame } from 'lib/wifi';

export interface TCPPacket {
  ssid: string;
  bssid: string;
  channel: number;
  frequency: number;
  signal: number;
  noise: number;
  rate: number;
  devices: number;
  utilization: number;
}

type SnifferState = TCPPacket[];

const todosSlice = createSlice({
  name: 'sniffer',
  initialState: [] as SnifferState,
  reducers: {
    packetReceived(state, action: PayloadAction<BeaconFrame>) {
      const packet = action.payload;

      if (!packet?.tags?.ssid) {
        // return;
      }
    },
  },
});

export const selectPackets = (state: RootState) => state.sniffer;

export const { packetReceived } = todosSlice.actions;
export default todosSlice.reducer;
