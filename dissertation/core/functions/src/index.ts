import { setGlobalOptions } from 'firebase-functions/v2';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { protos } from '@google-cloud/asset';
import { defineString } from 'firebase-functions/params';
import { AssetEvent } from './dtos/asset.dto';
import { handleGcpAsset } from './gcp/collector';
import { updateInventory } from './services/inventory';
import { updateStatistics } from './services/stats';
import { collections } from './clients/firestore';
import {
  SecurityGroupsValidator,
  SecurityValidator,
  ValidationResultFact,
} from './services/security';
import { Asset } from './models/asset.model';
import { sendTeamsNotification } from './services/notifications';

export const bigQueryDataSet = defineString('BIGQUERY_DATASET');
export const bigQueryTable = defineString('BIGQUERY_TABLE');
export const teamWebhook = defineString('MS_TEAMS_WEBHOOK');

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

const validators: SecurityValidator[] = [new SecurityGroupsValidator()];

/**
 * Function responsible for validating asset changes again specific controls.
 */
export const checkAsset = onDocumentWritten(
  `${collections.ASSETS}/{docId}`,
  async (event) => {
    if (!event.data?.after || !event.data?.after.exists) {
      return;
    }

    const violations: ValidationResultFact[] = [];

    const asset = event.data?.after?.data() as Asset;

    for (const v of validators) {
      if (!v.supportsType(asset.type)) {
        continue;
      }

      const result = v.validate(asset);
      if (!result.passed) {
        violations.push(...result.facts);
      }
    }

    if (violations.length > 0) {
      await sendTeamsNotification('New non-compliant cloud assets', violations);
    }
  }
);
