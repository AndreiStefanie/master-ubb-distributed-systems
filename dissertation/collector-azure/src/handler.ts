import {
  ResourceDeleteSuccessEventData,
  ResourceWriteSuccessEventData,
} from '@azure/eventgrid';
import { rmClient } from './clients/resources.client';
import { GenericResource } from '@azure/arm-resources';
import { Asset, AssetEvent, Operation } from './asset.model';
import { inventoryTopic, pubSubClient } from './clients/pubsub.client';

export const handleResourceEvent = async (
  event: ResourceWriteSuccessEventData | ResourceDeleteSuccessEventData,
  eventTime: string,
  eventType: 'ResourceWriteSuccess' | 'ResourceDeleteSuccess'
) => {
  // Map the resource to RTI asset
  let assetEvent: AssetEvent;
  if (eventType === 'ResourceDeleteSuccess') {
    assetEvent = {
      operation: Operation.DELETE,
      asset: {
        id: event.resourceUri,
        deleted: true,
        version: eventTime,
      },
    };
  } else {
    // Get the current resource state
    const resource = await rmClient.resources.getById(
      event.resourceUri,
      '2022-09-01'
    );

    // TODO: Find a way to detect if the resource was created with this event or updated
    assetEvent = {
      operation: Operation.UPDATE,
      asset: mapAzureResourceToRTIAsset(
        resource,
        event.subscriptionId,
        eventTime
      ),
    };
  }

  // Push the asset to the core Pub/Sub
  await pubSubClient.topic(inventoryTopic).publishMessage({ json: assetEvent });
};

const mapAzureResourceToRTIAsset = (
  resource: GenericResource,
  subscriptionId: string,
  eventTime: string
): Asset => ({
  id: resource.id,
  integration: {
    id: subscriptionId,
    provider: 'azure',
  },
  changeTime: new Date(eventTime),
  deleted: false,
  name: resource.name,
  providerUrl: '',
  region: resource.location,
  source: resource,
  type: resource.type,
  version: eventTime,
});
