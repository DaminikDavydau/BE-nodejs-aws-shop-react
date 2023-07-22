import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const authorizationToken = event.headers.Authorization;
  
    if (!authorizationToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authorization header is missing' }),
      };
    }
  
    const encodedCredentials = authorizationToken.replace('Basic ', '');
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  
    const [username, password] = decodedCredentials.split(':');
    const storedPassword = process.env.GitPassword;
  
    if (username !== 'daminikdavydau' || password !== storedPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Access denied' }),
      };
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Access granted' }),
    };
  };
  