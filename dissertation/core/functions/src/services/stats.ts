import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryDataSet, bigQueryTable } from '..';
import { Operation } from '../dtos/asset.dto';
import { StatsEntry } from '../models/stats.model';
import { Asset } from '../models/asset.model';

const bigQuery = new BigQuery();

export const updateStatistics = async (
  eventId: string,
  asset: Asset,
  operation: Operation
): Promise<void> => {
  const entry: StatsEntry = {
    assetId: asset.id,
    version: asset.version,
    operation: operation,
    changeTime: bigQuery.timestamp(new Date(asset.changeTime)).value,
    inventoryTime: bigQuery.timestamp(new Date().toISOString()).value,
    assetType: asset.type,
    provider: asset.integration.provider,
    region: asset.region,
    timeToInventoryMs: Date.now() - new Date(asset.changeTime).valueOf(),
  };

  try {
    const dataset = bigQuery.dataset(bigQueryDataSet.value());
    const table = dataset.table(bigQueryTable.value());
    await table.insert({ insertIt: eventId, json: entry }, { raw: true });
  } catch (error) {
    console.error(`Could not write to BigQuery: ${JSON.stringify(error)}`);
  }
};
