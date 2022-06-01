const { BlockBlobClient } = require('@azure/storage-blob');

const getBlobClient = (blobName) =>
  new BlockBlobClient(
    process.env.CONNECTION_STRING,
    process.env.BLOB_CONTAINER,
    blobName
  );

module.exports = { getBlobClient };
