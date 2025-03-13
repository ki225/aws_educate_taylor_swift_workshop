import { defineFunction } from '@aws-amplify/backend';

export const BusinessAnalyzer = defineFunction({
    name: 'BusinessAnalyzer',
    entry: './handler.ts',
    environment: {
        REGION: 'us-east-1',
        FLOW_ID: '0F7YTNFAWH',
        FLOW_ALIAS_ID: 'LJ5ZK9RTKM',
    },
});