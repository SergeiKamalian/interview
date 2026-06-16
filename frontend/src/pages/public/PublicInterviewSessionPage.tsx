import { useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { uploadInterviewAudio } from '@features/voice-interview/api/audioUploadApi';
import {
  useCompleteInterviewAttemptMutation,
  useInterviewSessionQuery,
  useSubmitInterviewAnswerMutation,
} from '@features/public-interview/api/publicInterviewApi';
import { useInterviewRealtime } from '@features/public-interview/model/useInterviewRealtime';
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

  const handleResync = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const { statusLabel, streamingMessage, audioState, replayAiAudio, isConnected, markAnswerSending, resetPhase } =
    useInterviewRealtime({
    publicToken: token,
    attemptId,
    enabled: Boolean(token && attemptId),
    onResync: handleResync,
  });

  const streamingChatMessage = streamingMessage
    ? {
        id: `stream-${streamingMessage.streamId}`,
        role: 'ai' as const,
        content: streamingMessage.content,
        messageKind: streamingMessage.messageKind,
        isStreaming: true,
      }
    : null;

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
  const answeredMainQuestions = data.answeredQuestions;

  return (
    <Card
      header={`Интервью · ${answeredMainQuestions}/${data.totalQuestions}`}
    >
      <TextInterviewChat
        messages={data.messages}
        streamingMessage={streamingChatMessage}
        currentQuestionText={data.currentQuestionText}
        isComplete={isComplete}
        isSubmitting={isSubmitting}
        statusLabel={statusLabel}
        aiAudioState={audioState}
        showQuestionAudioControls={isConnected && Boolean(data.currentQuestionText)}
        onReplayAiAudio={replayAiAudio}
        onSubmitVoiceAnswer={async ({ blob, mimeType, durationSec }) => {
          markAnswerSending();
          const upload = await uploadInterviewAudio({
            publicToken: token,
            attemptId,
            blob,
            mimeType,
            durationSec,
          });

          const result = await submitAnswer({
            publicToken: token,
            attemptId,
            answer: '',
            mediaAssetId: upload.mediaAssetId,
          }).unwrap();

          await refetch();
          resetPhase();

          if (result.status === 'completed') {
            navigate(`/i/${token}/complete?attemptId=${attemptId}`);
          }
        }}
        onSubmitAnswer={async (answer) => {
          markAnswerSending();
          const result = await submitAnswer({
            publicToken: token,
            attemptId,
            answer,
          }).unwrap();

          await refetch();
          resetPhase();

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
