import { Packet } from 'lib/types';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { throttle } from 'throttle-debounce';
import App from './App';
import { packetReceived } from './features/networks/networksSlice';
import { store } from './store';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

const handlePackets = throttle(300, (data: Packet | null) => {
  if (!data) {
    return;
  }

  store.dispatch(packetReceived(data));
});

window.electron.onMonitorWifi('networks', (data: Packet | null) =>
  handlePackets(data)
);
