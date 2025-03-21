import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { BusinessAnalyzer } from './functions/BusinessAnalyzer/resource';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { REGION, FLOW_ID, FLOW_ALIAS_ID } from './functions/BusinessAnalyzer/handler';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  BusinessAnalyzer,
});

// IAM permissions for BusinessAnalyzer function
const bedrockFlowResources = [
  `arn:aws:bedrock:${REGION}:*:flow/${FLOW_ID}/alias/${FLOW_ALIAS_ID}`,
  `arn:aws:bedrock:${REGION}:*:flow/${FLOW_ID}`,
];

const bedrockFlowActions = [
  "bedrock:InvokeFlow",
  "bedrock-agent-runtime:InvokeFlow",
  "bedrock-agent-runtime:InvokeAgentFlow",
  "bedrock-agent-runtime:InvokeAgentFlowAlias",
];

backend.BusinessAnalyzer.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: bedrockFlowActions,
    resources: bedrockFlowResources,
  })
);

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: bedrockFlowActions,
    resources: bedrockFlowResources,
  })
);