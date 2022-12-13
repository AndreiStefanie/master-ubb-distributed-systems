import { EthFrame } from 'lib/ethTypes';
import { BeaconFrame } from 'lib/wifiTypes';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { throttle } from 'throttle-debounce';
import App from './App';
import { beaconFrameReceived } from './features/networks/networksSlice';
import { ethFrameReceived } from './features/sniffer/snifferSlice';
import { store } from './store';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

const handleBeaconFrames = throttle(300, (data: BeaconFrame | null) => {
  if (!data) {
    return;
  }

  store.dispatch(beaconFrameReceived(data));
});

const handleEthFrames = throttle(300, (data: EthFrame | null) => {
  if (!data) {
    return;
  }

  store.dispatch(ethFrameReceived(data));
});

window.electron.onBeaconFrame('networks', (data: BeaconFrame | null) =>
  handleBeaconFrames(data)
);

window.electron.onEthFrame('data', (data: EthFrame | null) =>
  handleEthFrames(data)
);
