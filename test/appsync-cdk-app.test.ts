/**
 * Tests AppSyncCdkApp
 * 
 * @group unit
 */
import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import * as AppSyncCdkApp from '../lib/appsync-cdk-app-stack';
import * as tools from 'graphql-schema-utilities';
import * as graphql from 'graphql';

test('Snapshot test - AppsyncCdkApp', () => {
  const stack = new Stack();
  // WHEN
  new AppSyncCdkApp.AppsyncCdkAppStack(stack, 'MyTestConstruct');
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

describe('GraphQL Validator', () => {
  describe('#mergeGQLSchemas', () => {
    describe('when loading a schema glob', () => {
      const glob = './graphql/**/*.graphql';
      let schema: graphql.GraphQLSchema;
      beforeAll((done) => {
        tools.mergeGQLSchemas(glob).then((s) => {
          schema = s;
          done();
        });
      });

      it('expect schema to be a graphql schema', (done) => {
        expect(schema).toBeDefined();
        expect(schema).toBeInstanceOf(graphql.GraphQLSchema);
        done();
      });
    });
  });
});