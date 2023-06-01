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
  async (data) => {
    await handleGcpAsset(data);
  }
);

listen<AssetEvent>(
  'projects/sap-real-time-inventory-core/subscriptions/local',
  async (data, messageId) => {
    const asset = await updateInventory(data);
    if (!asset) {
      return;
    }

    await updateStatistics(messageId, asset, data.operation);
  }
);
