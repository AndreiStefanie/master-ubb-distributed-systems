import { protos } from '@google-cloud/asset';
import { providers } from '../common';
import { Operation } from '../dtos/asset.dto';
import { Asset } from '../models/asset.model';
import { Timestamp } from 'firebase-admin/firestore';

export const mapGCPToRTIAsset = (
  source: protos.google.cloud.asset.v1.TemporalAsset
): Asset => {
  const gcpAsset = source.asset || source.priorAsset;

  if (!gcpAsset || !gcpAsset.resource) {
    throw new Error('No asset info');
  }

  return {
    integration: {
      id: getIntegrationId(source),
      provider: providers.GOOGLE_CLOUD,
    },
    id: getAssetId(source),
    name: getAssetName(source),
    providerUrl: '',
    region: gcpAsset.resource?.location || '',
    type: gcpAsset.assetType!,
    version: gcpAsset.updateTime as string,
    changeTime: getDate(gcpAsset.updateTime as string),
    deleted: source.deleted || false,
    source: gcpAsset.resource.data,
  };
};

const getAssetId = (
  source: protos.google.cloud.asset.v1.TemporalAsset
): string =>
  //@ts-ignore
  source.asset?.resource?.data?.id ||
  //@ts-ignore
  source.priorAsset?.resource?.data?.id;

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

const getDate = (dateString: string): Date =>
  Timestamp.fromDate(new Date(dateString)).toDate();

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
