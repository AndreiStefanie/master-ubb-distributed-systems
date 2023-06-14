import { protos } from '@google-cloud/asset';
import { mapGCPToRTIAsset } from './gcp.mapper';
import { logger } from 'firebase-functions/v2';
import { inventoryTopic, pubSubClient } from '../clients/pubsub';

export const handleGcpAsset = async (
  data: protos.google.cloud.asset.v1.TemporalAsset,
  eventTime: string
) => {
  const assetEvent = mapGCPToRTIAsset(data, eventTime);

  logger.debug(
    `Received event for ${assetEvent.asset.name}, prior asset state: ${data.priorAssetState}`
  );

  try {
    await pubSubClient
      .topic(inventoryTopic)
      .publishMessage({ json: assetEvent });
  } catch (error) {
    logger.error(`Error while publishing: ${error.message}`);
  }
};
