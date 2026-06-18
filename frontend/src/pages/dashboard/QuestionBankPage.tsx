import { useMemo, useState } from 'react';
import { useQuestionBankListQuery } from '@features/question-bank/api/questionBankApi';
import {
  EMPTY_QUESTION_BANK_FILTERS,
  filterQuestionBankItems,
  hasActiveQuestionBankFilters,
  type QuestionBankClientFilters,
} from '@entities/question/lib/filterQuestionBankItems';
import { groupQuestionsByPrimarySkill } from '@entities/question/lib/groupQuestionsBySkill';
import { QuestionBankFiltersBar } from '@widgets/question-bank/QuestionBankFiltersBar';
import { QuestionBankSkillAccordion } from '@widgets/question-bank/QuestionBankSkillAccordion';
import { QuestionBankDetails } from '@widgets/question-bank/QuestionBankTable';
import { Alert, Button, Card, Spinner } from '@shared/ui';

export function QuestionBankPage() {
  const [filters, setFilters] = useState<QuestionBankClientFilters>(
    EMPTY_QUESTION_BANK_FILTERS,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useQuestionBankListQuery();

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const filteredItems = useMemo(
    () => filterQuestionBankItems(items, filters),
    [items, filters],
  );
  const skillGroups = useMemo(
    () => groupQuestionsByPrimarySkill(filteredItems),
    [filteredItems],
  );

  const handleFiltersChange = (next: QuestionBankClientFilters) => {
    setFilters(next);

    if (selectedId) {
      const stillVisible = filterQuestionBankItems(items, next).some(
        (item) => item.id === selectedId,
      );
      if (!stillVisible) {
        setSelectedId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Question Bank</h2>
          <p className="text-sm text-slate-500">
            Вопросы по технологиям — фильтруйте по уровню, сложности и weight.
          </p>
        </div>
        <Button variant="primary" disabled title="Будет в следующих блоках">
          Создать вопрос
        </Button>
      </div>

      <Card>
        <QuestionBankFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
          onRefresh={() => void refetch()}
          onReset={() => {
            handleFiltersChange(EMPTY_QUESTION_BANK_FILTERS);
          }}
          showReset={hasActiveQuestionBankFilters(filters)}
        />

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
            <code>cd backend && pnpm seed:rebank</code>
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <p className="mb-3 text-sm text-slate-500">
              Показано {filteredItems.length} из {data?.total ?? items.length}{' '}
              вопросов · разделов: {skillGroups.length}
            </p>
            <QuestionBankSkillAccordion
              items={items}
              selectedId={selectedId}
              onSelect={setSelectedId}
              filters={filters}
            />
            {selectedId && (
              <div className="mt-6">
                <QuestionBankDetails questionId={selectedId} />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
