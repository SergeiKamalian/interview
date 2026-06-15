import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type {
  AddCandidateToShortlistMutation,
  AddCandidateToShortlistMutationVariables,
  RemoveCandidateFromShortlistMutation,
  RemoveCandidateFromShortlistMutationVariables,
} from '@shared/api/graphql/generated/graphql';

export const shortlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addToShortlist: builder.mutation<
      AddCandidateToShortlistMutation['addCandidateToShortlist'],
      AddCandidateToShortlistMutationVariables
    >({
      query: (variables) => ({
        ...GraphqlOperations.AddCandidateToShortlist,
        variables,
      }),
      transformResponse: (response: AddCandidateToShortlistMutation) =>
        response.addCandidateToShortlist,
      invalidatesTags: ['Candidate'],
    }),
    removeFromShortlist: builder.mutation<
      RemoveCandidateFromShortlistMutation['removeCandidateFromShortlist'],
      RemoveCandidateFromShortlistMutationVariables
    >({
      query: (variables) => ({
        ...GraphqlOperations.RemoveCandidateFromShortlist,
        variables,
      }),
      transformResponse: (response: RemoveCandidateFromShortlistMutation) =>
        response.removeCandidateFromShortlist,
      invalidatesTags: ['Candidate'],
    }),
  }),
});

export const { useAddToShortlistMutation, useRemoveFromShortlistMutation } =
  shortlistApi;
