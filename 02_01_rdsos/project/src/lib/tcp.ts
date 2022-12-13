import { TcpSegment } from './ethTypes';

/**
 * Decode the TCP flags
 * https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure:~:text=set%20to%20zero.-,Flags%20(9%20bits),-Contains%209%201
 * @param {Buffer} rawPacket
 * @param {number} offset
 * @returns
 */
const decodeFlags = (rawPacket: Buffer, offset: number) => {
  return {
    nonce: Boolean(rawPacket[offset] & 1),
    cwr: Boolean(rawPacket[offset + 1] & 128),
    ece: Boolean(rawPacket[offset + 1] & 64),
    urg: Boolean(rawPacket[offset + 1] & 32),
    ack: Boolean(rawPacket[offset + 1] & 16),
    psh: Boolean(rawPacket[offset + 1] & 8),
    rst: Boolean(rawPacket[offset + 1] & 4),
    syn: Boolean(rawPacket[offset + 1] & 2),
    fin: Boolean(rawPacket[offset + 1] & 1),
  };
};

/**
 *
 * @param {Buffer} rawPacket
 * @param {number} pos
 * @param {number} segmentLength
 */
export default (
  rawPacket: Buffer,
  pos: number,
  segmentLength: number
): TcpSegment => {
  // https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure
  let offset = pos;
  const segment = {} as Partial<TcpSegment>;

  segment.srcPort = rawPacket.readUInt16BE(offset);
  offset += 2;

  segment.dstPort = rawPacket.readUInt16BE(offset);
  offset += 2;

  segment.seqno = rawPacket.readUInt32BE(offset);
  offset += 4;

  segment.ackno = rawPacket.readUInt32BE(offset);
  offset += 4;

  segment.headerLength = (rawPacket[offset] & 0xf0) >> 2;

  segment.flags = decodeFlags(rawPacket, offset);
  offset += 2;

  segment.windowSize = rawPacket.readUInt16BE(offset);
  offset += 2;

  segment.checksum = rawPacket.readUInt16BE(offset);
  offset += 2;

  segment.urgentPointer = rawPacket.readUInt16BE(offset);
  offset += 2;

  segment.optionsLength = segment.headerLength - (offset - pos);
  // Skip the options
  offset += segment.optionsLength;

  segment.dataLength = segmentLength - segment.headerLength;
  if (segment.dataLength > 0 && segment.dstPort === 80) {
    segment.data = rawPacket.toString(
      'ascii',
      offset,
      offset + segment.dataLength
    );
  }

  return segment as TcpSegment;
};
