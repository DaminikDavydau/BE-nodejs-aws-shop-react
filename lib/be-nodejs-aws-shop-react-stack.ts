import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BeNodejsAwsShopReactStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BeNodejsAwsShopReactQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });


    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/getProductsList'), 
    });

    const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/getProductsById'), 
    });

    
    // Create the API Gateway and wire it to the Lambda functions
    const api = new apigateway.RestApi(this, 'ProductServiceAPI');
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

    const productResource = productsResource.addResource('{productId}');
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
    
  
  }
}
