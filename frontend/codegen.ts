import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/schema.gql',
  documents: ['src/shared/api/graphql/operations/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'src/shared/api/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: 'string',
        useTypeImports: true,
        skipTypename: true,
      },
    },
  },
};

export default config;
