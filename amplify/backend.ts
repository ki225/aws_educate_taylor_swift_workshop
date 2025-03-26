import { defineBackend } from '@aws-amplify/backend';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { FLOW_ALIAS_ID, FLOW_ID, REGION } from './functions/BusinessAnalyzer/handler';
import { BusinessAnalyzer } from './functions/BusinessAnalyzer/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

const backend = defineBackend({
  auth,
  data,
  BusinessAnalyzer
});


const bedrockFlowResources = [
  `arn:aws:bedrock:${REGION}:*:flow/${FLOW_ID}/alias/${FLOW_ALIAS_ID}`,
  `arn:aws:bedrock:${REGION}:*:flow/${FLOW_ID}`,
];

const bedrockFlowActions = [
  "bedrock:InvokeFlow",
];

backend.BusinessAnalyzer.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: bedrockFlowActions,
    resources: bedrockFlowResources,
  })
);

// IAM permissions for authenticated users (Amplify Gen2)
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: bedrockFlowActions,
    resources: bedrockFlowResources,
  })
);
