/* eslint global-require: off, no-console: off, promise/always-return: off, @typescript-eslint/no-explicit-any: off */
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import pcap from 'pcap';
import { BeaconFrame } from '../lib/wifiTypes';
import { EthFrame } from '../lib/ethTypes';
import decode80211 from '../lib/wifi';
import decodeEth from '../lib/eth';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const listenForPackets = <T>(
  filter: string,
  monitor: boolean,
  linkType: string,
  decoder: (packet: pcap.PacketWithHeader) => T,
  handler: (arg: T) => void
): (() => void) => {
  const devices = pcap.findalldevs();

  const pcapSession = pcap.createSession(devices[0].name, {
    filter, // https://www.tcpdump.org/manpages/pcap-filter.7.html
    monitor,
    promiscuous: false,
  });

  if (pcapSession.link_type !== linkType) {
    throw new Error('Link type not supported');
  }

  pcapSession.on('packet', (rawPacket) => {
    const data = decoder(rawPacket);
    handler(data);
  });

  return pcapSession.close;
};

const scanNetworks = (handler: (arg: BeaconFrame | null) => void) =>
  listenForPackets(
    'type mgt subtype beacon',
    true,
    'LINKTYPE_IEEE802_11_RADIO',
    decode80211,
    handler
  );

const sniffTraffic = (handler: (arg: EthFrame | null) => void) =>
  listenForPackets(
    'tcp port 80',
    false,
    'LINKTYPE_ETHERNET',
    decodeEth,
    handler
  );

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // scanNetworks((frame) => {
    //   mainWindow?.webContents.send('networks', frame);
    // });
    sniffTraffic((frame) => {
      mainWindow?.webContents.send('data', frame);
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
