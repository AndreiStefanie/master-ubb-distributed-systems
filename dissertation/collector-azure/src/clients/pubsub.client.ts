import { PubSub } from '@google-cloud/pubsub';
import { ExternalAccountClient } from 'google-auth-library';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';

export const inventoryTopic = 'sap-rti-topic-inventory';

let authClient: JSONClient;
const getClient = (): JSONClient => {
  if (authClient) {
    return authClient;
  }

  const jsonConfig = require('../../creds-config.json');
  const url = `${process.env.IDENTITY_ENDPOINT}?api-version=2019-08-01&resource=${process.env.RESOURCE_URI}&client_id=${process.env.AZURE_CLIENT_ID}`;

  jsonConfig.credential_source.headers = {
    ...jsonConfig.credential_source.headers,
    //@ts-ignore
    'X-IDENTITY-HEADER': process.env.IDENTITY_HEADER,
  };
  jsonConfig.credential_source.url = url;
  //@ts-ignore
  authClient = ExternalAccountClient.fromJSON(jsonConfig);
  authClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];

  return authClient;
};

export const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  authClient: getClient(),
});
