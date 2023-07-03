import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sqsevents from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';

import * as path from 'path';
//import { insertTestData } from '../dynamoDB';


export class BeNodejsAwsShopReactStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    const catalogBatchProcessLambda = new lambda.Function(this, 'CatalogBatchProcessLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/catalogBatchProcess'),
      environment: {
        TABLE_NAME: 'products',
      },
    });

    catalogBatchProcessLambda.addEventSource(
      new sqsevents.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    const productsTable = dynamodb.Table.fromTableName(this, 'Products', 'products');
    productsTable.grantReadWriteData(catalogBatchProcessLambda);



    const createProductTopic = new sns.Topic(this, 'CreateProductTopic');
    createProductTopic.addSubscription(new subs.EmailSubscription('dominikdavydov3d@gmail.com'));



    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/getProductsList'),
      environment: {
        PRODUCTS_TABLE_NAME: 'products',
        STOCKS_TABLE_NAME: 'stocks',
      }, 
    });

    const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/getProductsById'), 
      environment: {
        PRODUCTS_TABLE_NAME: 'products',
        STOCKS_TABLE_NAME: 'stocks',
      },
    });

    const postProductLambda = new lambda.Function(this, 'PostProductLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/postProduct'),
      environment: {
        PRODUCTS_TABLE_NAME: 'products',
        STOCKS_TABLE_NAME: 'stocks',
      },
    });



    
    // Create the API Gateway and wire it to the Lambda functions
    const api = new apigateway.RestApi(this, 'ProductServiceAPI');
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(postProductLambda));

    const productResource = productsResource.addResource('{productId}');
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
    
  
    //insertTestData()
  }
}
