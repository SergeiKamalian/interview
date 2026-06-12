import { RouterProvider } from 'react-router-dom';
import { AppBootstrap } from '@app/providers/AppBootstrap';
import { router } from '@app/router';
import '@features/auth/api/authApi';

export function App() {
  return (
    <AppBootstrap>
      <RouterProvider router={router} />
    </AppBootstrap>
  );
}
