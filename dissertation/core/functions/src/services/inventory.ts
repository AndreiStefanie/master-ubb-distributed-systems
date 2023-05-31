import { logger } from 'firebase-functions/v2';
import { AssetEvent, Operation } from '../dtos/asset.dto';
import { collections, db } from '../clients/firestore';
import { StatsEntry } from '../models/stats.model';
import { Timestamp } from 'firebase-admin/firestore';

export const updateInventory = async (data: AssetEvent) => {
  const ref = db
    .collection(collections.ASSETS)
    .doc(encodeURIComponent(data.asset.id));
  try {
    if (data.operation === Operation.DELETE) {
      // Only update the deleted and the version fields in case the asset was deleted
      const doc = await ref.get();
      if (doc.exists) {
        await ref.set(
          { deleted: true, version: data.asset.version },
          { merge: true }
        );
      } else {
        logger.info(
          `Untracked asset ${data.asset.name} was deleted from the provider`
        );
      }
    } else {
      await db.runTransaction(async (t) => {
        t.set(ref, data.asset);
        t.create(
          ref
            .collection(collections.ASSET_VERSIONS)
            .doc(getAssetVersionDocId(data)),
          data.asset
        );
      });
    }

    await updateStatistics(data);
  } catch (error) {
    logger.error(`Failed to store asset: ${error}`);
  }
};

const getAssetVersionDocId = (data: AssetEvent): string =>
  new Date(data.asset.version).valueOf().toString();

const updateStatistics = async (data: AssetEvent): Promise<void> => {
  const entry: StatsEntry = {
    assetId: data.asset.id,
    version: data.asset.version,
    operation: data.operation,
    changeTime: Timestamp.fromDate(new Date(data.asset.changeTime)),
    inventoryTime: Timestamp.now(),
    timeToInventoryMs:
      Timestamp.now().toMillis() -
      Timestamp.fromDate(new Date(data.asset.changeTime)).toMillis(),
  };

  await db.collection(collections.STATS).add(entry);
};
