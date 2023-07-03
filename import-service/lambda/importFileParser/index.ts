import * as AWS from 'aws-sdk';
import { S3Handler } from 'aws-lambda';

const sqs = new AWS.SQS();

export const importFileParser: S3Handler = async (event) => {
  try {
    const s3Records = event.Records;
    const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/960150701114/BeNodejsAwsShopReactStack-CatalogItemsQueueB3B6CE23-HRwgCvMRNnWG';

    for (const record of s3Records) {
      const s3ObjectKey = record.s3.object.key;
      const params = {
        MessageBody: JSON.stringify({ s3ObjectKey }),
        QueueUrl: queueUrl,
      };

      await sqs.sendMessage(params).promise();

      console.log(`Sent message to SQS for object: ${s3ObjectKey}`);
    }

    console.log('All records sent to SQS successfully');
  } catch (error) {
    console.error('Error processing import file:', error);
    throw error;
  }
};
