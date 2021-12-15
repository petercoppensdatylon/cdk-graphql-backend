# CDK AppSync GraphQL API
# #######################
This CDK stack deploys a real-time GraphQL API built with AWS AppSync, Amazon DynamoDB, and AWS Lambda. We use CDK to create a CodePipeline that will Continously Deploy our changes to the target environments.

## Getting started

To deploy this project, follow these steps.

0. Fork this project to your GitHub Repo.

1. Clone the project

```sh
git clone https://github.com/askulkarni2/cdk-graphql-backend.git
```

2. Change into the directory and install dependencies

```sh
cd cdk-graphql-backend

npm install
```

3. Create `GITHUB_TOKEN` as a AWS Secrets Manager secret.

```sh
aws secretsmanager create-secret --name GITHUB_TOKEN \
    --description "Github Token" \
    --secret-string "$GITHUB_TOKEN"
```

4. Run the build

```sh
npm run build
```

5. Bootstrap CDK using the `CDK_NEW_BOOTSTRAP` flag.

```sh
env CDK_NEW_BOOTSTRAP=1  cdk bootstrap \
    --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
    aws://212687814973/us-west-2
```

6. Deploy the pipeline Stack

```sh
cdk deploy --parameters GitHubOrg=askulkarni2
```
