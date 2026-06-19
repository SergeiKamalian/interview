import { Outlet, Link } from 'react-router-dom';
import { GalleryVerticalEnd } from 'lucide-react';
import { env } from '@shared/config/env';
import { ThemeToggle } from '@shared/ui';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium text-foreground"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {env.appName}
        </Link>

        <Outlet />
      </div>
    </div>
  );
}
