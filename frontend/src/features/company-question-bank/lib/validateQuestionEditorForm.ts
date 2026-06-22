import {
  CHECKPOINT_WEIGHT_TARGET,
  isCheckpointWeightValid,
} from './checkpointWeights';
import type { QuestionEditorFormValues } from '../model/types';

export type CheckpointFieldErrors = {
  checkpointKey?: string;
  title?: string;
  expected?: string;
};

export type QuestionEditorFieldErrors = {
  questionText?: string;
  shortAnswer?: string;
  idealAnswer?: string;
  professionId?: string;
  skillIds?: string;
  checkpointWeights?: string;
  checkpoints?: Record<number, CheckpointFieldErrors>;
};

export function validateQuestionEditorForm(
  values: QuestionEditorFormValues,
  weightTotal: number,
): QuestionEditorFieldErrors {
  const errors: QuestionEditorFieldErrors = {};

  if (!values.professionId) {
    errors.professionId = 'Выберите профессию';
  }

  if (!values.skillIds[0]) {
    errors.skillIds = 'Выберите стек';
  }

  if (!values.questionText.trim()) {
    errors.questionText = 'Введите текст вопроса';
  }

  if (!values.shortAnswer.trim()) {
    errors.shortAnswer = 'Введите краткий ответ';
  }

  if (!values.idealAnswer.trim()) {
    errors.idealAnswer = 'Введите идеальный ответ';
  }

  if (!isCheckpointWeightValid(weightTotal)) {
    errors.checkpointWeights = `Сумма весов должна быть ${CHECKPOINT_WEIGHT_TARGET}`;
  }

  const checkpointErrors: Record<number, CheckpointFieldErrors> = {};
  for (const [index, checkpoint] of values.checkpoints.entries()) {
    const row: CheckpointFieldErrors = {};

    if (!checkpoint.checkpointKey.trim()) {
      row.checkpointKey = 'Укажите key (snake_case)';
    }

    if (!checkpoint.title.trim()) {
      row.title = 'Укажите название критерия';
    }

    if (!checkpoint.expected.trim()) {
      row.expected = 'Укажите ожидаемый ответ';
    }

    if (Object.keys(row).length > 0) {
      checkpointErrors[index] = row;
    }
  }

  if (Object.keys(checkpointErrors).length > 0) {
    errors.checkpoints = checkpointErrors;
  }

  return errors;
}

export function hasQuestionEditorErrors(
  errors: QuestionEditorFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

/** Scroll target for the first invalid block in the form. */
export function firstQuestionEditorErrorSectionId(
  errors: QuestionEditorFieldErrors,
): string | null {
  if (
    errors.questionText ||
    errors.shortAnswer ||
    errors.idealAnswer ||
    errors.professionId ||
    errors.skillIds
  ) {
    return 'question-form-main';
  }

  if (errors.checkpointWeights || errors.checkpoints) {
    return 'question-form-checkpoints';
  }

  return null;
}
