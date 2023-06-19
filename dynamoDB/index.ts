import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

AWS.config.update({ region: 'eu-west-1' }); // Replace 'YOUR_REGION' with your desired AWS region

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function insertTestData() {
  // Insert test data into the products table

  let product1 = uuid.v4();
  let product2 = uuid.v4();
  let product3 = uuid.v4();

  const products = [
    { id: product1, title: 'Milk', description: 'Some text', price: 3 },
    { id: product2, title: 'Bread', description: 'Some text', price: 6 },
    { id: product3, title: 'Eggs', description: 'Some text', price: 7 },
  ];

  for (const product of products) {
    const params = {
      TableName: 'products',
      Item: product,
    };

    await dynamodb.put(params).promise();
    console.log(`Inserted product with ID ${product.id}`);
  }

  // Insert test data into the stocks table
  const stocks = [
    { product_id: product1, count: 5 },
    { product_id: product2, count: 10 },
    { product_id: product3, count: 15 },
  ];

  for (const stock of stocks) {
    const params = {
      TableName: 'stocks',
      Item: stock,
    };

    await dynamodb.put(params).promise();
    console.log(`Inserted stock for product ID ${stock.product_id}`);
  }
}