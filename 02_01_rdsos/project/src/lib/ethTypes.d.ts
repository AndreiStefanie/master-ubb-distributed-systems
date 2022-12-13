export interface IpFlags {
  reserved: boolean;
  doNotFragment: boolean;
  moreFragments: boolean;
}

export interface TcpFlags {
  nonce: boolean;
  cwr: boolean;
  ece: boolean;
  urg: boolean;
  ack: boolean;
  psh: boolean;
  rst: boolean;
  syn: boolean;
  fin: boolean;
}

export interface TcpSegment {
  srcPort: number;
  dstPort: number;
  seqno: number;
  ackno: number;
  headerLength: number;
  flags: TcpFlags;
  windowSize: number;
  checksum: number;
  urgentPointer: number;
  optionsLength: number;
  dataLength: number;
  data?: string;
}

export interface IpPacket {
  version: number;
  headerLength: number;
  dscp: number;
  length: number;
  identification: number;
  flags: IpFlags;
  fragmentOffset: number;
  ttl: number;
  protocol: number;
  headerChecksum: number;
  srcIpAddress: string;
  dstIpAddress: string;
  tcp: TcpSegment;
}

export interface EthFrame {
  id: string;
  destMAC: string;
  srcMAC: string;
  etherType: number;
  ip: IpPacket;
}
