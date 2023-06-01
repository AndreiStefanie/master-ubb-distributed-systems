import { Operation } from '../dtos/asset.dto';

export interface StatsEntry {
  assetId: string;
  version: string;
  operation: Operation;
  changeTime: string;
  inventoryTime: string;
  timeToInventoryMs: number;
  assetType: string;
  provider: string;
  region?: string;
}
