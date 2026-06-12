import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthCompany, AuthUser, MePayload } from './types';

type AuthState = {
  user: AuthUser | null;
  company: AuthCompany | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
};

const initialState: AuthState = {
  user: null,
  company: null,
  isAuthenticated: false,
  isBootstrapping: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; company: AuthCompany }>,
    ) {
      state.user = action.payload.user;
      state.company = action.payload.company;
      state.isAuthenticated = true;
    },
    setMe(state, action: PayloadAction<MePayload>) {
      state.user = action.payload.user;
      state.company = action.payload.company;
      state.isAuthenticated = true;
    },
    setBootstrapping(state, action: PayloadAction<boolean>) {
      state.isBootstrapping = action.payload;
    },
    logout(state) {
      state.user = null;
      state.company = null;
      state.isAuthenticated = false;
      state.isBootstrapping = false;
    },
  },
});

export const { setCredentials, setMe, setBootstrapping, logout } =
  authSlice.actions;

export const authReducer = authSlice.reducer;
