import pcap from 'pcap';
import mac from 'mac-address';
import {
  sliceBuffer,
  flagsToArray,
  readBigUInt64BE,
  slicePacket,
} from './tools';
import decodeRadiotap from './radiotap';
import decodeTags from './tags';
import { FrameControl, BeaconFrame } from './wifiTypes';

/**
 *
 * @param {Buffer} packet The raw L2 packet
 */
const decodePacket = (packet: Buffer): BeaconFrame | null => {
  const frame: Partial<BeaconFrame> = {};

  frame.radiotap = { ...decodeRadiotap(packet) };

  const buf = sliceBuffer(packet, frame.radiotap.length, packet.length);
  if (buf.length < 24) {
    return null;
  }

  // https://www.oreilly.com/library/view/80211-wireless-networks/0596100523/ch04.html#wireless802dot112-CHP-4-FIG-51
  // MAC header
  // Frame control
  const typeSubtype = buf.readUInt8(0);
  const fc: FrameControl = {
    subtype: typeSubtype >> 4,
    type: (typeSubtype >> 2) & 3,
    version: typeSubtype & 3,
    toDs: 0,
    fromDs: 0,
  };

  if (fc.subtype !== 8) {
    return null;
  }

  // https://www.oreilly.com/library/view/80211-wireless-networks/0596100523/ch04.html#wireless802dot112-CHP-4-TABLE-2
  const fcFlags = flagsToArray(buf.readUInt8(1), 8);
  [fc.toDs, fc.fromDs] = fcFlags;

  if (fc.toDs !== 0 && fc.fromDs !== 0) {
    return null;
  }

  frame.frameControl = { ...fc };

  frame.duration = buf.readUInt16BE(2);

  frame.destAddress = mac.toString(buf, 4);
  frame.srcAddress = mac.toString(buf, 10);
  frame.bssId = mac.toString(buf, 16);
  frame.seqControl = buf.readUInt16BE(22);

  // Beacon frame body (starts at 24, after sequence)
  // For how long the AP has been active
  frame.timestamp = readBigUInt64BE(buf, 24).toString();

  // 100TU is 102.4 milliseconds
  frame.beaconIntervalInTU = buf.readUInt16BE(32);

  frame.tags = decodeTags(buf);

  // Frame control sequence
  frame.fcs = buf.readUInt32BE(buf.length - 4);

  return frame as BeaconFrame;
};

export default (packet: pcap.PacketWithHeader): BeaconFrame | null =>
  decodePacket(slicePacket(packet));
