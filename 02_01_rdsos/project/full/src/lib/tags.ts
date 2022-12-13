import { sliceBuffer } from './tools';
import { Tags } from './wifi';

const elementIds = {
  SSID: 0,
  CHANNEL: 3,
  QBSS: 11,
  RSN: 48,
};

const decodeFlag = (
  buf: Buffer,
  offset: number
): { tags: Tags; length: number } => {
  const tags: Tags = {};

  let pos = offset;

  const typeId = buf[pos++];
  const length = buf[pos++];

  switch (typeId) {
    case elementIds.SSID:
      tags.ssid = sliceBuffer(buf, pos, pos + length).toString();
      break;
    case elementIds.CHANNEL:
      tags.channel = buf[pos];
      break;
    case elementIds.QBSS:
      tags.stationCount = buf.readUint16LE(pos);
      tags.utilization = buf.readUint8(pos + 2);
      break;
    case elementIds.RSN:
      break;
    default:
      break;
  }

  return { tags, length };
};

/**
 *
 * @param {Buffer} buf
 * @returns
 */
export default (buf: Buffer) => {
  let result = {};
  // Beacon frame body starts at 24
  // Timestamp, beacon interval, and compatibility info are 12 bytes
  let offset = 36;

  // FCS takes the last 4 bytes and 2 for the last flag
  while (buf.length - offset >= 6) {
    const r = decodeFlag(buf, offset);
    offset += r.length + 2;
    result = { ...result, ...r.tags };
  }

  return result;
};
