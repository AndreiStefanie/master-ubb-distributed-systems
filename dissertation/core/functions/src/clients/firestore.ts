import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const app = initializeApp();

export const db = getFirestore(app);
export const serverTimestamp = FieldValue.serverTimestamp;
export const increment = FieldValue.increment;

export const collections = {
  ASSETS: 'assets',
  ASSET_VERSIONS: 'versions',
  STATS: 'stats',
  INCOMPLETE_ASSETS: 'incomplete_assets',
};
