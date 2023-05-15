import { setGlobalOptions } from 'firebase-functions/v2';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as logger from 'firebase-functions/logger';
// import { db, collections } from './firebase';

const region = 'europe-central2';
const inventoryTopic = 'sap-rti-topic-inventory';
const gcpFeedTopic = 'sap-rti-topic-gcp-feed';

setGlobalOptions({
  region,
});

export const handleAsset = onMessagePublished(
  { topic: inventoryTopic },
  async (event) => {
    logger.info(`Received asset ${event.data.message.json}`);
    // await db.collection(collections.ASSETS).doc('')
  }
);

export const googleCloudCollector = onMessagePublished(
  {
    topic: gcpFeedTopic,
    serviceAccount:
      'collectors@sap-real-time-inventory-core.iam.gserviceaccount.com',
  },
  async (event) => {
    logger.info(`Received asset ${JSON.stringify(event.data.message.json)}`);
    // await db.collection(collections.ASSETS).doc('')
  }
);
