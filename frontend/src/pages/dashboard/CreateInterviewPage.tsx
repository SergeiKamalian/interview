import { useLocation, useNavigate } from 'react-router-dom';
import { InterviewCreateWizard } from '@features/interview-create/ui/InterviewCreateWizard';
import type { InterviewWizardPrefillState } from '@features/interview-create/model/prefill';

export function CreateInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as InterviewWizardPrefillState | null;
  const prefill = state?.prefill;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          Создать интервью
        </h2>
        <p className="text-sm text-muted-foreground">
          Пошаговая настройка: вакансия, вопросы, поведение AI, формат, доступ и
          результаты.
        </p>
      </div>

      <InterviewCreateWizard
        initial={prefill}
        onCancel={() => navigate('/dashboard/interviews')}
      />
    </div>
  );
}
