import { protos } from '@google-cloud/asset';
import { providers } from '../common';
import { AssetEvent, Operation } from '../dtos/asset.dto';

export const mapGCPToRTIAsset = (
  source: protos.google.cloud.asset.v1.TemporalAsset,
  eventTime: string
): AssetEvent => {
  if (source.deleted) {
    if (!source.priorAsset) {
      throw new Error(`Missing prior asset for deleted asset`);
    }

    return {
      operation: Operation.DELETE,
      asset: {
        id: getAssetId(source),
        changeTime: getDateString(eventTime),
        deleted: true,
        integration: {
          id: getIntegrationId(source),
          provider: providers.GOOGLE_CLOUD,
        },
        type: source.priorAsset.assetType!,
        version: getDateString(eventTime),
        name: getAssetName(source),
      },
    };
  }
  if (!source.asset || !source.asset.resource) {
    throw new Error('No asset info');
  }

  return {
    operation: getOperation(source),
    asset: {
      integration: {
        id: getIntegrationId(source),
        provider: providers.GOOGLE_CLOUD,
      },
      id: getAssetId(source),
      name: getAssetName(source),
      region: source.asset.resource?.location || 'global',
      type: source.asset.assetType!,
      version: getDateString(source.asset.updateTime as string),
      changeTime: getDateString(source.asset.updateTime as string),
      deleted: false,
      source: source.asset.resource.data,
    },
  };
};

const getAssetId = (
  source: protos.google.cloud.asset.v1.TemporalAsset
): string =>
  //@ts-ignore
  source.asset?.resource?.data?.id ||
  //@ts-ignore
  source.priorAsset?.resource?.data?.id ||
  // The name in Google Cloud is also unique (it is the full resource path)
  getAssetName(source);

const getAssetName = (source: protos.google.cloud.asset.v1.TemporalAsset) =>
  //@ts-ignore
  source.asset?.resource?.data?.name ||
  //@ts-ignore
  source.priorAsset?.resource?.data?.name;

const getIntegrationId = (
  source: protos.google.cloud.asset.v1.TemporalAsset
): string => {
  const gcpAsset = (source.asset ||
    source.priorAsset) as protos.google.cloud.asset.v1.IAsset;

  const project = gcpAsset.ancestors?.find((a) => a.startsWith('projects/'));

  if (!project) {
    throw new Error('Could not find the project');
  }

  return project.split('/')[1];
};

/**
 * Deduce and return the operation based on the prior state and other fields
 */
export const getOperation = (
  source: protos.google.cloud.asset.v1.TemporalAsset
): Operation => {
  if (source.deleted || !source.asset) {
    return Operation.DELETE;
  }

  switch (source.priorAssetState) {
    case 'DOES_NOT_EXIST':
    case 'DELETED':
      return Operation.CREATE;

    case 'PRESENT':
      return Operation.UPDATE;
    default:
      break;
  }

  return Operation.CREATE;
};

const getDateString = (date: string | Date): string =>
  new Date(date).toISOString();
