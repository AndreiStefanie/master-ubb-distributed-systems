const { QueueClient } = require('@azure/storage-queue');

const getQueueClient = (queue) =>
  new QueueClient(process.env.CONNECTION_STRING, queue);

module.exports = { getQueueClient };
