import { protos } from '@google-cloud/asset';
import { listen } from './clients/pubsub';
import { AssetEvent } from './dtos/asset.dto';
import { updateInventory } from './services/inventory';
import { handleGcpAsset } from './gcp/collector';
import { db } from './clients/firestore';
import { updateStatistics } from './services/stats';

db.settings({ host: 'localhost', ssl: false, port: 8080 });

listen<protos.google.cloud.asset.v1.TemporalAsset>(
  'projects/sap-real-time-inventory-core/subscriptions/local-feed',
  async (data, _, publishTime) => {
    await handleGcpAsset(data, publishTime);
  }
);

listen<AssetEvent>(
  'projects/sap-real-time-inventory-core/subscriptions/local',
  async (data, messageId) => {
    const result = await updateInventory(data);
    if (!result) {
      return;
    }

    await updateStatistics(messageId, result);
  }
);
