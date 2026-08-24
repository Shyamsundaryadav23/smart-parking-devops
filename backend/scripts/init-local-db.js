const AWS = require('aws-sdk');

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
const db = new AWS.DynamoDB({
  endpoint,
  region: process.env.AWS_REGION || 'local',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  httpOptions: { connectTimeout: 2000, timeout: 5000 },
});

const tables = [
  {
    TableName: 'Users',
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'user_id', KeyType: 'HASH' }],
    GlobalSecondaryIndexes: [{
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    }],
  },
  {
    TableName: 'ParkingLots',
    AttributeDefinitions: [{ AttributeName: 'lot_id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'lot_id', KeyType: 'HASH' }],
  },
  {
    TableName: 'ParkingSlots',
    AttributeDefinitions: [
      { AttributeName: 'slot_id', AttributeType: 'S' },
      { AttributeName: 'lot_id', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'slot_id', KeyType: 'HASH' }],
    GlobalSecondaryIndexes: [{
      IndexName: 'lot-index',
      KeySchema: [{ AttributeName: 'lot_id', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    }],
  },
  {
    TableName: 'Reservations',
    AttributeDefinitions: [
      { AttributeName: 'reservation_id', AttributeType: 'S' },
      { AttributeName: 'user_id', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'reservation_id', KeyType: 'HASH' }],
    GlobalSecondaryIndexes: [{
      IndexName: 'user-index',
      KeySchema: [{ AttributeName: 'user_id', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    }],
  },
];

function createTable(table) {
  return db.createTable({
    ...table,
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  }).promise();
}

async function initialize() {
  let lastError;

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      for (const table of tables) {
        try {
          await createTable(table);
          console.log(`Created ${table.TableName}`);
        } catch (error) {
          if (error.code === 'ResourceInUseException') {
            console.log(`Already exists ${table.TableName}`);
          } else {
            throw error;
          }
        }
      }
      return;
    } catch (error) {
      lastError = error;
      console.log(`DynamoDB is not ready (attempt ${attempt}/10): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw lastError;
}

initialize().catch((error) => {
  console.error(`Database initialization failed: ${error.message}`);
  process.exit(1);
});
