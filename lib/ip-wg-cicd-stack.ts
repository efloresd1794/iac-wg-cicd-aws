import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';

interface IPCicdGitlabStackProps extends cdk.StackProps {
  clientName: string;
  gitlabBranch: string;
  env: {
    account: string;
    region: string;
  };
  commonTags: {
    Environment: string;
    Project: string;
    Owner: string;
    CostCenter: string;
    Application: string;
  };
}

export class IPCicdGitlabStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: IPCicdGitlabStackProps) {
    super(scope, id, props);
    
    const sourcemlopsBucket = new s3.Bucket(this, 'SourceMLOpsBucket', {
      bucketName: props.clientName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    const gitlabTokenParam = ssm.StringParameter.fromStringParameterName(
        this,
        'GitLabTokenMLOpsParam',
        '/mlops/gitlab-token'
    );

    const lambdaRole = new iam.Role(this, 'GitLabMLOpsSyncRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:PutObject',
        's3:GetObjectVersion',
        's3:GetObject',
        's3:ListBucket',
        'ssm:GetParameter',
      ],
      resources: [
        sourcemlopsBucket.bucketArn,
        `${sourcemlopsBucket.bucketArn}/*`,
        gitlabTokenParam.parameterArn,
      ],
    }));

    const codeBuildServiceRole = new iam.Role(this, 'CodeBuildServiceRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeBuildAdminAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCloudFormationFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess')
      ]
    });

    codeBuildServiceRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
        'ssm:PutParameter',
        'sts:AssumeRole'
      ],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter/cdk-bootstrap/*`,
        `arn:aws:iam::${this.account}:role/cdk-*`
      ]
    }));

    codeBuildServiceRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: [
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/codebuild/*`,
        `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/codebuild/*:*`
      ]
    }));

    codeBuildServiceRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject',
        's3:GetObjectVersion',
        's3:PutObject',
        's3:ListBucket'
      ],
      resources: [
        sourcemlopsBucket.bucketArn,
        `${sourcemlopsBucket.bucketArn}/*`
      ]
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'codebuild:CreateProject',
        'codebuild:BatchGetProjects',
        'codebuild:StartBuild',
        'codebuild:UpdateProject'
      ],
      resources: ['*']  // You might want to restrict this
    }));

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [codeBuildServiceRole.roleArn],
      conditions: {
        'StringEquals': {
          'iam:PassedToService': 'codebuild.amazonaws.com'
        }
      }
    }));

    const gitlabSyncFunction = new lambda.Function(this, 'GitLabSyncMLOpsFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      role: lambdaRole,
      timeout: Duration.minutes(5),
      environment: {
        SOURCE_BUCKET: sourcemlopsBucket.bucketName,
        CODEBUILD_SERVICE_ROLE: codeBuildServiceRole.roleArn,
        ENV_ACCOUNT_ID: props.env.account,
        ENV_REGION: props.env.region,
        TAG_ENVIRONMENT: props.commonTags.Environment,
        TAG_PROJECT: props.commonTags.Project,
        TAG_OWNER: props.commonTags.Owner,
        TAG_COST_CENTER: props.commonTags.CostCenter,
        TAG_APPLICATION: props.commonTags.Application,
      },
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(this, 'PandasLayer', 
          `arn:aws:lambda:${this.region}:336392948345:layer:AWSSDKPandas-Python39:27`
        )
      ]
    });

    const apiGatewayLoggingRole = new iam.Role(this, 'ApiGatewayLoggingMLOpsRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
      ]
    });

    const logGroup = new logs.LogGroup(this, 'ApiGatewayMLOpsLogs', {
      retention: logs.RetentionDays.ONE_WEEK
    });

    const api = new apigateway.RestApi(this, 'GitLabWebhookMLOpsApi', {
      restApiName: 'GitLab Webhook API',
      deploy: true,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.clf()
      },
      cloudWatchRole: true, // Enable CloudWatch role
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const webhook = api.root.addResource('webhook');
    webhook.addMethod('POST', new apigateway.LambdaIntegration(gitlabSyncFunction, {
      proxy: true,
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'"
        }
      }],
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true
        }
      }]
    });

    new cdk.CfnOutput(this, 'WebhookUrlMLOps', {
      value: `${api.url}webhook`,
      description: 'URL for GitLab webhook',
    });

    new cdk.CfnOutput(this, 'SourceMLOpsBucketName', {
      value: sourcemlopsBucket.bucketName,
    });
  }
}
