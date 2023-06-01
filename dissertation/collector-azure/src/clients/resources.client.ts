import { ResourceManagementClient } from '@azure/arm-resources';
import { DefaultAzureCredential } from '@azure/identity';

if (!process.env.WEBSITE_OWNER_NAME) {
  throw new Error('Missing WEBSITE_OWNER_NAME');
}

const subscriptionId = process.env.WEBSITE_OWNER_NAME.split('+')[0];

export const rmClient = new ResourceManagementClient(
  new DefaultAzureCredential(),
  subscriptionId
);
