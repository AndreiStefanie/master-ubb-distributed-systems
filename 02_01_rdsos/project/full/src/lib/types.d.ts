export interface Packet {
  radiotap: RadiotapHeader;
  frameControl: FrameControl;
  duration: number;
  destAddress: string;
  srcAddress: string;
  bssId: string;
  seqControl: number;
  timestamp: string;
  beaconIntervalInTU: number;
  tags: Tags;
  fcs: number;
}

export interface ChannelFlags {
  turbo: boolean;
  CCK: boolean;
  OFDM: boolean;
  twoGhz: boolean;
  fiveGhz: boolean;
  onlyPassiveScan: boolean;
  dynamicCCKOFDM: boolean;
  GFSK: boolean;
}

export interface RadiotapHeader {
  version: number;
  pad: number;
  length: number;
  rate?: number;
  channel?: number;
  frequency?: number;
  channelFlags?: ChannelFlags;
  dbmSignal?: number;
  dbmNoise?: number;
  antenna?: number;
  fhss?: {
    hopSet: number;
    hopPattern: number;
  };
  lockQuality?: number;
  txAttenuation?: number;
  dbTxAttenuation?: number;
  dbmTxPower?: number;
  dbAntennaSignal?: number;
  dbAntennaNoise?: number;
  rxFlags?: number;
  txFlags?: number;
  rtsRetries?: number;
  dataRetries?: number;
}

export interface FrameControl {
  subtype: number;
  type: number;
  version: number;
  toDs: number;
  fromDs: number;
}

export interface Tags {
  ssid?: string;
  channel?: number;
}
