import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const config: CodegenConfig = {
  schema: {
    [`${STRAPI_URL}/graphql`]: {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    },
  },
  documents: ['src/**/*.graphql'],
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
        enumsAsTypes: true,
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
