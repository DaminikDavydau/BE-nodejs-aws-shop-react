import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Mock data for the products array
    const products = [
      { id: '1', title: 'Milk', description: 'Some text', price: 3, count: 5 },
      { id: '2', title: 'Bread', description: 'Some text', price: 6, count: 4 },
      { id: '3', title: 'Eggs', description: 'Some text', price: 7, count: 3 },
    ];

    const productId = event.pathParameters?.productId;

    const product = products.find((p) => p.id === productId);

    if (!product) {
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify(product),
    };
  } catch (error) {
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
