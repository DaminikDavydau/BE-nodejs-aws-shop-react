import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

const queryProduct = async (table: string, id: string) => {
  const queryReults = await dynamodb.query({
    TableName: table,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {':id': id}
  }).promise()
  return queryReults.Items
}

const queryStock = async (table: string, id: string) => {
  const queryReults = await dynamodb.query({
    TableName: table,
    KeyConditionExpression: 'product_id = :id',
    ExpressionAttributeValues: {':id': id}
  }).promise()
  return queryReults.Items
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    console.log('Incoming request:', event);

    const id = event.pathParameters?.productId;
    if (!id) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }    
    
    const product = await queryProduct(process.env.PRODUCTS_TABLE_NAME!, id);
    const stock = await queryStock(process.env.STOCKS_TABLE_NAME!, id);


    if (!product![0] || !stock![0]) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }
    let result = {
        ...product![0],
        ...stock![0]
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.log('Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
