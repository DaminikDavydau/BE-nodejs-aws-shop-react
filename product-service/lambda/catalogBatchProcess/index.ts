import { SQSHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler: SQSHandler = async (event) => {
  try {
    const products = event.Records.map((record) => JSON.parse(record.body));
    
    for (const product of products) {
      // Create the product in the DynamoDB table
      await dynamoDB.put({
        TableName: 'products',
        Item: product,
      }).promise();
      
      console.log(`Created product: ${JSON.stringify(product)}`);
    }
    
    console.log('All products created successfully');

    const sns = new AWS.SNS();
    const snsTopicArn = 'arn:aws:sns:eu-west-1:960150701114:BeNodejsAwsShopReactStack-CreateProductTopicE4CD9217-QQKVEHsonpJl';

    await sns.publish({
      Message: JSON.stringify({ products }),
      TopicArn: snsTopicArn,
    }).promise();

    console.log('Published event to SNS topic');

  } catch (error) {
    console.error('Error processing catalog batch:', error);
    throw error;
  }
};
