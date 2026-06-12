/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Hello {\n  hello\n}": typeof types.HelloDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": typeof types.LoginDocument,
    "mutation Logout {\n  logout {\n    success\n  }\n}": typeof types.LogoutDocument,
    "query Me {\n  me {\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": typeof types.MeDocument,
    "mutation RefreshTokens {\n  refreshTokens {\n    accessToken\n    tokenType\n  }\n}": typeof types.RefreshTokensDocument,
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": typeof types.RegisterDocument,
};
const documents: Documents = {
    "query Hello {\n  hello\n}": types.HelloDocument,
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": types.LoginDocument,
    "mutation Logout {\n  logout {\n    success\n  }\n}": types.LogoutDocument,
    "query Me {\n  me {\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": types.MeDocument,
    "mutation RefreshTokens {\n  refreshTokens {\n    accessToken\n    tokenType\n  }\n}": types.RefreshTokensDocument,
    "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}": types.RegisterDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Hello {\n  hello\n}"): typeof import('./graphql').HelloDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}"): typeof import('./graphql').LoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Logout {\n  logout {\n    success\n  }\n}"): typeof import('./graphql').LogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Me {\n  me {\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}"): typeof import('./graphql').MeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RefreshTokens {\n  refreshTokens {\n    accessToken\n    tokenType\n  }\n}"): typeof import('./graphql').RefreshTokensDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Register($input: RegisterInput!) {\n  register(input: $input) {\n    accessToken\n    tokenType\n    user {\n      id\n      email\n      fullName\n      isActive\n    }\n    company {\n      id\n      name\n      slug\n      isActive\n    }\n  }\n}"): typeof import('./graphql').RegisterDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
