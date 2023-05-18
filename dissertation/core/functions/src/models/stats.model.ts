import { Timestamp } from 'firebase-admin/firestore';
import { Operation } from '../dtos/asset.dto';

export interface StatsEntry {
  assetId: string;
  version: string;
  operation: Operation;
  changeTime: Timestamp;
  inventoryTime: Timestamp;
  timeToInventoryMs: number;
}
