import { Asset } from '../models/asset.model';

export enum Operation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface AssetEvent {
  asset: Asset;
  operation: Operation;
}
