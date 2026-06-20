import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import {
  useQuestionBankQuery,
  useSuggestInterviewQuestionsMutation,
} from '@features/question-bank/api/questionBankApi';
import {
  getQuestionPrimarySkill,
  groupQuestionsByPrimarySkill,
} from '@entities/question/lib/groupQuestionsBySkill';
import {
  difficultyBadgeVariant,
  difficultyLabel,
  levelBadgeVariant,
} from '@entities/question/lib/questionBadgeVariants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  SearchableSelectField,
  SelectField,
  Spinner,
  ScrollArea,
} from '@shared/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui/tooltip';
import { cn } from '@shared/lib/utils';
import type { QuestionListItem } from '@entities/question/model/types';
import type { WizardStepProps } from './types';

const ALL = 'all';

const DIFFICULTY_OPTIONS = [
  { value: ALL, label: 'Вся сложность' },
  { value: 'basic', label: 'Базовый' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
];

const LEVEL_OPTIONS = [
  { value: ALL, label: 'Все уровни' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

function truncate(text: string, max = 110): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function QuestionMeta({ question }: { question: QuestionListItem }) {
  const weight = question.topic.interviewWeight;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary">{question.topic.name}</Badge>
      <Badge variant={levelBadgeVariant(question.level)}>
        {question.level}
      </Badge>
      <Badge variant={difficultyBadgeVariant(question.difficulty)}>
        {difficultyLabel(question.difficulty)}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Badge variant="outline" className="font-mono">
                max {question.maxScore}
                {weight != null ? ` · вес ${weight}` : ''}
              </Badge>
            }
          />
          <TooltipContent>
            maxScore — максимум за вопрос; вес — interviewWeight темы (влияет на
            итоговую оценку).
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

export function Step2Questions({ data, update }: WizardStepProps) {
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState(ALL);
  const [difficulty, setDifficulty] = useState(ALL);
  const [level, setLevel] = useState<string>(ALL);

  const { data: result, isFetching } = useQuestionBankQuery({
    professionId: data.professionId || undefined,
    limit: 1000,
    offset: 0,
  });
  const pool = useMemo(() => result?.items ?? [], [result]);

  const allById = useMemo(() => {
    const map = new Map<string, QuestionListItem>();
    for (const item of pool) {
      map.set(item.id, item);
    }
    return map;
  }, [pool]);

  const selectedSkillIds = useMemo(
    () => new Set(data.skillIds),
    [data.skillIds],
  );

  // A group "matches" step-1 selection if its primary skill was picked there.
  const isSelectedSkillGroup = (skillId: string) => selectedSkillIds.has(skillId);

  const topicOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of pool) {
      seen.set(item.topic.id, item.topic.name);
    }
    return [
      { value: ALL, label: 'Все темы' },
      ...[...seen.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
    ];
  }, [pool]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pool.filter((item) => {
      if (level !== ALL && item.level !== level) {
        return false;
      }
      if (difficulty !== ALL && item.difficulty !== difficulty) {
        return false;
      }
      if (topicId !== ALL && item.topic.id !== topicId) {
        return false;
      }
      if (term && !item.questionText.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [pool, search, level, difficulty, topicId]);

  // Group by skill, then float skill groups selected on step 1 to the top.
  const groups = useMemo(() => {
    const grouped = groupQuestionsByPrimarySkill(filtered);
    return [...grouped].sort((left, right) => {
      const leftSel = isSelectedSkillGroup(left.skill.id) ? 0 : 1;
      const rightSel = isSelectedSkillGroup(right.skill.id) ? 0 : 1;
      return leftSel - rightSel;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedSkillIds]);

  // Seed accordion open-state once data loads: selected skill groups open first.
  const [openSkills, setOpenSkills] = useState<string[]>([]);
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || groups.length === 0) {
      return;
    }
    const selectedOpen = groups
      .filter((group) => isSelectedSkillGroup(group.skill.id))
      .map((group) => group.skill.code);
    setOpenSkills(
      selectedOpen.length > 0 ? selectedOpen : [groups[0].skill.code],
    );
    seededRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const toggle = (id: string) => {
    const next = data.questionIds.includes(id)
      ? data.questionIds.filter((value) => value !== id)
      : [...data.questionIds, id];
    update({ questionIds: next });
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= data.questionIds.length) {
      return;
    }
    const next = [...data.questionIds];
    [next[index], next[target]] = [next[target], next[index]];
    update({ questionIds: next });
  };

  const [suggest, { isLoading: isSuggesting, error: suggestError }] =
    useSuggestInterviewQuestionsMutation();

  const handleSuggest = async () => {
    if (!data.professionId) {
      return;
    }
    const payload = await suggest({
      professionId: data.professionId,
      skillIds: data.skillIds.length > 0 ? data.skillIds : undefined,
      level: data.level,
      count: 10,
    }).unwrap();
    update({ questionIds: payload.questionIds });
  };

  const selectedCountByGroup = (items: QuestionListItem[]) =>
    items.filter((item) => data.questionIds.includes(item.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="max-w-md space-y-1">
          <p className="text-sm font-medium text-foreground">
            Соберите набор вопросов
          </p>
          <p className="text-xs text-muted-foreground">
            Вопросы сгруппированы по стеку. Стеки, выбранные на шаге «Вакансия»,
            идут первыми и раскрыты. Или дайте AI подобрать набор из банка.
          </p>
        </div>
        <Button
          onClick={() => void handleSuggest()}
          loading={isSuggesting}
          disabled={!data.professionId}
          title={
            data.professionId
              ? 'AI подберёт вопросы из банка по профессии/навыкам/уровню. Преселект редактируемый.'
              : 'Сначала выберите профессию на шаге «Вакансия».'
          }
        >
          <SparklesIcon className="size-4" />
          Подобрать через AI
        </Button>
      </div>

      {suggestError && (
        <Alert variant="error" title="AI-подбор не удался">
          Не удалось сгенерировать вопросы. Выберите вручную или повторите позже.
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <Input
          label="Поиск"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Текст вопроса…"
        />
        <SearchableSelectField
          label="Тема"
          value={topicId}
          onValueChange={setTopicId}
          options={topicOptions}
          searchPlaceholder="Найти тему…"
        />
        <SelectField
          label="Сложность"
          value={difficulty}
          onValueChange={setDifficulty}
          options={DIFFICULTY_OPTIONS}
        />
        <SelectField
          label="Уровень"
          value={level}
          onValueChange={setLevel}
          options={LEVEL_OPTIONS}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Банк вопросов по стекам
          </Label>
          {isFetching ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : groups.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Нет вопросов под фильтры.
            </p>
          ) : (
            <ScrollArea className="h-[32rem] rounded-lg border border-border p-2">
              <Accordion
                multiple
                value={openSkills}
                onValueChange={setOpenSkills}
                className="space-y-2"
              >
                {groups.map((group) => {
                  const isSelectedGroup = isSelectedSkillGroup(group.skill.id);
                  const selectedInGroup = selectedCountByGroup(group.items);
                  return (
                    <AccordionItem
                      key={group.skill.code}
                      value={group.skill.code}
                      className={cn(
                        'overflow-hidden rounded-lg border bg-card px-1',
                        isSelectedGroup
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border',
                      )}
                    >
                      <AccordionTrigger className="px-3 hover:no-underline">
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {group.skill.name}
                          </span>
                          {isSelectedGroup && (
                            <Badge variant="info">по навыку</Badge>
                          )}
                        </span>
                        <span className="mr-2 flex items-center gap-1.5">
                          {selectedInGroup > 0 && (
                            <Badge variant="success">
                              {selectedInGroup} выбрано
                            </Badge>
                          )}
                          <Badge variant="muted">{group.items.length}</Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-2">
                        <ul className="space-y-2">
                          {group.items.map((question) => {
                            const checked = data.questionIds.includes(
                              question.id,
                            );
                            return (
                              <li key={question.id}>
                                <Label
                                  className={cn(
                                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                                    checked
                                      ? 'border-primary/50 bg-primary/10'
                                      : 'border-input hover:bg-accent/40',
                                  )}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => toggle(question.id)}
                                    className="mt-0.5"
                                  />
                                  <span className="space-y-2">
                                    <span className="block text-sm leading-snug">
                                      {truncate(question.questionText)}
                                    </span>
                                    <QuestionMeta question={question} />
                                  </span>
                                </Label>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">
              Выбранные вопросы
            </Label>
            <Badge variant={data.questionIds.length > 0 ? 'success' : 'muted'}>
              {data.questionIds.length} в интервью
            </Badge>
          </div>
          {data.questionIds.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Отметьте вопросы слева или нажмите «Подобрать через AI».
            </p>
          ) : (
            <ScrollArea className="h-[32rem] rounded-lg border border-border p-2">
              <ul className="space-y-2">
                {data.questionIds.map((id, index) => {
                  const question = allById.get(id);
                  const skill = question
                    ? getQuestionPrimarySkill(question)
                    : null;
                  return (
                    <li
                      key={id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <span className="space-y-2">
                        <span className="flex items-baseline gap-2 text-sm">
                          <span className="font-mono text-xs text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span className="leading-snug">
                            {question
                              ? truncate(question.questionText, 80)
                              : `Вопрос ${id}`}
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-1.5 pl-5">
                          {skill && (
                            <Badge variant="secondary">{skill.name}</Badge>
                          )}
                          {question && (
                            <Badge
                              variant={difficultyBadgeVariant(
                                question.difficulty,
                              )}
                            >
                              {difficultyLabel(question.difficulty)}
                            </Badge>
                          )}
                        </span>
                      </span>
                      <span className="flex shrink-0 gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label="Вверх"
                        >
                          <ArrowUpIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, 1)}
                          disabled={index === data.questionIds.length - 1}
                          aria-label="Вниз"
                        >
                          <ArrowDownIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggle(id)}
                          aria-label="Убрать"
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </section>
      </div>
    </div>
  );
}
