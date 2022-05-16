const { v4: uuidv4 } = require('uuid');
const { tableClient } = require('../clients/table');

const getReviews = async () => {
  const reviews = [];

  const entities = tableClient.listEntities();
  for await (const entity of entities) {
    reviews.push(entity);
  }

  return reviews;
};

const addReview = async (imageBuffer) => {
  const uuid = uuidv4();

  await blobClient.uploadData(imageBuffer);

  const review = {
    partitionKey: 'P1',
    rowKey: uuid,
    author,
    comment,
    photoUrl,
    thumbnailUrl,
  };
};

module.exports = {
  getReviews,
  addReview,
};
