/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  companyName: string;
  email: string;
  fullName: string;
  password: string;
};

export type HelloQueryVariables = Exact<{ [key: string]: never; }>;


export type HelloQuery = { hello: string };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, tokenType: string, user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: { success: boolean } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

export type RefreshTokensMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokensMutation = { refreshTokens: { accessToken: string, tokenType: string } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { register: { accessToken: string, tokenType: string, user: { id: string, email: string, fullName: string, isActive: boolean }, company: { id: string, name: string, slug: string, isActive: boolean } } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const HelloDocument = new TypedDocumentString(`
    query Hello {
  hello
}
    `) as unknown as TypedDocumentString<HelloQuery, HelloQueryVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    tokenType
    user {
      id
      email
      fullName
      isActive
    }
    company {
      id
      name
      slug
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = new TypedDocumentString(`
    mutation Logout {
  logout {
    success
  }
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    user {
      id
      email
      fullName
      isActive
    }
    company {
      id
      name
      slug
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const RefreshTokensDocument = new TypedDocumentString(`
    mutation RefreshTokens {
  refreshTokens {
    accessToken
    tokenType
  }
}
    `) as unknown as TypedDocumentString<RefreshTokensMutation, RefreshTokensMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    tokenType
    user {
      id
      email
      fullName
      isActive
    }
    company {
      id
      name
      slug
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;