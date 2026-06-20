import { type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon } from 'lucide-react';
import { Alert, Button, Card } from '@shared/ui';
import { cn } from '@shared/lib/utils';
import { useCreateInterviewMutation } from '../api/interviewCreateApi';
import {
  useInterviewWizard,
  type WizardData,
} from '../model/interviewWizard';
import { Step1Vacancy } from './wizard/Step1Vacancy';
import { Step2Questions } from './wizard/Step2Questions';
import { Step3Behavior } from './wizard/Step3Behavior';
import { Step4Format } from './wizard/Step4Format';
import { Step5Access } from './wizard/Step5Access';
import { Step6Results } from './wizard/Step6Results';
import { Step7Review } from './wizard/Step7Review';
import type { WizardStepProps } from './wizard/types';

export interface InterviewCreateWizardProps {
  /** Optional prefill (JD draft / template). Applied to the initial state. */
  initial?: Partial<WizardData>;
  onCancel?: () => void;
}

const STEP_COMPONENTS: ComponentType<WizardStepProps>[] = [
  Step1Vacancy,
  Step2Questions,
  Step3Behavior,
  Step4Format,
  Step5Access,
  Step6Results,
  Step7Review,
];

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Неизвестная ошибка';
}

export function InterviewCreateWizard({
  initial,
  onCancel,
}: InterviewCreateWizardProps) {
  const navigate = useNavigate();
  const wizard = useInterviewWizard(initial);
  const {
    data,
    update,
    stepIndex,
    steps,
    goNext,
    goBack,
    goTo,
    isStepValid,
    canSubmit,
    buildCreateInput,
  } = wizard;

  const [createInterview, { isLoading: isCreating, error: createError }] =
    useCreateInterviewMutation();

  const isLastStep = stepIndex === steps.length - 1;
  const StepComponent = STEP_COMPONENTS[stepIndex];

  const handleCreate = async () => {
    try {
      const result = await createInterview(buildCreateInput()).unwrap();
      toast.success('Интервью создано — управляйте им на этой странице');
      navigate(`/dashboard/interviews/${result.id}`);
    } catch {
      toast.error('Не удалось создать интервью');
    }
  };

  const currentStep = steps[stepIndex];

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isCurrent = index === stepIndex;
          const isDone = index < stepIndex && isStepValid(index);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                isCurrent
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : isDone
                    ? 'border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10'
                    : 'border-input text-muted-foreground hover:bg-accent/40',
              )}
            >
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-xs font-semibold',
                  isCurrent
                    ? 'bg-primary-foreground/20'
                    : isDone
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {isDone ? <CheckIcon className="size-3" /> : index + 1}
              </span>
              {step.title}
            </button>
          );
        })}
      </nav>

      <Card>
        <div className="mb-6 space-y-1 border-b border-border pb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Шаг {stepIndex + 1} из {steps.length}
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            {currentStep.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentStep.description}
          </p>
        </div>

        <StepComponent data={data} update={update} />

        {createError && (
          <div className="mt-4">
            <Alert variant="error" title="Ошибка создания">
              {errorMessage(createError)}
            </Alert>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Отмена
              </Button>
            )}
            {stepIndex > 0 && (
              <Button variant="secondary" onClick={goBack}>
                Назад
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button onClick={goNext} disabled={!isStepValid(stepIndex)}>
                Далее
              </Button>
            )}
            {isLastStep && (
              <Button
                onClick={() => void handleCreate()}
                loading={isCreating}
                disabled={!canSubmit}
              >
                Создать интервью
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
