import type { RootState } from '@app/store';

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthCompany = (state: RootState) => state.auth.company;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsBootstrapping = (state: RootState) =>
  state.auth.isBootstrapping;
