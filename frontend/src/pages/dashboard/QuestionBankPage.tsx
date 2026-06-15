import { useMemo, useState } from 'react';
import { useQuestionBankQuery } from '@features/question-bank/api/questionBankApi';
import { QuestionBankTable } from '@widgets/question-bank/QuestionBankTable';
import { Alert, Button, Card, Input, Spinner } from '@shared/ui';

export function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useQuestionBankQuery({
    limit: 50,
    offset: 0,
    search: search.trim() || undefined,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Question Bank</h2>
          <p className="text-sm text-slate-500">
            База вопросов с checkpoints, весами и примерами ответов.
          </p>
        </div>
        <Button variant="primary" disabled title="Будет в следующих блоках">
          Создать вопрос
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Поиск
            </label>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Текст вопроса…"
            />
          </div>
          <Button variant="secondary" onClick={() => void refetch()}>
            Обновить
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Загрузка вопросов…
          </div>
        )}

        {isError && (
          <Alert variant="error" title="Не удалось загрузить question bank">
            {'message' in (error as object)
              ? String((error as { message: string }).message)
              : 'Unknown error'}
          </Alert>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Alert variant="info" title="Пусто">
            Вопросов пока нет. Запустите seed:{' '}
            <code>cd backend && npm run seed:question-bank</code>
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <p className="mb-3 text-sm text-slate-500">
              Всего вопросов: {data?.total ?? items.length}
            </p>
            <QuestionBankTable
              items={items}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </>
        )}
      </Card>
    </div>
  );
}
