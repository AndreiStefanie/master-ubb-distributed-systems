import { ResourceManagementClient } from '@azure/arm-resources';
import {
  ClientSecretCredential,
  DefaultAzureCredential,
} from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const keyVaultName = process.env['KEY_VAULT_NAME'];

if (!keyVaultName) {
  throw new Error('KEY_VAULT_NAME must be set');
}

const cachedCredentials: Set<ClientSecretCredential> = new Set();

const url = 'https://' + keyVaultName + '.vault.azure.net';

export const getRMClient = async (subscriptionId: string, tenantId: string) => {
  if (!cachedCredentials[subscriptionId]) {
    const kvClient = new SecretClient(url, new DefaultAzureCredential());
    const secret = await kvClient.getSecret(subscriptionId);
    const [clientId, clientSecret] = secret.value.split(':');
    cachedCredentials[subscriptionId] = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );
  }

  return new ResourceManagementClient(
    cachedCredentials[subscriptionId],
    subscriptionId
  );
};
