import pcap from 'pcap';

export const flagsToArray = (data: number, size: number) => {
  const flags = [];
  for (let i = 0; i < size; i++) {
    if ((data & (1 << i)) > 0) {
      flags.push(1);
    } else {
      flags.push(0);
    }
  }
  return flags;
};

export const readBigUInt64BE = (buffer: Buffer, offset = 0) => {
  const hi = buffer.readUInt32BE(offset);
  const lo = buffer.readUInt32BE(offset + 4);
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
};

// eslint-disable-next-line no-extend-native, @typescript-eslint/no-explicit-any, func-names
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const sliceBuffer = (buf: Buffer, start = 0, len = 0) =>
  Buffer.from(Uint8Array.prototype.slice.call(buf, start, len));

export const slicePacket = ({ header, buf }: pcap.PacketWithHeader): Buffer => {
  const len = header.readUInt32LE(12);
  return sliceBuffer(buf, 0, len);
};
