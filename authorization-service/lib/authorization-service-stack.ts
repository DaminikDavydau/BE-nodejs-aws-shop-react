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

    const basicAuthorizerLambda = new lambda.Function(this, 'BasicAuthorizerLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        GitPassword: getEnvValue("daminikdavydau")!,
      },
    });

    const api = new apigateway.RestApi(this, 'ImportServiceApi');

    const importResource = api.root.addResource('import');
    const importMethod = importResource.addMethod('GET', new apigateway.LambdaIntegration(basicAuthorizerLambda), {
      authorizer: {
        authorizerId: "b0qh7n",
      }
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}

const envFilePath = path.resolve(__dirname, "../.env");
const readEnvVars = () => fs.readFileSync(envFilePath, "utf-8").split(os.EOL);
const getEnvValue = (key: string) => {
  const matchedLine = readEnvVars().find((line: string) => line.split("=")[0] === key);
  return matchedLine !== undefined ? matchedLine.split("=")[1] : null;
};