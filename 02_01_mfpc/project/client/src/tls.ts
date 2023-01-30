import { ChannelCredentials, credentials } from '@grpc/grpc-js';
import * as fs from 'fs';
import * as path from 'path';

export function loadTLSCredentials(insecure: boolean): ChannelCredentials {
  if (insecure) {
    return credentials.createInsecure();
  }

  const rootCert = fs.readFileSync(
    path.resolve(__dirname, '../../cert/ca-cert.pem'),
  );

  const channelCredentials = ChannelCredentials.createSsl(rootCert);

  return channelCredentials;
}
