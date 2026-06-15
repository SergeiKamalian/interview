import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useCompleteInterviewAttemptMutation,
  useInterviewSessionQuery,
  useSubmitInterviewAnswerMutation,
} from '@features/public-interview/api/publicInterviewApi';
import { TextInterviewChat } from '@features/public-interview/ui/TextInterviewChat';
import { Alert, Card, Spinner } from '@shared/ui';

export function PublicInterviewSessionPage() {
  const { token = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attemptId') ?? '';

  const { data, isLoading, isError, refetch } = useInterviewSessionQuery(
    { publicToken: token, attemptId },
    { skip: !token || !attemptId, pollingInterval: 0 },
  );

  const [submitAnswer, { isLoading: isSubmitting }] =
    useSubmitInterviewAnswerMutation();
  const [completeAttempt] = useCompleteInterviewAttemptMutation();

  if (!attemptId) {
    return (
      <Alert variant="error" title="Сессия не найдена">
        Отсутствует attemptId. Вернитесь на страницу старта.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Spinner />
        Загрузка сессии…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error" title="Сессия недоступна">
        Не удалось загрузить интервью.
      </Alert>
    );
  }

  const isComplete = data.status === 'completed';

  return (
    <Card
      header={`Интервью · ${data.answeredQuestions}/${data.totalQuestions}`}
    >
      <TextInterviewChat
        messages={data.messages}
        currentQuestionText={data.currentQuestionText}
        isComplete={isComplete}
        isSubmitting={isSubmitting}
        onSubmitAnswer={async (answer) => {
          const result = await submitAnswer({
            publicToken: token,
            attemptId,
            answer,
          }).unwrap();

          await refetch();

          if (result.status === 'completed') {
            navigate(`/i/${token}/complete?attemptId=${attemptId}`);
          }
        }}
        onComplete={async () => {
          await completeAttempt({ publicToken: token, attemptId }).unwrap();
          navigate(`/i/${token}/complete?attemptId=${attemptId}`);
        }}
      />
    </Card>
  );
}
