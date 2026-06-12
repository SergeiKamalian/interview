import { Link } from 'react-router-dom';
import { Button } from '@shared/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">Page not found</p>
      <Link to="/">
        <Button variant="secondary">Go home</Button>
      </Link>
    </div>
  );
}
