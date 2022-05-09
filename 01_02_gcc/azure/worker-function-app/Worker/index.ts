import { AzureFunction, Context } from '@azure/functions';
import { BlockBlobClient } from '@azure/storage-blob';
import Jimp = require('jimp');

const ICON_SIZE = 128;

const blobTrigger: AzureFunction = async function (
  context: Context,
  imageBlob: any
): Promise<void> {
  context.log(
    'Blob trigger function processed blob \n Name:',
    context.bindingData.name,
    '\n Blob Size:',
    imageBlob.length,
    'Bytes'
  );

  const blobName = context.bindingData.name as string;

  // Avoid resizing already resized images
  if (blobName.startsWith('min')) {
    return;
  }

  const image = await Jimp.read(imageBlob);
  image.resize(ICON_SIZE, ICON_SIZE);
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

  const blobClient = new BlockBlobClient(
    process.env.stfincorpprod_STORAGE,
    process.env.BLOB_CONTAINER,
    `min-${blobName}`
  );

  try {
    await blobClient.uploadData(buffer);
  } catch (err) {
    context.log(err.message);
  }
};

export default blobTrigger;
