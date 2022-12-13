import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'renderer/store';
import { EthFrame } from 'lib/ethTypes';

type SnifferState = EthFrame[];

const todosSlice = createSlice({
  name: 'sniffer',
  initialState: [] as SnifferState,
  reducers: {
    ethFrameReceived(state, action: PayloadAction<EthFrame>) {
      const frame = action.payload;
      state.push(frame);
    },
  },
});

export const selectPackets = (state: RootState) => state.sniffer;

export const { ethFrameReceived } = todosSlice.actions;
export default todosSlice.reducer;
