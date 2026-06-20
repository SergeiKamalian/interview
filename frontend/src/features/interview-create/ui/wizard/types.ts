import type { WizardData } from '../../model/interviewWizard';

export interface WizardStepProps {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
}
