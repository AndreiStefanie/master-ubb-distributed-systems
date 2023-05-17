import { logger } from 'firebase-functions/v2';
import { AssetEvent, Operation } from '../dtos/asset.dto';
import { collections, db } from '../firebase';

export const updateInventory = async (data: AssetEvent) => {
  const ref = db.collection(collections.ASSETS).doc(data.asset.id);
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
            .doc(new Date(data.asset.version).valueOf().toString()),
          data.asset
        );
      });
    }
  } catch (error) {
    logger.error(`Failed to store asset: ${error}`);
  }
};
