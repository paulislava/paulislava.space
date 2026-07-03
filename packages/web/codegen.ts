import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL ?? 'https://cms.paulislava.space';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const config: CodegenConfig = {
  schema: {
    [`${STRAPI_URL}/graphql`]: {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    },
  },
  documents: ['src/**/*.graphql'],
  generates: {
    './src/gql/graphql.ts': {
      plugins: [
        { add: { content: '// @ts-nocheck' } },
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ],

      config: {
        enumsAsTypes: true,
        dedupeFragments: true,
        scalars: {
          JSON: 'Record<string, unknown>',
          DateTime: 'string',
          Upload: 'File',
          Long: 'number',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
