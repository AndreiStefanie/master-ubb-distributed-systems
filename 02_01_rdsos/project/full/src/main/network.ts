import pcap from 'pcap';
import { BeaconFrame } from '../lib/wifiTypes';
import { EthFrame } from '../lib/ethTypes';
import decode80211 from '../lib/wifi';
import decodeEth from '../lib/eth';

const listenForPackets = <T>(
  filter: string,
  monitor: boolean,
  promiscuous: boolean,
  linkType: string,
  decoder: (packet: pcap.PacketWithHeader) => T,
  handler: (arg: T) => void
): (() => void) => {
  const devices = pcap.findalldevs();

  const pcapSession = pcap.createSession(devices[0].name, {
    filter, // https://www.tcpdump.org/manpages/pcap-filter.7.html
    monitor,
    promiscuous,
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

export const scanNetworks = (handler: (arg: BeaconFrame | null) => void) => {
  return listenForPackets(
    'type mgt subtype beacon',
    true,
    false,
    'LINKTYPE_IEEE802_11_RADIO',
    decode80211,
    handler
  );
};

export const sniffTraffic = (handler: (arg: EthFrame | null) => void) =>
  listenForPackets(
    'tcp port 80',
    false,
    true,
    'LINKTYPE_ETHERNET',
    decodeEth,
    handler
  );
