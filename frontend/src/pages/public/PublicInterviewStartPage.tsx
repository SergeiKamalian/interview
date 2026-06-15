import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  usePublicInterviewQuery,
  useStartPublicInterviewMutation,
} from '@features/public-interview/api/publicInterviewApi';
import { Alert, Button, Card, Input, Spinner } from '@shared/ui';

export function PublicInterviewStartPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const { data, isLoading, isError } = usePublicInterviewQuery(token, {
    skip: !token,
  });
  const [startInterview, { isLoading: isStarting, error: startError }] =
    useStartPublicInterviewMutation();

  const handleStart = async () => {
    const result = await startInterview({
      publicToken: token,
      fullName,
      email,
    }).unwrap();

    navigate(`/i/${token}/session?attemptId=${result.attemptId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Spinner />
        Загрузка интервью…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Интервью недоступно">
        Ссылка недействительна или интервью ещё не опубликовано.
      </Alert>
    );
  }

  return (
    <Card header={data.title}>
      <p className="mb-4 text-sm text-slate-600">
        {data.jobRole} · {data.questionCount} вопросов · {data.interviewLanguage}
      </p>

      <div className="mb-4 grid gap-3">
        <Input
          label="Имя и фамилия"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {startError && (
        <Alert variant="error" title="Не удалось начать">
          {'message' in (startError as object)
            ? String((startError as { message: string }).message)
            : 'Unknown error'}
        </Alert>
      )}

      <Button
        onClick={() => void handleStart()}
        loading={isStarting}
        disabled={!fullName.trim() || !email.trim()}
      >
        {isStarting ? 'Инициализируем AI-чат…' : 'Начать интервью'}
      </Button>
      {isStarting && (
        <p className="mt-3 text-sm text-slate-500">
          Готовим первый вопрос и контекст оценки. Обычно это занимает несколько
          секунд.
        </p>
      )}
    </Card>
  );
}
