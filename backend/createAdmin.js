const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const db = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://dynamodb:8000',
  region: 'local',
  accessKeyId: 'local',
  secretAccessKey: 'local',
});

async function createAdmin() {
  const password = 'admin123';

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = {
    user_id: 'admin-001',
    name: 'System Admin',
    email: 'admin@smartparking.com',
    password: hashedPassword,
    role: 'admin',
  };

  try {
    await db.put({
      TableName: 'Users',
      Item: admin,
      ConditionExpression: 'attribute_not_exists(user_id)',
    }).promise();

    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);

  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      console.log('Admin already exists.');
    } else {
      console.error('Failed to create admin:', error);
    }
  }
}

createAdmin();