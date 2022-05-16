const { TableClient } = require('@azure/data-tables');

const client = TableClient.fromConnectionString(
  process.env.CONNECTION_STRING,
  'reviews'
);

exports.tableClient = client;
