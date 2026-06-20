import { useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useDraftInterviewFromJobDescriptionMutation } from '@features/question-bank/api/questionBankApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Textarea } from '@shared/ui/textarea';
import { Skeleton } from '@shared/ui/skeleton';
import type { WizardData } from '../model/interviewWizard';
import { normalizeWizardLevel } from '../model/prefill';

const MIN_JD_LENGTH = 40;
const MAX_JD_LENGTH = 20000;

export interface JobDescriptionGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the wizard prefill has been built from the JD draft. */
  onGenerated: (prefill: Partial<WizardData>) => void;
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Не удалось разобрать описание вакансии. Попробуйте ещё раз.';
}

export function JobDescriptionGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
}: JobDescriptionGenerateDialogProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [draft, { isLoading, reset }] =
    useDraftInterviewFromJobDescriptionMutation();

  const trimmed = jobDescription.trim();
  const canGenerate = trimmed.length >= MIN_JD_LENGTH && !isLoading;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setJobDescription('');
      reset();
    }
    onOpenChange(next);
  };

  const handleGenerate = async () => {
    try {
      const result = await draft({
        jobDescription: trimmed.slice(0, MAX_JD_LENGTH),
      }).unwrap();

      const prefill: Partial<WizardData> = {
        jobDescription: trimmed,
        questionIds: result.questionIds ?? [],
        skillIds: result.skillIds ?? [],
      };
      if (result.title) {
        prefill.title = result.title;
      }
      if (result.jobRole) {
        prefill.jobRole = result.jobRole;
      }
      if (result.professionId) {
        prefill.professionId = result.professionId;
      }
      const level = normalizeWizardLevel(result.level);
      if (level) {
        prefill.level = level;
      }

      if (result.generatedByAi) {
        toast.success('Описание разобрано — визард предзаполнен', {
          description: `Подобрано вопросов: ${prefill.questionIds?.length ?? 0}`,
        });
      } else {
        toast.warning('Не удалось точно определить профессию', {
          description:
            'Открываем визард — проверьте поля и подберите вопросы вручную.',
        });
      }

      handleOpenChange(false);
      onGenerated(prefill);
    } catch (mutationError) {
      toast.error('Ошибка генерации', {
        description: errorMessage(mutationError),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Сгенерировать из описания вакансии</DialogTitle>
          <DialogDescription>
            Вставьте текст вакансии — AI определит профессию, уровень и навыки и
            подберёт вопросы из банка. Это только предзаполнит визард, интервью
            не создаётся.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <p className="text-sm text-muted-foreground">
              AI анализирует описание и подбирает вопросы…
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Textarea
              autoFocus
              className="min-h-48"
              placeholder="Например: Ищем Middle Frontend разработчика на React/TypeScript. Опыт с Redux, REST API, тестированием…"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {trimmed.length < MIN_JD_LENGTH
                ? `Введите хотя бы ${MIN_JD_LENGTH} символов (${trimmed.length}).`
                : `${trimmed.length} символов`}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => handleOpenChange(false)}
          >
            Отмена
          </Button>
          <Button disabled={!canGenerate} onClick={() => void handleGenerate()}>
            <SparklesIcon className="size-3.5" />
            Сгенерировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
