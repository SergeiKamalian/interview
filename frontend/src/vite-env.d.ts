/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.graphql?raw' {
  const content: string;
  export default content;
}

declare module '*.graphql' {
  const content: string;
  export default content;
}
