import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();


const scan = async (table: any) => {
  const scanReults = await dynamodb.scan({
    TableName: table!,
  }).promise();
  return scanReults.Items
}


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    console.log('Incoming request:', event);
    
    const products = await scan(process.env.PRODUCTS_TABLE_NAME)
    const stocks = await scan(process.env.STOCKS_TABLE_NAME);

    const mergedList = products!.map((product) => {
      const matchingStock = stocks!.find((stock) => stock.product_id === product.id);
      if (matchingStock) {
        return {
          ...product,
          count: matchingStock.count,
        };
      } else {
        return {
          ...product,
          count: null,
        }
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify(mergedList),
    };
  } catch (error) {
    console.log('Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
