import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'rs-aws-course-importbucket', {
      bucketName: "rs-aws-course-importbucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFileLambda',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/importProductsFile'), 
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      }
    );

    bucket.grantReadWrite(importProductsFileLambda);

    const api = new apigateway.RestApi(this, 'ImportApi');

    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));


    const importFileParserLambda = new lambda.Function(this, 'ImportFileParserLambda',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/importFileParser'), 
      }
    );

    bucket.grantReadWrite(importFileParserLambda);

    const rule = new events.Rule(this, 'ImportFileParserRule', {
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['ObjectCreated'],
        resources: [bucket.bucketArn],
        detail: {
          'eventName': ['ObjectCreated:Put'],
          's3': {
            'object': { 'key': { 'endsWith': ['uploaded'] } },
          },
        },
      },
    });

    rule.addTarget(new targets.LambdaFunction(importFileParserLambda));

  }
}
