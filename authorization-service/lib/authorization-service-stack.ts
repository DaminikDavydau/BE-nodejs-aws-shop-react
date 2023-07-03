import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the basicAuthorizer Lambda function
    const basicAuthorizerLambda = new lambda.Function(this, 'BasicAuthorizerLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        GitPassword: getEnvValue("daminikdavydau")!,
      },
    });

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'ImportServiceApi');

    // Add resources and methods to the API Gateway as needed
    // ...

    // Add the basicAuthorizer as the Lambda authorizer for the /import path
    const importResource = api.root.addResource('import');
    const importMethod = importResource.addMethod('GET', new apigateway.LambdaIntegration(basicAuthorizerLambda), {
      authorizer: {
        authorizerId: "b0qh7n",
      }
    });

    // Add any necessary permissions for the Lambda function
    // ...

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}

const envFilePath = path.resolve(__dirname, "../.env");
const readEnvVars = () => fs.readFileSync(envFilePath, "utf-8").split(os.EOL);
const getEnvValue = (key: string) => {
  // find the line that contains the key (exact match)
  const matchedLine = readEnvVars().find((line: string) => line.split("=")[0] === key);
  // split the line (delimiter is '=') and return the item at index 2
  return matchedLine !== undefined ? matchedLine.split("=")[1] : null;
};