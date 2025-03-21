import { defineFunction } from '@aws-amplify/backend';

export const BusinessAnalyzer = defineFunction({
    name: 'BusinessAnalyzer',
    entry: './handler.ts',
    timeoutSeconds: 300,
    memoryMB: 512,
});