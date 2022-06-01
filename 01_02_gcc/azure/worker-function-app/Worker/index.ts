import { AzureFunction, Context } from '@azure/functions';
import { BlockBlobClient } from '@azure/storage-blob';
import { QueueClient } from '@azure/storage-queue';
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
  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  const blobClient = new BlockBlobClient(
    process.env.stfincorpprod_STORAGE,
    process.env.BLOB_CONTAINER,
    `min-${blobName}`
  );

  try {
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' },
    });
    const queueClient = new QueueClient(
      process.env.stfincorpprod_STORAGE,
      'events'
    );
    await queueClient.sendMessage(
      JSON.stringify({
        specversion: '1.0',
        type: 'thumbnail-created',
        source: `/${blobName}`,
        id: context.invocationId,
        time: new Date(),
        datacontenttype: 'application/json',
        data: {
          id: context.bindingData.metadata['id'],
          thumbnailUrl: blobClient.url,
        },
      })
    );
  } catch (err) {
    context.log.error(err.message);
    return;
  }
};

export default blobTrigger;
