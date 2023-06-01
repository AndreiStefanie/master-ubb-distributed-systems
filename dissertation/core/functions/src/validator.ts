import * as yup from 'yup';
import { AssetEvent, Operation } from './dtos/asset.dto';
import { providers } from './common';

const assetEventSchema: yup.ObjectSchema<AssetEvent> = yup.object({
  asset: yup.object({
    id: yup.string().required(),
    integration: yup.object({
      id: yup.string().required(),
      provider: yup.string().oneOf(Object.values(providers)).required(),
    }),
    type: yup.string().required(),
    version: yup.string().required(),
    changeTime: yup.string().required(),
    deleted: yup.boolean().required(),
    name: yup.string(),
    region: yup.string(),
    source: yup.object(),
  }),
  operation: yup.string().oneOf(Object.values(Operation)).required(),
});

export const validateAssetEvent = (assetEvent: AssetEvent) =>
  assetEventSchema.validate(assetEvent, { abortEarly: false });
