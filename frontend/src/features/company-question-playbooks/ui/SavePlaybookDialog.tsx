import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCompanyQuestionPlaybookMutation } from '@features/company-question-playbooks/api/companyQuestionPlaybookApi';
import type { QuestionListItem } from '@entities/question/model/types';
import {
  Button,
  Checkbox,
  Input,
  Label,
} from '@shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import type { QuestionLevel } from '@shared/api/graphql/generated/graphql';

type SavePlaybookDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionId: string;
  level: QuestionLevel;
  skillIds: string[];
  questionIds: string[];
  questionsById: Map<string, QuestionListItem>;
};

export function SavePlaybookDialog({
  open,
  onOpenChange,
  professionId,
  level,
  skillIds,
  questionIds,
  questionsById,
}: SavePlaybookDialogProps) {
  const [name, setName] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());
  const [createPlaybook, { isLoading }] =
    useCreateCompanyQuestionPlaybookMutation();

  const reset = () => {
    setName('');
    setPinnedIds(new Set());
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
    }
    onOpenChange(next);
  };

  const togglePinned = (id: string) => {
    setPinnedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Укажите название набора');
      return;
    }
    if (questionIds.length === 0) {
      toast.error('Выберите хотя бы один вопрос');
      return;
    }

    try {
      await createPlaybook({
        name: trimmed,
        professionId,
        level,
        skillIds: skillIds.length > 0 ? skillIds : undefined,
        items: questionIds.map((questionId, index) => ({
          questionId,
          sortOrder: index,
          isPinned: pinnedIds.has(questionId),
        })),
      }).unwrap();
      toast.success('Набор вопросов сохранён');
      handleOpenChange(false);
    } catch {
      toast.error('Не удалось сохранить набор');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="size-4" />
            Сохранить набор вопросов
          </DialogTitle>
          <DialogDescription>
            Набор можно будет быстро применить при создании следующих интервью
            той же профессии и уровня.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            label="Название"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Frontend Middle — типовой набор"
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Вопросы ({questionIds.length})
            </Label>
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
              {questionIds.map((id) => {
                const question = questionsById.get(id);
                const text = question?.questionText ?? `Вопрос ${id}`;
                return (
                  <li
                    key={id}
                    className="flex items-start gap-2 rounded-md border border-border px-2 py-1.5"
                  >
                    <Checkbox
                      checked={pinnedIds.has(id)}
                      onCheckedChange={() => togglePinned(id)}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-snug">
                      {text.length > 90 ? `${text.slice(0, 90)}…` : text}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground">
              Отметьте галочкой вопросы, которые должны быть закреплены при
              применении набора — они всегда попадут в интервью.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Отмена
          </Button>
          <Button loading={isLoading} onClick={() => void handleSave()}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
