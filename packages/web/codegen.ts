import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const sharedConfig = {
  enumsAsTypes: true,
  dedupeFragments: true,
  scalars: {
    JSON: 'Record<string, unknown>',
    DateTime: 'string',
    Upload: 'File',
    Long: 'number',
  },
};

const config: CodegenConfig = {
  schema: {
    [`${STRAPI_URL}/graphql`]: {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    },
  },
  documents: ['src/**/*.graphql'],
  generates: {
    './src/gql/types.ts': {
      plugins: ['typescript'],
      config: sharedConfig,
    },
    './src/gql/operations.ts': {
      plugins: ['typescript-operations'],
      config: {
        ...sharedConfig,
        onlyOperationTypes: true,
        importDocumentNodeExternallyFrom: './types',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
