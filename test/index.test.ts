import { handler as getProductsListHandler } from '../lambda/getProductsList/index';
import { handler as getProductsByIdHandler } from '../lambda/getProductsById/index';
import { APIGatewayProxyEvent } from 'aws-lambda';

let EmptyEvent: APIGatewayProxyEvent = {
  body: '',
  headers: {},
  httpMethod: '',
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  path: '',
  pathParameters: null,
  queryStringParameters: null,
  requestContext: {
    path: '', requestTimeEpoch: 0,
    accountId: '',
    apiId: '',
    authorizer: {},
    protocol: '',
    httpMethod: '',
    identity: {
      accessKey: '', 
      clientCert: {
        clientCertPem: '', 
        serialNumber: '', 
        subjectDN: '', 
        issuerDN: '', 
        validity: {
          notAfter: '',
          notBefore: '',
        }
      }, 
      principalOrgId: '',
      accountId: '',
      apiKey: '',
      apiKeyId: '',
      caller: '',
      cognitoAuthenticationProvider: '',
      cognitoAuthenticationType: '',
      cognitoIdentityId: '',
      cognitoIdentityPoolId: '',
      sourceIp: '',
      user: '',
      userAgent: '',
      userArn: '',
    },
    requestId: '',
    resourceId: '',
    resourcePath: '',
    stage: '',
  },
  resource: '',
  stageVariables: null,
};

describe('getProductsListHandler', () => {
  test('should return an array of products', async () => {
    
    let event = EmptyEvent;

    const result = await getProductsListHandler(event);

    expect(result.statusCode).toBe(200);
    expect(Array.isArray(JSON.parse(result.body))).toBe(true);
  });
});

describe('getProductsByIdHandler', () => {
  test('should return a product with the specified ID', async () => {
    
    let event = EmptyEvent;
    event.pathParameters = { productId: '1' }

    const result = await getProductsByIdHandler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).id).toBe('1');
  });

  test('should return 404 if the product is not found', async () => {
    
    let event = EmptyEvent;
    event.pathParameters = { productId: '999' }

    const result = await getProductsByIdHandler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Product not found');
  });
});
