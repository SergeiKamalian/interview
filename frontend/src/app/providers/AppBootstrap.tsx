import { useEffect } from 'react';
import { useLazyMeQuery } from '@features/auth/api/authApi';
import {
  logout,
  setBootstrapping,
  setMe,
} from '@features/auth/model/authSlice';
import { useAppDispatch } from '@app/store/hooks';
import { refreshAccessToken } from '@shared/lib/refresh-access-token';
import { tokenStorage } from '@shared/lib/token-storage';

type AppBootstrapProps = {
  children: React.ReactNode;
};

export function AppBootstrap({ children }: AppBootstrapProps) {
  const dispatch = useAppDispatch();
  const [fetchMe] = useLazyMeQuery();

  useEffect(() => {
    async function bootstrapAuth(): Promise<void> {
      let accessToken = tokenStorage.get();

      if (!accessToken) {
        accessToken = await refreshAccessToken();
        if (accessToken) {
          tokenStorage.set(accessToken);
        }
      }

      if (!accessToken) {
        dispatch(setBootstrapping(false));
        return;
      }

      try {
        const data = await fetchMe().unwrap();
        dispatch(setMe(data));
      } catch {
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken) {
          tokenStorage.set(refreshedToken);

          try {
            const data = await fetchMe().unwrap();
            dispatch(setMe(data));
            dispatch(setBootstrapping(false));
            return;
          } catch {
            // fall through to logout
          }
        }

        tokenStorage.clear();
        dispatch(logout());
      } finally {
        dispatch(setBootstrapping(false));
      }
    }

    void bootstrapAuth();
  }, [dispatch, fetchMe]);

  return children;
}
