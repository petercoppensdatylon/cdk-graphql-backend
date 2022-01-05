#!/usr/bin/env node
import 'source-map-support/register';
import { AppsyncCdkAppStack } from '../lib/appsync-cdk-app-stack';
import { App, Construct, Stage, Stack, StackProps, StageProps, SecretValue, CfnParameter, CfnOutput } from '@aws-cdk/core';
import { CdkPipeline, ShellScriptAction, SimpleSynthAction } from '@aws-cdk/pipelines';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';

/**
 * Your AppSync application
 *
 * May consist of one or more Stacks
 *
 */
class AppSyncApplication extends Stage {

    public readonly apiKey: CfnOutput;
    public readonly apiURL: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        // create the application stack here
        const appSyncStack = new AppsyncCdkAppStack(this, 'AppsyncCdkAppStack');

        /*
        // Stack Outputs
        this.apiKey = new CfnOutput(appSyncStack, 'ApiKeySecret', {
            value: appSyncStack.api.apiKey || ''
        });
        this.apiURL = new CfnOutput(appSyncStack, 'GraphQLApiUrl', {
            value: appSyncStack.api.graphqlUrl
        });
        */
    }
}

/**
 * Stack to hold the pipeline
 */
class PipelineStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();
        const githubOrg = new CfnParameter(this, "GitHubOrg", {
            type: "String",
            description: "The name of the GitHub org which the pipeline will use as Source."
        });
        const alpha = new AppSyncApplication(this, 'DeployAlpha');
        const prod = new AppSyncApplication(this, 'DeployProd');
        const pipeline = new CdkPipeline(this, 'Pipeline', {
            cloudAssemblyArtifact,

            // This is where the source code is grabbed from, GitHub for example.
            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: 'GitHub',
                output: sourceArtifact,
                oauthToken: SecretValue.secretsManager('GITHUB_TOKEN'),
                owner: githubOrg.valueAsString,
                repo: 'cdk-graphql-backend',
                branch: 'main'
            }),

            // This the where we synthesize the stacks and build our lambdas
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,

                // Use this if you need a build step (if you're not using ts-node
                // or if you have TypeScript Lambdas that need to be compiled).
                buildCommand: 'npm run build',
            })
        });

        // Add a static code analysis stage
        const unitTestAction = new ShellScriptAction({
            actionName: 'UnitTests',
            additionalArtifacts: [sourceArtifact],
            commands: [
                // Install dependencies
                'npm ci',
                // Run the Unit tests
                'npm test -- --group=unit'
            ]
        });
        pipeline.addStage('UnitTests').addActions(unitTestAction);

        // Do this as many times as necessary with any account and region
        // Account and region may different from the pipeline's.
        pipeline.addApplicationStage(alpha);

        // Alpha Testing stage
        const e2eTestAction = new ShellScriptAction({
            actionName: 'AlphaE2ETesting',
            additionalArtifacts: [sourceArtifact],
            useOutputs: {
                API_URL: pipeline.stackOutput(alpha.apiURL),
                API_KEY: pipeline.stackOutput(alpha.apiKey)
            },
            commands: [
                // Install dependencies
                'npm ci',
                // Run the Integ tests
                'npm test -- --group=e2e',
            ]
        });
        pipeline.addStage('E2ETests').addActions(e2eTestAction);

        // Deploy to prod
        pipeline.addApplicationStage(prod);

        //  PipelineName as output
        new CfnOutput(this, 'PipelineName', {
            description: 'Name of the AppSync Pipeline',
            value: pipeline.codePipeline.pipelineName
        });
    }
}

const app = new App();
new PipelineStack(app, 'PipelineStack');
