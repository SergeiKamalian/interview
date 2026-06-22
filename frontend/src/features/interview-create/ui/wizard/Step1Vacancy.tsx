import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';
import {
  deriveWizardSkillsFromPool,
  wizardQuestionPoolFilters,
} from '@features/interview-create/lib/wizardQuestionPool';
import {
  useProfessionsQuery,
  useQuestionBankQuery,
} from '@features/question-bank/api/questionBankApi';
import { Input, SelectField, Textarea, Label, Badge, Spinner } from '@shared/ui';
import { cn } from '@shared/lib/utils';
import type { QuestionLevel } from '@shared/api/graphql/generated/graphql';
import { INTERVIEW_LANGUAGE_SELECT_OPTIONS } from '@entities/interview/lib/interviewLanguage';
import type { WizardStepProps } from './types';
import { TalentPoolMatches } from './TalentPoolMatches';

const LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

// Rotating accent palette so selected skills read as distinct, colorful chips.
const SELECTED_BADGE_VARIANTS = [
  'info',
  'success',
  'warning',
  'orange',
  'yellow',
] as const;

export function Step1Vacancy({ data, update }: WizardStepProps) {
  const { data: professions = [], isLoading: professionsLoading } =
    useProfessionsQuery();
  const { data: questionBankResult, isFetching: skillsLoading } =
    useQuestionBankQuery(
      data.professionId
        ? wizardQuestionPoolFilters(data.professionId)
        : undefined,
      { skip: !data.professionId },
    );

  const skills = deriveWizardSkillsFromPool(questionBankResult?.items ?? []);

  const handleProfessionChange = (value: string) => {
    // Profession drives the relevant skill list; reset skills that no longer apply.
    update({ professionId: value, skillIds: [] });
  };

  const toggleSkill = (skillId: string) => {
    const next = data.skillIds.includes(skillId)
      ? data.skillIds.filter((id) => id !== skillId)
      : [...data.skillIds, skillId];
    update({ skillIds: next });
  };

  const professionOptions = [
    { value: '', label: 'Не выбрано' },
    ...professions.map((profession) => ({
      value: profession.id,
      label: profession.name,
    })),
  ];

  const selectedSkills = skills.filter((skill) =>
    data.skillIds.includes(skill.id),
  );

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">Основное</h4>
          <p className="text-xs text-muted-foreground">
            Как называется интервью и под какую роль/уровень оно настраивается.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Название интервью"
            value={data.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Frontend React — Middle"
          />
          <Input
            label="Роль / должность"
            value={data.jobRole}
            onChange={(event) => update({ jobRole: event.target.value })}
            placeholder="Frontend Developer"
          />
          <SelectField
            label="Профессия"
            value={data.professionId}
            onValueChange={handleProfessionChange}
            options={professionOptions}
            placeholder={
              professionsLoading ? 'Загрузка…' : 'Выберите профессию'
            }
          />
          <SelectField
            label="Уровень кандидата"
            value={data.level}
            onValueChange={(value) => update({ level: value as QuestionLevel })}
            options={LEVEL_OPTIONS}
          />
          <SelectField
            label="Язык интервью"
            value={data.interviewLanguage}
            onValueChange={(value) => update({ interviewLanguage: value })}
            options={INTERVIEW_LANGUAGE_SELECT_OPTIONS}
          />
        </div>
      </section>

      <TalentPoolMatches
        level={data.level}
        professionId={data.professionId}
        skillIds={data.skillIds}
      />

      <section className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-foreground">
            Навыки / стек
            {data.professionId ? ' — релевантные профессии' : ''}
          </Label>
          <p className="text-xs text-muted-foreground">
            Стеки совпадают с шагом «Вопросы». Выбранные поднимут связанные
            вопросы наверх.
          </p>
        </div>

        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <span className="text-xs font-medium text-muted-foreground">
              Выбрано ({selectedSkills.length}):
            </span>
            {selectedSkills.map((skill, index) => (
              <Badge
                key={skill.id}
                variant={
                  SELECTED_BADGE_VARIANTS[index % SELECTED_BADGE_VARIANTS.length]
                }
                className="gap-1 pr-1"
              >
                {skill.name}
                <button
                  type="button"
                  aria-label={`Убрать ${skill.name}`}
                  onClick={() => toggleSkill(skill.id)}
                  className="rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/15"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {skillsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка навыков…
          </div>
        ) : skills.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            {data.professionId
              ? 'Для этой профессии в банке пока нет вопросов — стеки появятся после добавления вопросов.'
              : 'Сначала выберите профессию, чтобы увидеть стеки из банка вопросов.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const selected = data.skillIds.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-input bg-background text-foreground hover:border-primary/50 hover:bg-accent/50',
                  )}
                >
                  {selected ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <PlusIcon className="size-3.5 text-muted-foreground" />
                  )}
                  {skill.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <Textarea
          label="Описание вакансии (опционально)"
          value={data.jobDescription}
          onChange={(event) => update({ jobDescription: event.target.value })}
          placeholder="Кратко опишите требования к кандидату…"
          rows={4}
        />
      </section>
    </div>
  );
}
