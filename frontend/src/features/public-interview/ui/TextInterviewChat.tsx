import { useState } from 'react';
import { Button, Input, Spinner } from '@shared/ui';

type Message = {
  id: string;
  role: 'ai' | 'candidate';
  content: string;
  messageKind?: string | null;
  isStreaming?: boolean;
};

type TextInterviewChatProps = {
  messages: Message[];
  streamingMessage?: Message | null;
  currentQuestionText?: string | null;
  isComplete: boolean;
  isSubmitting: boolean;
  statusLabel?: string | null;
  onSubmitAnswer: (answer: string) => Promise<void>;
  onComplete: () => Promise<void>;
};

function resolveMessageLabel(message: Message): string {
  if (message.role === 'candidate') {
    return message.messageKind === 'follow_up_answer'
      ? 'Уточняющий ответ'
      : 'Ваш ответ';
  }

  if (message.messageKind === 'follow_up_question') {
    return 'Уточняющий вопрос';
  }

  return 'Основной вопрос';
}

export function TextInterviewChat({
  messages,
  streamingMessage,
  currentQuestionText,
  isComplete,
  isSubmitting,
  statusLabel,
  onSubmitAnswer,
  onComplete,
}: TextInterviewChatProps) {
  const [answer, setAnswer] = useState('');
  const showCurrentQuestion =
    Boolean(currentQuestionText) &&
    !streamingMessage &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return;
    }

    await onSubmitAnswer(answer.trim());
    setAnswer('');
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={[
              'rounded-lg px-3 py-2 text-sm',
              message.role === 'ai'
                ? 'bg-blue-50 text-slate-900'
                : 'bg-slate-100 text-slate-800 ml-8',
            ].join(' ')}
          >
            <p className="mb-1 text-xs font-medium uppercase text-slate-500">
              {resolveMessageLabel(message)}
            </p>
            <p>
              {message.content}
              {message.isStreaming ? (
                <span className="ml-0.5 inline-block animate-pulse text-blue-500">
                  ▍
                </span>
              ) : null}
            </p>
          </div>
        ))}
        {streamingMessage ? (
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-slate-900">
            <p className="mb-1 text-xs font-medium uppercase text-slate-500">
              {resolveMessageLabel(streamingMessage)}
            </p>
            <p>
              {streamingMessage.content}
              <span className="ml-0.5 inline-block animate-pulse text-blue-500">
                ▍
              </span>
            </p>
          </div>
        ) : null}
      </div>

      {!isComplete && (showCurrentQuestion || isSubmitting || streamingMessage) && (
        <div className="space-y-2">
          {showCurrentQuestion ? (
            <p className="text-sm text-slate-600">
              Текущий вопрос: {currentQuestionText}
            </p>
          ) : null}
          {statusLabel && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Spinner size="sm" label={statusLabel} />
              <span>{statusLabel}</span>
            </div>
          )}
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ…"
            disabled={isSubmitting}
          />
          <Button
            onClick={() => void handleSubmit()}
            loading={isSubmitting}
            disabled={!answer.trim() || isSubmitting}
          >
            Отправить ответ
          </Button>
        </div>
      )}

      {isComplete && (
        <Button variant="secondary" onClick={() => void onComplete()}>
          Перейти к завершению
        </Button>
      )}
    </div>
  );
}
