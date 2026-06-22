import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useCreateQuestionMutation,
  useProfessionsQuery,
  useSkillsQuery,
  useTopicsQuery,
  useUpdateQuestionMutation,
} from '@features/question-bank/api/questionBankApi';
import {
  useCreateCompanyTopicMutation,
} from '@features/company-question-bank/api/companyQuestionBankApi';
import { toSkillSelectOptions } from '@entities/question/lib/customSelectOptions';
import {
  buildDefaultCompanyTopicCode,
  pickTopicIdForSkill,
} from '@features/company-question-bank/lib/resolveTopicForSkill';
import type { QuestionDetail } from '@entities/question/model/types';
import {
  CHECKPOINT_WEIGHT_TARGET,
  sumCheckpointWeights,
} from '../lib/checkpointWeights';
import {
  firstQuestionEditorErrorSectionId,
  hasQuestionEditorErrors,
  validateQuestionEditorForm,
  type QuestionEditorFieldErrors,
} from '../lib/validateQuestionEditorForm';
import { createInitialFormValues } from '../model/mapQuestionToForm';
import type { QuestionEditorFormValues } from '../model/types';
import { AnswerExamplesEditor } from './AnswerExamplesEditor';
import { CheckpointEditor } from './CheckpointEditor';
import { CompanySkillDialog } from './CompanySkillDialog';
import {
  Alert,
  Badge,
  Button,
  Card,
  CheckboxField,
  PAGE_SECTION_NAV_LAYOUT,
  SelectField,
  Separator,
  Textarea,
} from '@shared/ui';
import { Slider } from '@shared/ui/slider';
import { Button as ShadcnButton } from '@shared/ui/button';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from '@shared/api/graphql/generated/graphql';

type QuestionEditorFormProps = {
  mode: 'create' | 'edit';
  question?: QuestionDetail | null;
  initialSkillId?: string;
  onSaved: (questionId: string) => void;
  onCancel: () => void;
};

const DEFAULT_COMPANY_PRIORITY = 5;
const { sectionClassName } = PAGE_SECTION_NAV_LAYOUT;

function buildMutationInput(
  values: QuestionEditorFormValues,
  topicId: string,
  questionId?: string,
): CreateQuestionInput | UpdateQuestionInput {
  const checkpoints = values.checkpoints.map((checkpoint, index) => ({
    checkpointKey: checkpoint.checkpointKey.trim(),
    title: checkpoint.title.trim(),
    expected: checkpoint.expected.trim(),
    score: checkpoint.score,
    sortOrder: index,
    evaluationHints:
      checkpoint.mustConcepts.length > 0 || checkpoint.falseClaims.length > 0
        ? {
            mustConcepts: checkpoint.mustConcepts,
            falseClaims: checkpoint.falseClaims,
          }
        : undefined,
  }));

  const answerExamples = values.answerExamples.map((example, index) => ({
    exampleType: example.exampleType,
    exampleText: example.exampleText.trim(),
    sortOrder: index,
  }));

  const base = {
    professionId: values.professionId,
    topicId,
    level: values.level,
    difficulty: values.difficulty,
    questionText: values.questionText.trim(),
    shortAnswer: values.shortAnswer.trim(),
    idealAnswer: values.idealAnswer.trim(),
    maxScore: CHECKPOINT_WEIGHT_TARGET,
    skillIds: values.skillIds,
    checkpoints,
    answerExamples,
    status: values.status,
    companyPriority: values.companyPriority,
    isRequired: values.isRequired,
  };

  if (questionId) {
    return { ...base, id: questionId };
  }

  return base;
}

export function QuestionEditorForm({
  mode,
  question,
  initialSkillId,
  onSaved,
  onCancel,
}: QuestionEditorFormProps) {
  const [values, setValues] = useState<QuestionEditorFormValues>(() => {
    const base = createInitialFormValues(question);
    if (!question && initialSkillId) {
      return { ...base, skillIds: [initialSkillId] };
    }
    return base;
  });
  const [fieldErrors, setFieldErrors] = useState<QuestionEditorFieldErrors>({});
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [createQuestion, createState] = useCreateQuestionMutation();
  const [updateQuestion, updateState] = useUpdateQuestionMutation();
  const [createCompanyTopic] = useCreateCompanyTopicMutation();

  const { data: professions = [] } = useProfessionsQuery();
  const { data: skills = [] } = useSkillsQuery();
  const selectedSkillId = values.skillIds[0] ?? '';

  const { data: topicsForSkill = [] } = useTopicsQuery(
    values.professionId && selectedSkillId
      ? { professionId: values.professionId, skillId: selectedSkillId }
      : undefined,
    { skip: !values.professionId || !selectedSkillId },
  );

  const readOnly = mode === 'edit' && question != null && !question.isCustom;
  const isSaving = createState.isLoading || updateState.isLoading;
  const weightTotal = sumCheckpointWeights(values.checkpoints);

  const professionOptions = useMemo(
    () => professions.map((item) => ({ value: item.id, label: item.name })),
    [professions],
  );

  const skillOptions = useMemo(
    () => toSkillSelectOptions(skills),
    [skills],
  );

  const patch = (partial: Partial<QuestionEditorFormValues>) => {
    setValues((current) => ({ ...current, ...partial }));
    setFieldErrors({});
  };

  const resolveTopicId = async (): Promise<string> => {
    if (values.topicId && mode === 'edit') {
      return values.topicId;
    }

    if (!selectedSkillId) {
      throw new Error('skill');
    }

    const existing = pickTopicIdForSkill(selectedSkillId, topicsForSkill);
    if (existing) {
      return existing;
    }

    const skill = skills.find((item) => item.id === selectedSkillId);
    if (!skill) {
      throw new Error('skill');
    }

    const created = await createCompanyTopic({
      code: buildDefaultCompanyTopicCode(skill.code),
      name: `${skill.name} — наши вопросы`,
      skillId: skill.id,
      interviewWeight: 5,
    }).unwrap();

    return created.id;
  };

  const handleSubmit = async () => {
    if (readOnly) {
      return;
    }

    const validationErrors = validateQuestionEditorForm(values, weightTotal);
    if (hasQuestionEditorErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      const sectionId = firstQuestionEditorErrorSectionId(validationErrors);
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
      toast.error('Проверьте форму', {
        description: 'Заполните обязательные поля перед сохранением',
      });
      return;
    }

    try {
      const topicId = await resolveTopicId();

      if (mode === 'create') {
        const result = await createQuestion(
          buildMutationInput(values, topicId) as CreateQuestionInput,
        ).unwrap();
        toast.success('Вопрос создан');
        onSaved(result.id);
        return;
      }

      if (!question?.id) {
        return;
      }

      const result = await updateQuestion(
        buildMutationInput(values, topicId, question.id) as UpdateQuestionInput,
      ).unwrap();
      toast.success('Вопрос сохранён');
      onSaved(result.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'skill') {
        toast.error('Выберите стек');
        return;
      }
      toast.error('Не удалось сохранить вопрос');
    }
  };

  return (
    <fieldset disabled={readOnly} className="space-y-6 border-0 p-0 m-0">
      {readOnly && (
        <Alert variant="info" title="Платформенный вопрос">
          Его нельзя менять напрямую. Нажмите «Сделать свою копию» — получите
          редактируемую версию. Либо добавьте свои red/green flags ниже, не
          меняя текст вопроса.
        </Alert>
      )}

      <Card id="question-form-main" className={sectionClassName}>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-foreground">Основное</h3>
            <p className="text-sm text-muted-foreground">
              Текст вопроса, ответы и привязка к профессии и стеку.
            </p>
          </div>

          <Textarea
            label="Текст вопроса"
            value={values.questionText}
            onChange={(event) => patch({ questionText: event.target.value })}
            rows={3}
            disabled={readOnly}
            error={fieldErrors.questionText}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <SelectField
                label="Профессия"
                value={values.professionId}
                onValueChange={(professionId) => {
                  const selectedSkill = values.skillIds[0];
                  const skillExists =
                    selectedSkill &&
                    skills.some((skill) => skill.id === selectedSkill);
                  patch({
                    professionId,
                    skillIds: skillExists ? [selectedSkill] : [],
                  });
                }}
                options={professionOptions}
                placeholder="Выберите профессию"
              />
              {fieldErrors.professionId && (
                <p className="text-sm text-destructive">
                  {fieldErrors.professionId}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <SelectField
                label="Стек"
                value={selectedSkillId}
                onValueChange={(skillId) =>
                  patch({ skillIds: skillId ? [skillId] : [], topicId: '' })
                }
                options={skillOptions}
                placeholder={
                  skillOptions.length === 0
                    ? 'Сначала создайте стек'
                    : 'Выберите стек'
                }
              />
              {fieldErrors.skillIds && (
                <p className="text-sm text-destructive">{fieldErrors.skillIds}</p>
              )}
              {!readOnly && (
                <ShadcnButton
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-sm"
                  onClick={() => setSkillDialogOpen(true)}
                >
                  + Создать новый стек
                </ShadcnButton>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              label="Уровень"
              value={values.level}
              onValueChange={(level) =>
                patch({ level: level as QuestionEditorFormValues['level'] })
              }
              options={[
                { value: 'junior', label: 'Junior' },
                { value: 'middle', label: 'Middle' },
                { value: 'senior', label: 'Senior' },
                { value: 'lead', label: 'Lead' },
              ]}
            />
            <SelectField
              label="Сложность"
              value={values.difficulty}
              onValueChange={(difficulty) =>
                patch({
                  difficulty:
                    difficulty as QuestionEditorFormValues['difficulty'],
                })
              }
              options={[
                { value: 'basic', label: 'Базовый' },
                { value: 'intermediate', label: 'Средний' },
                { value: 'advanced', label: 'Продвинутый' },
              ]}
            />
          </div>

          <Textarea
            label="Краткий ответ"
            value={values.shortAnswer}
            onChange={(event) => patch({ shortAnswer: event.target.value })}
            rows={2}
            disabled={readOnly}
            error={fieldErrors.shortAnswer}
          />

          <Textarea
            label="Идеальный ответ"
            value={values.idealAnswer}
            onChange={(event) => patch({ idealAnswer: event.target.value })}
            rows={4}
            disabled={readOnly}
            error={fieldErrors.idealAnswer}
          />
        </div>
      </Card>

      <CompanySkillDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
      />

      <Card id="question-form-settings" className={sectionClassName}>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-foreground">
              Настройки компании
            </h3>
            <p className="text-sm text-muted-foreground">
              Статус публикации, приоритет в подборе и обязательность в интервью.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Статус"
              value={values.status}
              onValueChange={(status) =>
                patch({ status: status as QuestionEditorFormValues['status'] })
              }
              options={[
                { value: 'draft', label: 'Черновик' },
                { value: 'published', label: 'Опубликован' },
              ]}
            />
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  Приоритет компании
                </span>
                <Badge variant="secondary">{values.companyPriority}</Badge>
              </div>
              <Slider
                className="w-full py-2"
                min={0}
                max={10}
                step={1}
                value={[values.companyPriority]}
                onValueChange={(next) => {
                  const resolved = Array.isArray(next) ? next[0] : next;
                  patch({
                    companyPriority:
                      typeof resolved === 'number'
                        ? resolved
                        : DEFAULT_COMPANY_PRIORITY,
                  });
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                0 — без приоритета, 10 — максимальный boost при подборе вопросов
              </p>
            </div>
          </div>

          <CheckboxField
            label="Обязательный вопрос (всегда в интервью)"
            checked={values.isRequired}
            onCheckedChange={(isRequired) => patch({ isRequired })}
          />
        </div>
      </Card>

      <Card id="question-form-checkpoints" className={sectionClassName}>
        <CheckpointEditor
          checkpoints={values.checkpoints}
          onChange={(checkpoints) => patch({ checkpoints })}
          disabled={readOnly}
          fieldErrors={fieldErrors.checkpoints}
          weightError={fieldErrors.checkpointWeights}
        />
      </Card>

      <Card id="question-form-examples" className={sectionClassName}>
        <AnswerExamplesEditor
          examples={values.answerExamples}
          onChange={(answerExamples) => patch({ answerExamples })}
          disabled={readOnly}
        />
      </Card>

      <Separator />

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        {!readOnly && (
          <Button
            type="button"
            variant="primary"
            disabled={isSaving}
            onClick={() => void handleSubmit()}
          >
            {isSaving ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        )}
      </div>
    </fieldset>
  );
}
