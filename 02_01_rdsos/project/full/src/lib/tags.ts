import { Tags } from './types';

const elementIds = {
  SSID: 0,
  CHANNEL: 3,
  QBSS: 11,
  RSN: 48,
};

const decodeFlag = (
  buf: Uint8Array,
  offset: number
): { tags: Tags; length: number } => {
  const tags: Tags = {};

  let pos = offset;

  const typeId = buf[pos++];
  const length = buf[pos++];
  const value = buf.slice(pos, pos + length);

  switch (typeId) {
    case elementIds.SSID:
      tags.ssid = value.toString();
      break;
    case elementIds.CHANNEL:
      tags.channel = buf[pos];
      break;
    case elementIds.QBSS:
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
export default (buf: Uint8Array) => {
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
