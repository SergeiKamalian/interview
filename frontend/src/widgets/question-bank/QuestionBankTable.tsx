import { useQuestionByIdQuery } from '@features/question-bank/api/questionBankApi';
import type { QuestionListItem } from '@entities/question/model/types';
import { QuestionExamples } from '@entities/question/ui/QuestionExamples';
import { Alert, Badge, Button, Spinner } from '@shared/ui';

type QuestionBankTableProps = {
  items: QuestionListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showDetails?: boolean;
};

function truncate(text: string, max = 72): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function QuestionBankTable({
  items,
  selectedId,
  onSelect,
  showDetails = true,
}: QuestionBankTableProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Вопрос</th>
              <th className="px-4 py-3 font-medium">Тема</th>
              <th className="px-4 py-3 font-medium">Уровень</th>
              <th className="px-4 py-3 font-medium">Сложность</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Weight</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr
                key={item.id}
                className={
                  selectedId === item.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                }
              >
                <td className="px-4 py-3 text-slate-900">
                  {truncate(item.questionText)}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.topic.name}</td>
                <td className="px-4 py-3 text-slate-600">{item.level}</td>
                <td className="px-4 py-3 text-slate-600">{item.difficulty}</td>
                <td className="px-4 py-3 text-slate-600">{item.maxScore}</td>
                <td className="px-4 py-3 text-slate-600">
                  {item.topic.interviewWeight ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={item.isActive ? 'success' : 'muted'}>
                    {item.isActive ? 'active' : 'archived'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(item.id)}
                  >
                    Подробнее
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetails && selectedId && (
        <QuestionBankDetails questionId={selectedId} />
      )}
    </div>
  );
}

type QuestionBankDetailsProps = {
  questionId: string;
};

export function QuestionBankDetails({ questionId }: QuestionBankDetailsProps) {
  const { data: selected, isLoading, isError } = useQuestionByIdQuery(questionId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <Spinner />
        Загрузка деталей вопроса…
      </div>
    );
  }

  if (isError || !selected) {
    return (
      <Alert variant="error" title="Не удалось загрузить вопрос">
        Попробуйте выбрать вопрос ещё раз.
      </Alert>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-medium text-slate-900">
        {selected.questionText}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {selected.profession.name} · {selected.topic.name} · weight{' '}
        {selected.topic.interviewWeight ?? '—'} · max score {selected.maxScore}
      </p>

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-medium text-slate-800">
          Checkpoints (веса)
        </h4>
        <ul className="space-y-2">
          {selected.checkpoints.map((checkpoint) => (
            <li
              key={checkpoint.id}
              className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="text-slate-800">{checkpoint.title}</span>
              <span className="shrink-0 font-medium text-brand-primary">
                {checkpoint.score} pts
              </span>
            </li>
          ))}
          {selected.checkpoints.length === 0 && (
            <li className="text-sm text-slate-500">Checkpoints не заданы.</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-medium text-slate-800">
          Примеры ответов
        </h4>
        <QuestionExamples examples={selected.answerExamples} />
      </div>
    </section>
  );
}
