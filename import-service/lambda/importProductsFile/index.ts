import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { Sign } from 'crypto';

const s3 = new S3();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { name } = event.queryStringParameters || {};
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing name parameter' }),
      };
    }

    let signedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: 'rs-aws-course-importbucket',
      Key: `uploaded/${name}`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
