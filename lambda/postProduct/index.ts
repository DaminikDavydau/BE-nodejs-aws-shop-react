import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    console.log('Incoming request:', event);

    const body = JSON.parse(event.body!);

    // POST /products lambda functions returns error 400 status code if product data is invalid
    if (!body.title || !body.price || !body.description || !body.count) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid product data' }),
      };
    }

    let price = parseFloat(body.price);
    let count = parseInt(body.count);

    if (body.title.length < 1 || price < 0 || body.description.length < 1 || count < 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid product data' }),
      };
    }



    const productId = randomUUID();

    const product = {
      id: productId,
      title: body.title,
      description: body.description,
      price: price,
    };

    const stock = {
      product_id: productId,
      count: count,
    };

    // Transaction based creation of product (in case stock creation is failed 
    //then related to this stock product is not created and not ready to be used by the end user and vice versa)
    await dynamodb.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: 'products',
            Item: product,
          },
        },
        {
          Put: {
            TableName: 'stocks',
            Item: stock,
          },
        },
      ],
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Product created successfully' }),
    };
  } catch (error) {
    console.log('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
