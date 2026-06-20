import { useState } from 'react';
import { BookmarkIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateInterviewTemplateMutation } from '@entities/interview-template/api/interviewTemplatesApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui';
import type { CreateInterviewTemplateInput } from '@shared/api/graphql/generated/graphql';
import type { WizardData } from '../model/interviewWizard';

export interface SaveAsTemplateDialogProps {
  data: WizardData;
  /** Disable the entry point until the wizard has the minimum required data. */
  disabled?: boolean;
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Не удалось сохранить шаблон. Попробуйте ещё раз.';
}

/**
 * Builds a template input from the (editable) wizard state. A template is a
 * reusable set of settings — `expiresAt` is intentionally omitted (per-interview).
 */
function buildTemplateInput(
  data: WizardData,
  title: string,
): CreateInterviewTemplateInput {
  return {
    title: title.trim(),
    jobRole: data.jobRole.trim(),
    level: data.level,
    interviewLanguage: data.interviewLanguage || 'ru',
    jobDescription: data.jobDescription.trim() || undefined,
    professionId: data.professionId || undefined,
    isVideoEnabled: data.mode === 'video',
    interviewerName: data.interviewerName.trim() || undefined,
    welcomeMessageTemplate: data.welcomeMessageTemplate.trim() || undefined,
    aiTone: data.aiTone,
    probingDepth: data.probingDepth,
    scoringStrictness: data.scoringStrictness,
    maxCompletions: data.maxCompletions ?? undefined,
    allowRetake: data.allowRetake,
    timeLimitMinutes: data.timeLimitMinutes ?? undefined,
    passingScore: data.passingScore ?? undefined,
    requirePhone: data.requirePhone,
    requireLinkedin: data.requireLinkedin,
    requireGithub: data.requireGithub,
    questionIds: data.questionIds,
  };
}

export function SaveAsTemplateDialog({
  data,
  disabled,
}: SaveAsTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [createTemplate, { isLoading }] = useCreateInterviewTemplateMutation();

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setTitle(data.title);
    }
    setOpen(next);
  };

  const canSave =
    title.trim().length > 0 &&
    data.jobRole.trim().length > 0 &&
    data.questionIds.length > 0 &&
    !isLoading;

  const handleSave = async () => {
    try {
      await createTemplate(buildTemplateInput(data, title)).unwrap();
      toast.success('Шаблон сохранён', {
        description: 'Доступен при создании интервью «Из шаблона».',
      });
      setOpen(false);
    } catch (error) {
      toast.error('Ошибка сохранения', { description: errorMessage(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" disabled={disabled}>
            <BookmarkIcon className="size-4" />
            Сохранить как шаблон
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сохранить как шаблон</DialogTitle>
          <DialogDescription>
            Шаблон сохранит текущие настройки (вопросы, поведение AI, лимиты) для
            повторного использования. Дедлайн в шаблон не входит — он задаётся
            при создании интервью.
          </DialogDescription>
        </DialogHeader>

        <Input
          label="Название шаблона"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Frontend React — Middle"
          autoFocus
        />

        <DialogFooter>
          <Button
            variant="ghost"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Отмена
          </Button>
          <Button disabled={!canSave} onClick={() => void handleSave()}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Сохранить шаблон
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
