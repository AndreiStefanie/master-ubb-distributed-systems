import { setGlobalOptions } from 'firebase-functions/v2';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { protos } from '@google-cloud/asset';
import { defineString } from 'firebase-functions/params';
import { AssetEvent } from './dtos/asset.dto';
import { handleGcpAsset } from './gcp/collector';
import { updateInventory } from './services/inventory';
import { updateStatistics } from './services/stats';

export const bigQueryDataSet = defineString('BIGQUERY_DATASET');
export const bigQueryTable = defineString('BIGQUERY_TABLE');

const region = 'europe-central2';
const gcpFeedTopic = 'sap-rti-topic-gcp-feed';
const inventoryTopic = 'sap-rti-topic-inventory';

setGlobalOptions({
  region,
});

/**
 * Function responsible to handle assets as received from Google Cloud integrations.
 */
export const googleCloudCollector =
  onMessagePublished<protos.google.cloud.asset.v1.TemporalAsset>(
    {
      topic: gcpFeedTopic,
      serviceAccount:
        'collectors@sap-real-time-inventory-core.iam.gserviceaccount.com',
    },
    async (event) => {
      await handleGcpAsset(
        event.data.message.json,
        event.data.message.publishTime
      );
    }
  );

/**
 * Function responsible to handle new assets provided by the collectors
 */
export const handleAsset = onMessagePublished<AssetEvent>(
  { topic: inventoryTopic },
  async (event) => {
    const data = event.data.message.json;

    // Store the current state of the asset as the main document and add the version
    const result = await updateInventory(data);
    if (!result) {
      return;
    }

    await updateStatistics(event.id, result);
  }
);
