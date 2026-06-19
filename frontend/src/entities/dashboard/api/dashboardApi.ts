import { baseApi } from '@shared/api/baseApi';
import { GraphqlOperations } from '@shared/api/graphql/operations.registry';
import type { CompanyDashboardOverviewQuery } from '@shared/api/graphql/generated/graphql';

export type DashboardOverview = CompanyDashboardOverviewQuery['companyDashboardOverview'];

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => ({
        ...GraphqlOperations.CompanyDashboardOverview,
      }),
      transformResponse: (response: CompanyDashboardOverviewQuery) =>
        response.companyDashboardOverview,
      providesTags: ['Interview', 'Candidate', 'Analytics'],
    }),
  }),
});

export const { useCompanyDashboardOverviewQuery } = dashboardApi;
