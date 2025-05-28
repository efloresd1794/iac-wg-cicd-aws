#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IPCicdGitlabStack } from '../lib/ip-wg-cicd-stack';
import { Tags } from 'aws-cdk-lib';

const app = new cdk.App();

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT || '000000000000', 
  region: process.env.CDK_DEFAULT_REGION || 'us-east-10' 
};

const mlops_client = 'mlops-cicd-source';

const commonTags = {
  Environment: 'dev || QA || prod',
  Project: 'CLIENT1',
  Owner: 'MLE',
  CostCenter: 'IT',
  Application: 'APP2'
};

const cicdgitlabfchavez = new IPCicdGitlabStack(app, 'IPCicdGitlabStack', {
  clientName: mlops_client,
  gitlabBranch: 'main',
  env,
  commonTags,
});

[cicdgitlabfchavez].forEach(stack => {
  Object.entries(commonTags).forEach(([key, value]) => {
    Tags.of(stack).add(key, value);
  });
});

app.synth();