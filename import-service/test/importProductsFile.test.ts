import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as importProductsFile } from '../lambda/importProductsFile';
import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';

describe('importProductsFile', () => {
  beforeAll(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore('S3');
  });

  it('should return a signed URL when name parameter is provided', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {
        name: 'example.csv',
      },
    } as any;

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ signedUrl: 'uploaded/example.csv' }));
  });



  it('should return a 400 error when name parameter is missing', async () => {
    const event: APIGatewayProxyEvent = {} as any;

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(JSON.stringify({ error: 'Missing name parameter' }));
  });
});
