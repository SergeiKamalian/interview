import { CheckCircle2 } from 'lucide-react';
import type { CompanyQuestionImportCommitResult } from '../model/types';
import { Alert, Button } from '@shared/ui';
import { Button as ShadcnButton } from '@shared/ui/button';

type ImportSuccessStepProps = {
  result: CompanyQuestionImportCommitResult;
  published: boolean;
  onViewDrafts: () => void;
  onClose: () => void;
};

export function ImportSuccessStep({
  result,
  published,
  onViewDrafts,
  onClose,
}: ImportSuccessStepProps) {
  const totalQuestions = result.questionsCreated + result.questionsUpdated;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-lg font-semibold text-foreground">
            Импорт завершён
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {published
              ? 'Вопросы сохранены как опубликованные.'
              : 'Вопросы сохранены как черновики — проверьте и опубликуйте.'}
          </p>
        </div>
      </div>

      <Alert variant="success" title="Итог">
        <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
          <li>
            Темы: создано {result.topicsCreated}, обновлено{' '}
            {result.topicsUpdated}
          </li>
          <li>Стеки: создано {result.skillsCreated}</li>
          <li>
            Вопросы: создано {result.questionsCreated}, обновлено{' '}
            {result.questionsUpdated} (всего {totalQuestions})
          </li>
        </ul>
      </Alert>

      <div className="flex flex-wrap justify-end gap-2">
        <ShadcnButton variant="outline" onClick={onClose}>
          Закрыть
        </ShadcnButton>
        {!published && (
          <Button variant="primary" onClick={onViewDrafts}>
            Перейти к черновикам
          </Button>
        )}
      </div>
    </div>
  );
}
