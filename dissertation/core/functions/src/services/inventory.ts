import { logger } from 'firebase-functions/v2';
import { ValidationError } from 'yup';
import * as hash from 'object-hash';
import { AssetEvent, Operation } from '../dtos/asset.dto';
import { collections, db } from '../clients/firestore';
import { validateAssetEvent } from '../validator';
import { Asset } from '../models/asset.model';

export const updateInventory = async (
  data: AssetEvent
): Promise<Asset | null> => {
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
      return null;
    } else {
      console.error(error.message);
      return null;
    }
  }

  const ref = db.collection(collections.ASSETS).doc(getAssetDocId(data.asset));

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
          `Untracked asset ${
            data.asset.name || data.asset.id
          } was deleted from ${data.asset.integration.provider}`
        );
        return null;
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
  } catch (error) {
    logger.error(`Failed to store asset: ${error}`);
    await db
      .collection(collections.INCOMPLETE_ASSETS)
      .add({ ...data, validationErrors: [error.message] });
    return null;
  }

  const doc = await ref.get();
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Asset;
};

const getAssetDocId = (asset: Asset): string => hash(asset.id);

const getAssetVersionDocId = (data: AssetEvent): string =>
  new Date(data.asset.version).valueOf().toString();
