# GitLab-based CI/CD Pipeline for MLOps

This project implements a GitLab-based Continuous Integration and Continuous Deployment (CI/CD) pipeline for Machine Learning Operations (MLOps). It automates the process of syncing GitLab repositories, building, and deploying machine learning models using AWS services.

## Project Description

The ip-wg-cicd project sets up an infrastructure for automating the deployment of machine learning models from GitLab repositories. It leverages AWS services such as Lambda, API Gateway, S3, and CodeBuild to create a seamless CI/CD pipeline.

Key features of this project include:

- Automatic synchronization of GitLab repositories with AWS S3
- Webhook-based triggering of the CI/CD pipeline
- Dynamic creation and management of CodeBuild projects
- Secure handling of GitLab tokens using AWS Systems Manager Parameter Store
- Customizable deployment process using AWS CDK

This infrastructure allows data scientists and ML engineers to focus on model development while ensuring consistent and automated deployments. The pipeline is designed to be flexible, supporting different clients, products, and model versions.

## Repository Structure

```
.
├── bin
│   └── ip-wg-cicd.ts
├── lib
│   └── ip-wg-cicd-stack.ts
├── lambda
│   └── main.py
├── test
│   └── ip-wg-cicd.test.ts
├── cdk.json
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Usage Instructions

### Installation

Prerequisites:
- Node.js (v16 or later)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI (v2.177.0 or compatible)

To install the project dependencies:

```bash
npm install
```

### Getting Started

1. Configure the `bin/ip-wg-cicd.ts` file with your desired settings:

```typescript
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT || '000000000000', 
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
};

const mlops_client = 'your-client-name';

const commonTags = {
  Environment: 'Dev',
  Project: 'YourProject',
  Owner: 'MLOps',                   
  CostCenter: 'IT',                  
  Application: 'CICDMLOPS',         
};
```

2. Deploy the stack:

```bash
npm run build
cdk deploy
```

3. After deployment, note the WebhookUrl output. This URL should be configured in your GitLab repository's webhook settings.

### Configuration

The main configuration is done in the `bin/ip-wg-cicd.ts` file. You can customize:

- AWS account and region
- Client name
- Common tags for resources

Additional configuration options are available in the `lib/ip-wg-cicd-stack.ts` file, where you can modify the stack's resources and their properties.

### Integration

To integrate this CI/CD pipeline with your GitLab repository:

1. Go to your GitLab repository settings
2. Navigate to Webhooks
3. Add a new webhook with the URL provided in the CDK stack output
4. Select the events that should trigger the webhook (e.g., Push events)
5. Save the webhook

Now, when you push changes to your GitLab repository, it will trigger the CI/CD pipeline automatically.

### Testing

To run the tests:

```bash
npm test
```

Note: The test file (`test/ip-wg-cicd.test.ts`) currently contains a placeholder test. You should implement proper tests based on your specific requirements.

### Troubleshooting

1. Issue: Deployment fails due to missing permissions
   - Ensure your AWS CLI is configured with the correct credentials
   - Check if your IAM user or role has the necessary permissions for creating the resources

2. Issue: Lambda function fails to execute
   - Check the CloudWatch logs for the Lambda function
   - Ensure the GitLab token is correctly stored in the AWS Systems Manager Parameter Store

3. Issue: CodeBuild project fails to start
   - Verify that the CodeBuild service role has the necessary permissions
   - Check if the S3 bucket with the source code exists and is accessible

For verbose logging, you can enable debug mode in the CDK CLI:

```bash
cdk deploy --debug
```

## Data Flow

The CI/CD pipeline processes requests through the following steps:

1. GitLab webhook triggers the API Gateway endpoint
2. API Gateway invokes the Lambda function
3. Lambda function:
   - Retrieves the GitLab token from SSM Parameter Store
   - Downloads the repository code from GitLab
   - Uploads the code to an S3 bucket
   - Creates or updates a CodeBuild project
   - Starts a new CodeBuild build
4. CodeBuild:
   - Retrieves the source code from S3
   - Installs dependencies
   - Builds and deploys the project using CDK

```
GitLab Repo --> API Gateway --> Lambda --> S3 --> CodeBuild --> Deployment
     ^                                             |
     |                                             |
     +---------------------------------------------+
                 (Feedback loop)
```

## Infrastructure

The infrastructure for this project is defined using AWS CDK. Key resources include:

- Lambda:
  - GitLabSyncMLOpsFunction: Handles webhook events and initiates the CI/CD process

- S3:
  - SourceMLOpsBucket: Stores the downloaded GitLab repository code

- API Gateway:
  - GitLabWebhookMLOpsApi: Provides the webhook endpoint for GitLab

- IAM:
  - GitLabMLOpsSyncRole: Role for the Lambda function
  - CodeBuildServiceRole: Role for CodeBuild projects
  - ApiGatewayLoggingMLOpsRole: Role for API Gateway logging

- CloudWatch:
  - ApiGatewayMLOpsLogs: Log group for API Gateway

- CodeBuild:
  - Dynamic CodeBuild projects created for each client/product/model version

These resources work together to create a scalable and secure CI/CD pipeline for MLOps projects.