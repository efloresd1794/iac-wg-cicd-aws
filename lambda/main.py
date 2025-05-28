import os
import boto3
import requests
import json

def handler(event, context):
    ssm = boto3.client('ssm')
    gitlab_token = ssm.get_parameter(
        Name='/mlops/gitlab-token',
        WithDecryption=True
    )['Parameter']['Value']
    
    body = json.loads(event['body'])
    gitlab_project_id = body['project']['id']
    branch = body['project']['default_branch']

    codebuild_project_name = f"ip-demo"
    
    api_url = f'https://gitlab.com/api/v4/projects/{gitlab_project_id}/repository/archive.zip?sha={branch}'
    
    headers = {'PRIVATE-TOKEN': gitlab_token}
    response = requests.get(api_url, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f'Failed to download repository: {response.status_code}')
    
    s3 = boto3.client('s3')
    bucket = os.environ['SOURCE_BUCKET']
    key = f'ip-demo/v1/source.zip'
    
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=response.content
    )
    
    codebuild = boto3.client('codebuild')
    
    projects = codebuild.batch_get_projects(names=[codebuild_project_name])
    if not projects['projects']:
        create_codebuild_project(
            codebuild,
            codebuild_project_name,
            bucket,
            key
        )
    
    build_response = codebuild.start_build(
        projectName=codebuild_project_name,
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'bucket': bucket,
            'key': key,
            'buildId': build_response['build']['id'],
            'projectName': codebuild_project_name
        })
    }
def create_codebuild_project(codebuild, project_name, bucket, key):

    tags = {
        'Environment': os.environ.get('TAG_ENVIRONMENT', 'dev'),
        'Project': os.environ.get('TAG_PROJECT', 'GenericProject'),
        'Owner': os.environ.get('TAG_OWNER', 'eflores'),
        'CostCenter': os.environ.get('TAG_COST_CENTER', 'TI-ML'),
        'Application': os.environ.get('TAG_APPLICATION', 'default_app'),
    }

    project = codebuild.create_project(
        name=project_name,
        source={
            'type': 'S3',
            'location': f'{bucket}/{key}',
            'buildspec': '''version: 0.2
phases:
  # run commands here
'''
        },
        artifacts={
            'type': 'NO_ARTIFACTS'
        },
        environment={
            'type': 'LINUX_CONTAINER',
            'image': 'aws/codebuild/standard:7.0',
            'computeType': 'BUILD_GENERAL1_SMALL',
            'environmentVariables': [
                {
                    'name': 'AWS_ACCOUNT_ID',
                    'value': os.environ['ENV_ACCOUNT_ID'],
                    'type': 'PLAINTEXT'
                },
                {
                    'name': 'AWS_DEFAULT_REGION',
                    'value': os.environ['ENV_REGION'],
                    'type': 'PLAINTEXT'
                }
            ]
        },
        serviceRole=os.environ['CODEBUILD_SERVICE_ROLE'],
        tags=[
            {
                'key': key,
                'value': value
            }
            for key, value in tags.items()
        ]
    )
    return project

