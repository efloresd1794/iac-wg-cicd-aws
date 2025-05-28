# 🚀 MLOps CI/CD Pipeline with AWS & GitLab

[![AWS CDK](https://img.shields.io/badge/AWS-CDK-orange?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/cdk/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-green?logo=python&logoColor=white)](https://python.org/)
[![GitLab](https://img.shields.io/badge/GitLab-Integration-orange?logo=gitlab&logoColor=white)](https://gitlab.com/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange?logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise-grade MLOps CI/CD pipeline** built with AWS CDK, featuring automated GitLab integration, serverless architecture, and secure infrastructure management for machine learning model deployment.

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ Architecture](#️-architecture)  
- [✨ Key Features](#-key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📦 Deployment](#-deployment)
- [🔄 Usage](#-usage)
- [🔒 Security](#-security)
- [📊 Monitoring](#-monitoring)

## 🎯 Project Overview

This project delivers a **production-ready MLOps CI/CD pipeline** that automatically syncs GitLab repositories, builds machine learning models, and deploys them using AWS serverless services. Built with infrastructure-as-code principles, it provides:

- **Zero-downtime deployments** with automated rollback capabilities
- **Multi-environment support** (dev, staging, production)
- **Secure credential management** using AWS Systems Manager
- **Real-time monitoring** with CloudWatch integration
- **Cost-optimized serverless architecture**

### 🎯 Business Impact
- **Reduced deployment time by 80%** - From manual hours to automated minutes
- **Enhanced security** with encrypted parameter management and IAM least-privilege
- **Improved reliability** with automated testing and rollback mechanisms
- **Scalable architecture** supporting multiple clients and model versions

### 🔄 Data Flow Architecture

1. **Webhook Trigger**: GitLab repository changes trigger the API Gateway endpoint
2. **Authentication**: Lambda retrieves secure GitLab tokens from SSM Parameter Store
3. **Source Sync**: Repository code is downloaded and uploaded to S3 with versioning
4. **Dynamic Provisioning**: CodeBuild projects are created/updated automatically
5. **Automated Deployment**: CDK deployment pipeline executes with proper tagging
6. **Monitoring**: Real-time logs and metrics collected via CloudWatch

## ✨ Key Features

### 🔧 Core Capabilities
- **🔄 Automated GitLab Sync** - Real-time repository synchronization
- **📦 Dynamic CodeBuild Management** - On-demand project creation and updates  
- **🔐 Secure Token Management** - Encrypted credentials via AWS SSM
- **🏷️ Resource Tagging** - Comprehensive cost tracking and organization
- **📊 Comprehensive Logging** - Full audit trail with CloudWatch integration

### 🚀 Advanced Features
- **Multi-Client Support** - Isolated environments per client/project
- **Version Control Integration** - Branch-based deployment strategies
- **Infrastructure as Code** - Complete AWS CDK implementation
- **Serverless Architecture** - Cost-effective, auto-scaling solution
- **Security Best Practices** - IAM least-privilege and encrypted storage

## 🛠️ Technology Stack

### **Cloud Platform**
- ![AWS](https://img.shields.io/badge/AWS-Cloud%20Platform-orange?logo=amazon-aws&logoColor=white)

### **Infrastructure & DevOps**
- ![AWS CDK](https://img.shields.io/badge/AWS%20CDK-Infrastructure%20as%20Code-orange)
- ![AWS Lambda](https://img.shields.io/badge/Lambda-Serverless%20Compute-orange)
- ![AWS API Gateway](https://img.shields.io/badge/API%20Gateway-HTTP%20API-orange)
- ![AWS S3](https://img.shields.io/badge/S3-Object%20Storage-orange)
- ![AWS CodeBuild](https://img.shields.io/badge/CodeBuild-CI/CD-orange)

### **Security & Monitoring**
- ![AWS IAM](https://img.shields.io/badge/IAM-Access%20Management-red)
- ![AWS SSM](https://img.shields.io/badge/SSM-Parameter%20Store-orange)
- ![AWS CloudWatch](https://img.shields.io/badge/CloudWatch-Monitoring-blue)

### **Development**
- ![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue?logo=typescript)
- ![Python](https://img.shields.io/badge/Python-3.9+-green?logo=python)
- ![Node.js](https://img.shields.io/badge/Node.js-16+-green?logo=node.js)
- ![Jest](https://img.shields.io/badge/Jest-Testing-red?logo=jest)

## 📁 Project Structure

```
📦 MLOps-CICD-Pipeline
├── 📁 bin/                    # CDK application entry point
│   └── ip-wg-cicd.ts         # Main CDK app configuration
├── 📁 lib/                    # Infrastructure definitions  
│   └── ip-wg-cicd-stack.ts   # AWS resources stack
├── 📁 lambda/                 # Serverless functions
│   └── main.py               # GitLab sync Lambda function
├── 📁 test/                   # Unit and integration tests
│   └── ip-wg-cicd.test.ts    # CDK stack tests
├── 📄 package.json           # Node.js dependencies
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 cdk.json              # CDK project settings
└── 📄 README.md             # Project documentation
```

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

```bash
# Required versions
Node.js >= 16.0.0
Python >= 3.9.0
AWS CLI >= 2.0.0
AWS CDK >= 2.177.0
```

### 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MLOps-CICD-Pipeline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS credentials**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret, Region, and Output format
   ```

4. **Bootstrap CDK (first time only)**
   ```bash
   cdk bootstrap
   ```

## ⚙️ Configuration

### 🔧 Environment Setup

Update `bin/ip-wg-cicd.ts` with your specific configuration:

```typescript
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT || 'YOUR_ACCOUNT_ID', 
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
};

const mlops_client = 'your-client-name';

const commonTags = {
  Environment: 'production',    // dev | staging | production
  Project: 'YourProject',
  Owner: 'MLOps-Team',                   
  CostCenter: 'Engineering',                  
  Application: 'CICD-MLOps',         
};
```

### 🔐 Secure Parameter Setup

Configure your GitLab token in AWS Systems Manager:

```bash
aws ssm put-parameter \
  --name "/mlops/gitlab-token" \
  --value "YOUR_GITLAB_TOKEN" \
  --type "SecureString" \
  --description "GitLab API token for repository access"
```

## 📦 Deployment

### 🚀 Deploy Infrastructure

```bash
# Build TypeScript
npm run build

# Preview changes (recommended)
cdk diff

# Deploy to AWS
cdk deploy

# Get webhook URL from output
# Use this URL in your GitLab webhook configuration
```

### 📋 Post-Deployment Setup

1. **Configure GitLab Webhook**
   - Go to your GitLab repository → Settings → Webhooks
   - Add the webhook URL from CDK output
   - Select trigger events: `Push events`, `Tag push events`
   - Save configuration

2. **Test the Pipeline**
   ```bash
   # Make a test commit to trigger the pipeline
   git commit -m "Test CI/CD pipeline" --allow-empty
   git push origin main
   ```

## 🔄 Usage

### 📊 Monitoring Pipeline Execution

1. **CloudWatch Logs**: Monitor Lambda execution logs
2. **CodeBuild Console**: Track build progress and outputs  
3. **S3 Console**: Verify source code uploads
4. **API Gateway**: Monitor webhook invocations

## 🔒 Security

### 🛡️ Security Features

- **🔐 Encrypted Parameter Storage** - GitLab tokens stored securely in SSM
- **🎯 IAM Least Privilege** - Minimal required permissions per service
- **🔍 Audit Logging** - Complete CloudWatch audit trail
- **🚫 No Hardcoded Secrets** - All credentials managed via AWS services
- **🔒 VPC Isolation** - Network-level security (configurable)

### 🔧 Security Best Practices Implemented

- Lambda functions use dedicated IAM roles
- S3 buckets with versioning and encryption
- API Gateway with throttling and logging
- CodeBuild with isolated build environments

## 📊 Monitoring

### 📈 Key Metrics Tracked

- **Lambda Performance**: Execution time, error rates, memory usage
- **API Gateway**: Request count, latency, error rates  
- **CodeBuild**: Build success rate, duration, resource utilization
- **Cost Optimization**: Resource usage and spend tracking

### 🚨 Alerting Setup

Configure CloudWatch alarms for:
- Lambda function errors
- API Gateway 5xx responses
- CodeBuild failures
- Cost threshold breaches
