import { Asset, AssetEvent, Operation } from './asset.model';
import { ChangeType, Detail } from './config';

export const mapAWSToRTIAsset = (detail: Detail): AssetEvent => {
  if (!detail?.configurationItem) {
    throw new Error('Missing configuration item');
  }

  const asset: Asset = {
    id: detail.configurationItem.ARN,
    integration: {
      id: detail.configurationItem.awsAccountId,
      provider: 'aws',
    },
    changeTime: getDateString(detail.configurationItem.configurationItemCaptureTime!),
    deleted: detail.configurationItemDiff?.changeType === 'DELETE',
    name: (detail.configurationItem.resourceName || detail.configurationItem.resourceId)!,
    region: detail.configurationItem.awsRegion!,
    source: detail.configurationItem,
    type: detail.configurationItem.resourceType!,
    version: getDateString(detail.configurationItem.configurationItemCaptureTime!),
  };

  return {
    asset,
    operation: getOperation(detail.configurationItemDiff?.changeType),
  };
};

const getOperation = (changeType?: ChangeType): Operation => {
  switch (changeType) {
    case 'CREATE':
      return Operation.CREATE;
    case 'DELETE':
      return Operation.DELETE;
    case 'UPDATE':
      return Operation.UPDATE;
    default:
      console.log(`Unhandled change type: ${changeType}`);
      return Operation.CREATE;
  }
};

const getDateString = (date: string | Date): string => new Date(date).toISOString();
