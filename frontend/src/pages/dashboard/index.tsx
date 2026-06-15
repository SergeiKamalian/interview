import { Link } from 'react-router-dom';
import { Alert, Card, Spinner } from '@shared/ui';

type DashboardOverviewProps = {
  status?: 'loading' | 'error' | 'empty' | 'ready';
  errorMessage?: string;
};

export function DashboardOverviewPage({
  status = 'empty',
  errorMessage,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Company dashboard</h2>
        <p className="text-sm text-slate-500">
          Обзор интервью, кандидатов и аналитики для вашей команды.
        </p>
      </div>

      {status === 'loading' && (
        <Card>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Загрузка сводки…
          </div>
        </Card>
      )}

      {status === 'error' && (
        <Alert variant="error" title="Не удалось загрузить сводку">
          {errorMessage ?? 'Попробуйте обновить страницу позже.'}
        </Alert>
      )}

      {status === 'empty' && (
        <Alert variant="info" title="Данных пока нет">
          Создайте интервью или дождитесь завершения попыток кандидатов — здесь
          появится сводка по оценкам и shortlist.
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card header="Interviews">
          <p className="mb-3 text-sm text-slate-600">
            Список интервью компании с фильтрами и статусами.
          </p>
          <Link
            to="/dashboard/interviews"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            Перейти к интервью →
          </Link>
        </Card>
        <Card header="Candidates">
          <p className="mb-3 text-sm text-slate-600">
            Кандидаты и агрегированные метрики оценки.
          </p>
          <Link
            to="/dashboard/candidates"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            Перейти к кандидатам →
          </Link>
        </Card>
        <Card header="Analytics">
          <p className="mb-3 text-sm text-slate-600">
            Аналитика по навыкам, темам и стоимости AI.
          </p>
          <Link
            to="/dashboard/analytics"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            Перейти к аналитике →
          </Link>
        </Card>
      </div>
    </div>
  );
}
