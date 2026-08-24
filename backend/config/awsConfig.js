// const AWS = require('aws-sdk');

// dotenv = require('dotenv');
// dotenv.config();

// // Configure AWS SDK with region and credentials from environment variables
// AWS.config.update({
//   region: process.env.AWS_REGION || 'us-east-1',
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// const dynamoDb = new AWS.DynamoDB.DocumentClient();

// module.exports = dynamoDb;
const AWS = require('aws-sdk');
require('dotenv').config();

const isLocal = Boolean(process.env.DYNAMODB_ENDPOINT);

AWS.config.update({
  region: process.env.AWS_REGION || 'local',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || (isLocal ? 'local' : undefined),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || (isLocal ? 'local' : undefined),
});

const clientOptions = isLocal
  ? { endpoint: new AWS.Endpoint(process.env.DYNAMODB_ENDPOINT) }
  : {};

const dynamoDb = new AWS.DynamoDB.DocumentClient(clientOptions);

module.exports = dynamoDb;