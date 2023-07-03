import { EventBridgeEvent, Handler } from 'aws-lambda';
import { inventoryTopic, pubSubClient } from './pubsub.client';
import { mapAWSToRTIAsset } from './mapper';
import { Detail } from './config';

export const handler: Handler = async (
  event: EventBridgeEvent<'Config Configuration Item Change', Detail>,
): Promise<void> => {
  try {
    const assetEvent = mapAWSToRTIAsset(event.detail);

    console.debug(`Received event for ${assetEvent.asset.name}`);

    await pubSubClient.topic(inventoryTopic).publishMessage({ json: assetEvent });
  } catch (error) {
    console.debug(JSON.stringify(event.detail));

    console.error(`Could not handle AWS asset: ${error}`);
  }
};
