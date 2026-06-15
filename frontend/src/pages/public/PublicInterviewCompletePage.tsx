import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useInterviewSessionQuery } from '@features/public-interview/api/publicInterviewApi';
import { Alert, Card, Spinner } from '@shared/ui';

export function PublicInterviewCompletePage() {
  const { token = '' } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId') ?? '';

  const { data, isLoading } = useInterviewSessionQuery(
    { publicToken: token, attemptId },
    { skip: !token || !attemptId },
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Spinner />
        Загрузка…
      </div>
    );
  }

  return (
    <Card header="Интервью завершено">
      <Alert variant="success" title="Спасибо!">
        Вы ответили на {data?.answeredQuestions ?? 0} из{' '}
        {data?.totalQuestions ?? 0} вопросов. Результаты будут доступны
        рекрутеру (AI-оценка — в следующем блоке).
      </Alert>

      <p className="mt-4 text-sm text-slate-500">
        <Link to="/" className="text-brand-primary hover:underline">
          На главную
        </Link>
      </p>
    </Card>
  );
}
