import { defineFunction } from '@aws-amplify/backend';

export const BusinessAnalyzer = defineFunction({
    name: 'BusinessAnalyzer',
    entry: './handler.ts',
    timeoutSeconds: 500,
    environment: {
        REGION: 'us-east-1',
        FLOW_ID: '<FLOW_ID>',
        FLOW_ALIAS_ID: '<FLOW_ALIAS_ID>',
    },
});