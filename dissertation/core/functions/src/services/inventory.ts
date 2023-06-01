import { logger } from 'firebase-functions/v2';
import { AssetEvent, Operation } from '../dtos/asset.dto';
import { collections, db } from '../clients/firestore';
import { StatsEntry } from '../models/stats.model';
import { Timestamp } from 'firebase-admin/firestore';
import { validateAssetEvent } from '../validator';
import { ValidationError } from 'yup';

export const updateInventory = async (data: AssetEvent) => {
  try {
    await validateAssetEvent(data);
  } catch (error) {
    // If the validation fails, store the asset in a separate collection
    // for future inspection.
    if (error instanceof ValidationError) {
      console.warn(error.errors);
      await db
        .collection(collections.INCOMPLETE_ASSETS)
        .add({ ...data, validationErrors: error.errors });
      return;
    } else {
      console.error(error.message);
      return;
    }
  }

  try {
    const ref = db
      .collection(collections.ASSETS)
      .doc(encodeURIComponent(data.asset.id));

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
          `Untracked asset ${
            data.asset.name || data.asset.id
          } was deleted from ${data.asset.integration.provider}`
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
