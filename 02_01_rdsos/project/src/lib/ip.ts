import { IpPacket } from './ethTypes';
import tcpDecode from './tcp';

/**
 * @param {Buffer} rawPacket
 * @param {number} offset
 * @returns
 */
const decodeIpAddress = (rawPacket: Buffer, offset: number): string => {
  const addr = new Array(4);

  addr[0] = rawPacket.readUInt8(offset);
  addr[1] = rawPacket.readUInt8(offset + 1);
  addr[2] = rawPacket.readUInt8(offset + 2);
  addr[3] = rawPacket.readUInt8(offset + 1);

  return `${addr[0]}.${addr[1]}.${addr[2]}.${addr[3]}`;
};

/**
 * Decode an IP packet
 * @param {Buffer} rawPacket
 * @param {number} pos Offset
 */
export default (rawPacket: Buffer, pos: number): IpPacket => {
  let offset = pos;
  const packet = {} as Partial<IpPacket>;

  packet.version = (rawPacket[offset] & 0xf0) >> 4;
  packet.headerLength = (rawPacket[offset] & 0x0f) << 2;
  offset += 1;

  packet.dscp = rawPacket[offset];
  offset += 1;

  packet.length = rawPacket.readUInt16BE(offset);
  offset += 2;

  packet.identification = rawPacket.readUInt16BE(offset);
  offset += 2;

  packet.flags = {
    reserved: Boolean((rawPacket[offset] & 0x80) >> 7),
    doNotFragment: Boolean((rawPacket[offset] & 0x40) > 0),
    moreFragments: Boolean((rawPacket[offset] & 0x20) > 0),
  };

  packet.fragmentOffset = (rawPacket.readUInt16BE(offset) & 0x1fff) << 3;
  offset += 2;

  packet.ttl = rawPacket.readUInt8(offset);
  offset += 1;

  packet.protocol = rawPacket[offset];
  offset += 1;

  packet.headerChecksum = rawPacket.readUInt16BE(offset);
  offset += 2;

  packet.srcIpAddress = decodeIpAddress(rawPacket, offset);
  offset += 4;
  packet.dstIpAddress = decodeIpAddress(rawPacket, offset);
  offset += 4;

  // Skip the entire header
  offset = pos + packet.headerLength;
  const bodyLength = packet.length - packet.headerLength;

  if (packet.protocol === 0x06) {
    // TCP
    // https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers
    packet.tcp = tcpDecode(rawPacket, offset, bodyLength);
  }

  return packet as IpPacket;
};
