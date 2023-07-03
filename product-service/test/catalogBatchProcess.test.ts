import { handler as catalogBatchProcess } from '../lambda/catalogBatchProcess/index';
import { SQSEvent, Context } from 'aws-lambda';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

describe('catalogBatchProcess', () => {
  afterEach(() => {
    AWSMock.restore();
  });

  it('should create products in the DynamoDB table for each SQS message', async () => {
    const event: SQSEvent = {
      Records: [
        {
          messageId: '1',
          receiptHandle: 'receipt-handle-1',
          body: JSON.stringify({ id: '1', name: 'Product 1' }),
          attributes: {
            ApproximateReceiveCount: '', SentTimestamp: '', SenderId: '', ApproximateFirstReceiveTimestamp: ''
          },
          messageAttributes: {},
          md5OfBody: 'md5-of-body-1',
          eventSourceARN: 'event-source-arn-1',
          eventSource: 'aws:sqs',
          awsRegion: 'us-east-1',
        },
        {
          messageId: '2',
          receiptHandle: 'receipt-handle-2',
          body: JSON.stringify({ id: '2', name: 'Product 2' }),
          attributes: {
            ApproximateReceiveCount: '', SentTimestamp: '', SenderId: '', ApproximateFirstReceiveTimestamp: ''
        },
          messageAttributes: {},
          md5OfBody: 'md5-of-body-2',
          eventSourceARN: 'event-source-arn-2',
          eventSource: 'aws:sqs',
          awsRegion: 'us-east-1',
        },
      ],
    };

    
    // Create a mock context object
    const context: Context = {
        callbackWaitsForEmptyEventLoop: false,
        functionName: '',
        functionVersion: '',
        invokedFunctionArn: '',
        memoryLimitInMB: '',
        awsRequestId: '',
        logGroupName: '',
        logStreamName: '',
        getRemainingTimeInMillis: function (): number {
            throw new Error('Function not implemented.');
        },
        done: function (error?: Error | undefined, result?: any): void {
            throw new Error('Function not implemented.');
        },
        fail: function (error: string | Error): void {
            throw new Error('Function not implemented.');
        },
        succeed: function (messageOrObject: any): void {
            throw new Error('Function not implemented.');
        }
    };
  
      // Create a mock callback function
    const callback = jest.fn();

    // Mock DynamoDB document client put() method using AWS SDK mock
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: any, callback: any) => {
      // Assert the expected DynamoDB interaction
      expect(params.TableName).toBe('productsTable');
      expect(params.Item).toBeDefined();

      callback(null, { Item: params.Item });
    });

    // Invoke the Lambda function
    await catalogBatchProcess(event, context, callback);

    // Assert the expected behavior
    // Assert DynamoDB interactions, console logs, etc.
  });
});