import { protos } from '@google-cloud/asset';
import { getOperation, mapGCPToRTIAsset } from '../gcp.mapper';
import { logger } from 'firebase-functions/v2';
import { AssetEvent } from '../dtos/asset.dto';
import { inventoryTopic, pubSubClient } from '../clients/pubsub';

export const handleGcpAsset = async (
  data: protos.google.cloud.asset.v1.TemporalAsset
) => {
  const asset = mapGCPToRTIAsset(data);
  logger.debug(
    `Received event for ${asset.name}, prior asset state: ${data.priorAssetState}`
  );

  const assetEvent: AssetEvent = {
    asset,
    operation: getOperation(data),
  };

  try {
    await pubSubClient
      .topic(inventoryTopic)
      .publishMessage({ json: assetEvent });
  } catch (error) {
    logger.error(`Error while publishing: ${error.message}`);
  }
};
