import { flagsToArray } from './tools';
import { RadiotapHeader } from './wifiTypes';

/**
 * Parse the radiotap header
 * https://www.radiotap.org
 * @param {Buffer} buf
 */
export default (buf: Buffer) => {
  // https://www.radiotap.org/fields/defined (See the bit number for each field)
  // or https://github.com/radiotap/radiotap-library/blob/master/radiotap.h#L59
  const rtTypes = {
    TSFT: 0,
    FLAGS: 1,
    RATE: 2,
    CHANNEL: 3,
    FHSS: 4,
    DBM_ANTSIGNAL: 5,
    DBM_ANTNOISE: 6,
    LOCK_QUALITY: 7,
    TX_ATTENUATION: 8,
    DB_TX_ATTENUATION: 9,
    DBM_TX_POWER: 10,
    ANTENNA: 11,
    DB_ANTSIGNAL: 12,
    DB_ANTNOISE: 13,
    RX_FLAGS: 14,
    TX_FLAGS: 15,
    RTS_RETRIES: 16,
    DATA_RETRIES: 17,
    XCHANNEL: 18,
    EXT: 31,
  };

  const header: RadiotapHeader = {
    version: buf.readUInt8(0),
    pad: buf.readUInt8(1),
    length: buf.readUInt16LE(2),
  };

  const fields = flagsToArray(buf.readUInt32LE(4), 32);
  let offset = 0;

  let extraFields = { ...fields };
  while (extraFields[rtTypes.EXT]) {
    offset += 4;
    extraFields = flagsToArray(buf.readUInt32LE(offset), 32);
  }

  if (fields[rtTypes.TSFT]) {
    // 8 alignment
    offset += 8;
    // header.tsft = buf.slice(offset, offset + 8);
    offset += 8;
  }

  if (fields[rtTypes.FLAGS]) {
    // header.flags = tools.flagsToArray(buf.readUInt8(offset), 8);
    offset += 1;
  }

  if (fields[rtTypes.RATE]) {
    header.rate = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.CHANNEL]) {
    header.frequency = buf.readUInt16LE(offset);
    offset += 2;
    const chFlags = buf.readUInt16LE(offset);
    header.channelFlags = {
      turbo: (chFlags & 0x0010) > 0,
      CCK: (chFlags & 0x0020) > 0,
      OFDM: (chFlags & 0x0040) > 0,
      twoGhz: (chFlags & 0x0080) > 0,
      fiveGhz: (chFlags & 0x0100) > 0,
      onlyPassiveScan: (chFlags & 0x0200) > 0,
      dynamicCCKOFDM: (chFlags & 0x0400) > 0,
      GFSK: (chFlags & 0x0800) > 0,
    };
    offset += 2;
  }

  if (fields[rtTypes.FHSS]) {
    header.fhss = {
      hopSet: buf.readUInt8(offset),
      hopPattern: buf.readUInt8(offset + 1),
    };
    offset += 2;
  }

  if (fields[rtTypes.DBM_ANTSIGNAL]) {
    header.dbmSignal = buf.readInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.DBM_ANTNOISE]) {
    header.dbmNoise = buf.readInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.LOCK_QUALITY]) {
    header.lockQuality = buf.readUInt16LE(offset);
    offset += 2;
  }

  if (fields[rtTypes.TX_ATTENUATION]) {
    header.txAttenuation = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.DB_TX_ATTENUATION]) {
    header.dbTxAttenuation = buf.readUInt16LE(offset);
    offset += 2;
  }

  if (fields[rtTypes.DBM_TX_POWER]) {
    header.dbmTxPower = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.ANTENNA]) {
    header.antenna = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.DB_ANTSIGNAL]) {
    header.dbAntennaSignal = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.DB_ANTNOISE]) {
    header.dbAntennaNoise = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.RX_FLAGS]) {
    offset += 1;
    header.rxFlags = buf.readUInt16LE(offset);
    offset += 2;
  }

  if (fields[rtTypes.TX_FLAGS]) {
    offset += 1;
    header.txFlags = buf.readUInt16LE(offset);
    offset += 2;
  }

  if (fields[rtTypes.RTS_RETRIES]) {
    header.rtsRetries = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.DATA_RETRIES]) {
    header.dataRetries = buf.readUInt8(offset);
    offset += 1;
  }

  if (fields[rtTypes.XCHANNEL]) {
    header.frequency = buf.readUInt16LE(offset);
    offset += 2;

    header.channel = buf.readUInt8(offset);
    offset += 1;
  }

  return header;
};
