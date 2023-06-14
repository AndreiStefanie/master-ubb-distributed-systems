import { logger } from 'firebase-functions/v2';
import { ValidationError } from 'yup';
import * as hash from 'object-hash';
import { AssetEvent, Operation } from '../dtos/asset.dto';
import { collections, db } from '../clients/firestore';
import { validateAssetEvent } from '../validator';
import { Asset } from '../models/asset.model';
import { providers } from '../common';

export const updateInventory = async (
  data: AssetEvent
): Promise<AssetEvent | null> => {
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
  let operation = data.operation;

  try {
    if (data.operation === Operation.DELETE) {
      // Only update the deleted and the version fields in case the asset was deleted
      const doc = await ref.get();
      if (doc.exists) {
        await ref.set(
          {
            deleted: true,
            version: data.asset.version,
            changeTime: data.asset.changeTime,
          },
          { merge: true }
        );
      } else {
        logger.info(
          `Untracked asset ${
            data.asset.name || data.asset.id
          } was deleted from ${data.asset.integration.provider}`,
          { document: doc.id }
        );
        return null;
      }
    } else {
      if (
        data.asset.integration.provider === providers.AZURE &&
        data.operation === Operation.UPDATE
      ) {
        // If the asset doesn't exist in the inventory, set to operation to 'create'.
        // This is not ideal, but it is a decent heuristic for the moment.
        const doc = await ref.get();
        if (!doc.exists) {
          operation = Operation.CREATE;
        }
      }

      const versionRef = ref
        .collection(collections.ASSET_VERSIONS)
        .doc(getAssetVersionDocId(data));

      await db.runTransaction(async (t) => {
        t.set(ref, data.asset);
        t.set(versionRef, data.asset);
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

  return { asset: doc.data() as Asset, operation };
};

const getAssetDocId = (asset: Asset): string => hash(asset.id);

const getAssetVersionDocId = (data: AssetEvent): string =>
  new Date(data.asset.version).valueOf().toString();
