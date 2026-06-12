import { useNavigate } from 'react-router-dom';
import { useGetHelloQuery } from '@shared/api/baseApi';
import {
  Alert,
  Button,
  Card,
  Input,
  Spinner,
} from '@shared/ui';

export function HomePage() {
  const navigate = useNavigate();
  const { data, error, isLoading, refetch } = useGetHelloQuery();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">AI Interviewer Platform</h1>
        <p className="text-slate-600">
          Frontend foundation: React, Vite, Tailwind, Redux Toolkit, RTK Query, GraphQL.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </section>

      <Card
        header="GraphQL health"
        footer={
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>
            Refetch hello
          </Button>
        }
      >
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Spinner label="Loading GraphQL hello query" />
            <span>Loading…</span>
          </div>
        )}
        {error && (
          <Alert variant="error" title="GraphQL error">
            {'message' in error ? String(error.message) : 'Request failed'}
          </Alert>
        )}
        {data && (
          <Alert variant="success" title="Backend connected">
            Response: <code className="font-mono">{data.hello}</code>
          </Alert>
        )}
      </Card>

      <Card header="UI primitives demo">
        <div className="space-y-4">
          <Input label="Email" type="email" placeholder="you@company.com" />
          <Input
            label="Password"
            type="password"
            error="Example validation error"
          />
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
