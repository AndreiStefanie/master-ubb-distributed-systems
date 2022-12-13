import pcap from 'pcap';
import mac from 'mac-address';
import { v4 as uuidv4 } from 'uuid';
import { EthFrame } from './ethTypes';
import ipDecode from './ip';
import { slicePacket } from './tools';

const decodeEthFrame = (rawPacket: Buffer): EthFrame => {
  let offset = 0;
  const frame = {} as Partial<EthFrame>;
  frame.id = uuidv4();

  frame.destMAC = mac.toString(rawPacket, offset);
  offset += 6;
  frame.srcMAC = mac.toString(rawPacket, offset);
  offset += 6;

  frame.etherType = rawPacket.readUInt16BE(offset);
  offset += 2;

  if (frame.etherType === 0x8100) {
    // VLAN-tagged (802.1Q)
    offset += 2;

    // Update the ethertype
    frame.etherType = rawPacket.readUInt16BE(offset);
    offset += 2;
  }

  if (frame.etherType < 1536) {
    // this packet is actually some 802.3 type without an ethertype
    frame.etherType = 0;
  } else {
    // http://en.wikipedia.org/wiki/EtherType
    switch (frame.etherType) {
      case 0x800: // IPv4
        frame.ip = ipDecode(rawPacket, offset);
        break;
      default:
        break;
    }
  }

  return frame as EthFrame;
};

/**
 * Decode an Ethernet frame
 * https://en.wikipedia.org/wiki/Ethernet_frame
 * @param {Buffer} rawPacket
 * @returns
 */
export default (packet: pcap.PacketWithHeader): EthFrame =>
  decodeEthFrame(slicePacket(packet));
