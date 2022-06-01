const { v4: uuidv4 } = require('uuid');
const { tableClient } = require('../clients/table');
const { getBlobClient } = require('../clients/blob');

const PARTITION_KEY = 'P1';

const getReviews = async () => {
  const reviews = [];

  const entities = tableClient.listEntities();
  for await (const entity of entities) {
    reviews.push(entity);
  }

  return reviews;
};

const addReview = async (author, comment, file) => {
  const uuid = uuidv4();

  // Upload the image
  const blobClient = getBlobClient(`${uuid}-${file.originalname}`);
  await blobClient.uploadData(file.buffer, { metadata: { id: uuid } });

  const review = {
    partitionKey: PARTITION_KEY,
    rowKey: uuid,
    author,
    comment,
    imageUrl: blobClient.url,
  };

  await tableClient.createEntity(review);

  return review;
};

const updateReview = async (id, thumbnailUrl) => {
  const entity = await tableClient.getEntity(PARTITION_KEY, id);
  await tableClient.updateEntity({ ...entity, thumbnailUrl });
};

module.exports = {
  getReviews,
  addReview,
  updateReview,
};
