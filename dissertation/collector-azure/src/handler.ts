import {
  ResourceDeleteSuccessEventData,
  ResourceWriteSuccessEventData,
} from '@azure/eventgrid';
import { rmClient } from './clients/resources.client';
import { GenericResource } from '@azure/arm-resources';
import { Asset, AssetEvent, Operation } from './asset.model';
import { inventoryTopic, pubSubClient } from './clients/pubsub.client';
import { InvocationContext } from '@azure/functions';

export const handleResourceEvent = async (
  event: ResourceWriteSuccessEventData | ResourceDeleteSuccessEventData,
  eventTime: string,
  eventType:
    | 'Microsoft.Resources.ResourceWriteSuccess'
    | 'Microsoft.Resources.ResourceDeleteSuccess',
  context: InvocationContext
) => {
  // Map the resource to RTI asset
  let assetEvent: AssetEvent;
  const resourceType = getResourceTypeFromAction(event.operationName);

  if (eventType === 'Microsoft.Resources.ResourceDeleteSuccess') {
    assetEvent = {
      operation: Operation.DELETE,
      asset: {
        id: event.resourceUri,
        integration: {
          id: event.subscriptionId,
          provider: 'azure',
        },
        deleted: true,
        version: getDateString(eventTime),
        changeTime: getDateString(eventTime),
        type: resourceType,
      },
    };
  } else {
    // Get the current resource state
    try {
      const resource = await rmClient.resources.getById(
        event.resourceUri,
        getApiVersionForType(resourceType)
      );

      // TODO: Find a way to detect if the resource was created with this event or updated
      assetEvent = {
        operation: Operation.UPDATE,
        asset: {
          id: event.resourceUri,
          integration: {
            id: event.subscriptionId,
            provider: 'azure',
          },
          deleted: false,
          changeTime: getDateString(eventTime),
          version: getDateString(eventTime),
          type: resource.type,
          name: resource.name,
          region: resource.location,
          source: resource,
        },
      };
    } catch (error) {
      context.warn(`Could not read resource ${event.resourceUri}. ${error}`);
      return;
    }
  }

  // Push the asset to the core Pub/Sub
  await pubSubClient.topic(inventoryTopic).publishMessage({ json: assetEvent });
};

/**
 * Get the Azure-specific resource type from the operation
 * Example: Microsoft.Storage/storageAccounts/delete -> Microsoft.Storage/storageAccounts
 * @param action
 * @returns
 */
const getResourceTypeFromAction = (action: string) =>
  action.split('/').slice(0, -1).join('/');

const getDateString = (date: string | Date): string =>
  new Date(date).toISOString();

const getApiVersionForType = (resourceType: string): string => {
  switch (resourceType) {
    case 'Microsoft.Compute/disks':
      return '2022-03-02';
    default:
      return '2022-09-01';
  }
};
