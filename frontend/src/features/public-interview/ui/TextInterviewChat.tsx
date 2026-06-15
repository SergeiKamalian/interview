import { useState } from 'react';
import { Button, Input } from '@shared/ui';

type Message = {
  id: string;
  role: 'ai' | 'candidate';
  content: string;
};

type TextInterviewChatProps = {
  messages: Message[];
  currentQuestionText?: string | null;
  isComplete: boolean;
  isSubmitting: boolean;
  onSubmitAnswer: (answer: string) => Promise<void>;
  onComplete: () => Promise<void>;
};

export function TextInterviewChat({
  messages,
  currentQuestionText,
  isComplete,
  isSubmitting,
  onSubmitAnswer,
  onComplete,
}: TextInterviewChatProps) {
  const [answer, setAnswer] = useState('');

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
              {message.role === 'ai' ? 'Вопрос' : 'Ваш ответ'}
            </p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {!isComplete && currentQuestionText && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            Текущий вопрос: {currentQuestionText}
          </p>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ…"
          />
          <Button
            onClick={() => void handleSubmit()}
            loading={isSubmitting}
            disabled={!answer.trim()}
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
