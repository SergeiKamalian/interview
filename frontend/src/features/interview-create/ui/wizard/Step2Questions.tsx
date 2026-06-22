import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookMarked,
  LockIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useApplyPlaybookToInterviewDraftMutation,
  useCompanyQuestionPlaybooksQuery,
} from '@features/company-question-playbooks/api/companyQuestionPlaybookApi';
import { SavePlaybookDialog } from '@features/company-question-playbooks/ui/SavePlaybookDialog';
import {
  useQuestionBankQuery,
  useSuggestInterviewQuestionsMutation,
} from '@features/question-bank/api/questionBankApi';
import { sortQuestionsCompanyFirst } from '@features/interview-create/lib/sortQuestionsForWizard';
import {
  getQuestionPrimarySkill,
  groupQuestionsByPrimarySkill,
} from '@entities/question/lib/groupQuestionsBySkill';
import { sortQuestionsByTargetLevel } from '@entities/question/lib/sortQuestionsByTargetLevel';
import {
  buildForkReplacementIndex,
  isGlobalReplacedByCompanyFork,
} from '@entities/question/lib/forkReplacement';
import {
  difficultyBadgeVariant,
  difficultyLabel,
  levelBadgeVariant,
} from '@entities/question/lib/questionBadgeVariants';
import { QuestionScopeBadges } from '@entities/question/ui/QuestionBadges';
import type { QuestionListItem, QuestionScope } from '@entities/question/model/types';
import { CustomScopeBadge } from '@entities/question/ui/CustomScopeBadge';
import {
  COMPANY_QUESTIONS_FILTER_LABEL,
  PLATFORM_SCOPE_FILTER_LABEL,
} from '@entities/question/lib/questionScopeLabels';
import { toTopicSelectOptions } from '@entities/question/lib/customSelectOptions';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui';
import { cn } from '@shared/lib/utils';
import type { QuestionLevel } from '@shared/api/graphql/generated/graphql';
import { wizardQuestionPoolFilters } from '@features/interview-create/lib/wizardQuestionPool';
import type { WizardStepProps } from './types';

const ALL = 'all';

const SCOPE_TABS: Array<{ value: QuestionScope; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'company', label: COMPANY_QUESTIONS_FILTER_LABEL },
  { value: 'global', label: PLATFORM_SCOPE_FILTER_LABEL },
];

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

function matchesScope(item: QuestionListItem, scope: QuestionScope): boolean {
  if (scope === 'company') {
    return item.isCustom;
  }
  if (scope === 'global') {
    return !item.isCustom;
  }
  return true;
}

function QuestionMeta({
  question,
  hasCompanyFork,
}: {
  question: QuestionListItem;
  hasCompanyFork?: boolean;
}) {
  const weight = question.topic.interviewWeight;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <QuestionScopeBadges item={question} hasCompanyFork={hasCompanyFork} />
      <Badge variant="secondary">{question.topic.name}</Badge>
      <Badge variant={levelBadgeVariant(question.level)}>
        {question.level}
      </Badge>
      <Badge variant={difficultyBadgeVariant(question.difficulty)}>
        {difficultyLabel(question.difficulty)}
      </Badge>
      {weight != null && (
        <Badge variant="outline" className="font-mono">
          вес {weight}
        </Badge>
      )}
      {question.isCustom && question.companyPriority > 0 && (
        <Badge variant="outline" className="font-mono">
          приоритет {question.companyPriority}
        </Badge>
      )}
    </span>
  );
}

type QuestionRowProps = {
  question: QuestionListItem;
  checked: boolean;
  locked: boolean;
  highlighted?: boolean;
  hasCompanyFork?: boolean;
  onToggle: () => void;
};

function QuestionRow({
  question,
  checked,
  locked,
  highlighted,
  hasCompanyFork,
  onToggle,
}: QuestionRowProps) {
  return (
    <Label
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
        locked && 'cursor-default opacity-100',
        !locked && 'cursor-pointer',
        checked
          ? highlighted
            ? 'border-info/60 bg-info/10'
            : 'border-primary/50 bg-primary/10'
          : 'border-input hover:bg-accent/40',
      )}
    >
      <Checkbox
        checked={checked}
        disabled={locked}
        onCheckedChange={() => {
          if (!locked) {
            onToggle();
          }
        }}
        className="mt-0.5"
      />
      <span className="space-y-2">
        <span className="flex items-start gap-2">
          {locked && (
            <LockIcon
              className="mt-0.5 size-3.5 shrink-0 text-orange-500"
              aria-hidden
            />
          )}
          <span className="block text-sm leading-snug">
            {truncate(question.questionText)}
          </span>
        </span>
        <QuestionMeta question={question} hasCompanyFork={hasCompanyFork} />
      </span>
    </Label>
  );
}

export function Step2Questions({ data, update }: WizardStepProps) {
  const [scope, setScope] = useState<QuestionScope>('all');
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState(ALL);
  const [difficulty, setDifficulty] = useState(ALL);
  const [level, setLevel] = useState<string>(ALL);
  const [suggestSummary, setSuggestSummary] = useState<{
    custom: number;
    total: number;
  } | null>(null);
  const [highlightCustomIds, setHighlightCustomIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [playbookLockedIds, setPlaybookLockedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [savePlaybookOpen, setSavePlaybookOpen] = useState(false);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState(ALL);

  const { data: playbooks = [] } = useCompanyQuestionPlaybooksQuery(undefined, {
    skip: !data.professionId,
  });
  const [applyPlaybook, { isLoading: isApplyingPlaybook }] =
    useApplyPlaybookToInterviewDraftMutation();

  const { data: result, isFetching } = useQuestionBankQuery(
    data.professionId
      ? wizardQuestionPoolFilters(data.professionId)
      : undefined,
    { skip: !data.professionId },
  );
  const pool = useMemo(() => result?.items ?? [], [result]);

  const forkIndex = useMemo(() => buildForkReplacementIndex(pool), [pool]);

  const allById = useMemo(() => {
    const map = new Map<string, QuestionListItem>();
    for (const item of pool) {
      map.set(item.id, item);
    }
    return map;
  }, [pool]);

  const requiredQuestions = useMemo(
    () =>
      sortQuestionsCompanyFirst(
        pool.filter((item) => item.isRequired && item.isActive),
      ),
    [pool],
  );

  useEffect(() => {
    const requiredIds = requiredQuestions.map((item) => item.id);
    if (requiredIds.length === 0) {
      return;
    }
    const missing = requiredIds.filter((id) => !data.questionIds.includes(id));
    if (missing.length > 0) {
      update({ questionIds: [...data.questionIds, ...missing] });
    }
    // Pin required once pool is known; avoid re-running on every selection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredQuestions]);

  const selectedSkillIds = useMemo(
    () => new Set(data.skillIds),
    [data.skillIds],
  );

  const isSelectedSkillGroup = (skillId: string) => selectedSkillIds.has(skillId);

  const topicOptions = useMemo(() => {
    const scopedPool = pool.filter((item) => matchesScope(item, scope));
    const seen = new Map<string, { name: string; isCustom: boolean }>();
    for (const item of scopedPool) {
      seen.set(item.topic.id, {
        name: item.topic.name,
        isCustom: item.topic.isCustom ?? item.isCustom,
      });
    }
    return [
      { value: ALL, label: 'Все темы' },
      ...toTopicSelectOptions(
        [...seen.entries()]
          .map(([id, topic]) => ({
            id,
            name: topic.name,
            isCustom: topic.isCustom,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
      ),
    ];
  }, [pool, scope]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pool.filter((item) => {
      if (!matchesScope(item, scope)) {
        return false;
      }
      if (
        scope !== 'global' &&
        isGlobalReplacedByCompanyFork(item, forkIndex)
      ) {
        return false;
      }
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
  }, [pool, scope, search, level, difficulty, topicId, forkIndex]);

  const optionalFiltered = useMemo(
    () => filtered.filter((item) => !item.isRequired),
    [filtered],
  );

  const groups = useMemo(() => {
    const grouped = groupQuestionsByPrimarySkill(optionalFiltered).map(
      (group) => ({
        ...group,
        items: sortQuestionsByTargetLevel(
          sortQuestionsCompanyFirst(group.items),
          data.level as QuestionLevel,
        ),
      }),
    );
    return [...grouped].sort((left, right) => {
      const leftSel = isSelectedSkillGroup(left.skill.id) ? 0 : 1;
      const rightSel = isSelectedSkillGroup(right.skill.id) ? 0 : 1;
      if (leftSel !== rightSel) {
        return leftSel - rightSel;
      }
      const leftCustom = left.items.some((item) => item.isCustom) ? 0 : 1;
      const rightCustom = right.items.some((item) => item.isCustom) ? 0 : 1;
      return leftCustom - rightCustom;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionalFiltered, selectedSkillIds, data.level]);

  const [openSkills, setOpenSkills] = useState<string[]>([]);

  const isLocked = (id: string) =>
    allById.get(id)?.isRequired === true || playbookLockedIds.has(id);

  const toggle = (id: string) => {
    if (isLocked(id)) {
      return;
    }
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
    setPlaybookLockedIds(new Set());
    setSelectedPlaybookId(ALL);
    const payload = await suggest({
      professionId: data.professionId,
      skillIds: data.skillIds.length > 0 ? data.skillIds : undefined,
      level: data.level,
      count: 10,
    }).unwrap();

    const customIds = new Set(
      (payload.questions ?? [])
        .filter((item) => item.isCustom)
        .map((item) => item.id),
    );
    for (const id of payload.questionIds) {
      if (allById.get(id)?.isCustom) {
        customIds.add(id);
      }
    }

    update({ questionIds: payload.questionIds });
    const customCount = customIds.size;
    setSuggestSummary({ custom: customCount, total: payload.count });
    setHighlightCustomIds(customIds);

    toast.success('Набор подобран через AI', {
      description: `${customCount} из ${payload.count} — ваши вопросы`,
    });
  };

  const selectedCountByGroup = (items: QuestionListItem[]) =>
    items.filter((item) => data.questionIds.includes(item.id)).length;

  const selectedCustomCount = useMemo(
    () =>
      data.questionIds.filter((id) => allById.get(id)?.isCustom).length,
    [data.questionIds, allById],
  );

  const playbookOptions = useMemo(() => {
    const filtered = playbooks.filter(
      (playbook) =>
        playbook.professionId === data.professionId &&
        playbook.level === data.level,
    );
    return [
      { value: ALL, label: 'Не применять' },
      ...filtered.map((playbook) => ({
        value: playbook.id,
        label: `${playbook.name} (${playbook.pinnedCount} закр.)`,
      })),
    ];
  }, [playbooks, data.professionId, data.level]);

  const handleApplyPlaybook = async (playbookId: string) => {
    if (playbookId === ALL) {
      setSelectedPlaybookId(ALL);
      setPlaybookLockedIds(new Set());
      return;
    }
    if (!data.professionId) {
      return;
    }

    try {
      const result = await applyPlaybook({
        playbookId,
        count: 10,
      }).unwrap();
      setSelectedPlaybookId(playbookId);
      setPlaybookLockedIds(new Set(result.pinnedQuestionIds));
      update({ questionIds: result.questionIds });
      setSuggestSummary(null);
      setHighlightCustomIds(new Set());
      toast.success('Набор применён', {
        description: `${result.pinnedQuestionIds.length} закреплено + ${result.count - result.pinnedQuestionIds.length} доп.`,
      });
    } catch {
      toast.error('Не удалось применить набор');
      setSelectedPlaybookId(ALL);
    }
  };

  const requiredSelectedIds = useMemo(
    () =>
      data.questionIds.filter(
        (id) => allById.get(id)?.isRequired === true,
      ),
    [data.questionIds, allById],
  );

  const playbookSelectedIds = useMemo(
    () => data.questionIds.filter((id) => playbookLockedIds.has(id)),
    [data.questionIds, playbookLockedIds],
  );

  const optionalSelectedIds = useMemo(
    () =>
      data.questionIds.filter(
        (id) => !allById.get(id)?.isRequired && !playbookLockedIds.has(id),
      ),
    [data.questionIds, allById, playbookLockedIds],
  );

  const renderQuestionBank = () => {
    if (isFetching) {
      return (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      );
    }

    const visibleRequired = requiredQuestions.filter((item) =>
      matchesScope(item, scope),
    );
    const hasOptional = groups.length > 0;

    if (visibleRequired.length === 0 && !hasOptional) {
      return (
        <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Нет вопросов под фильтры.
        </p>
      );
    }

    return (
      <ScrollArea className="h-[32rem] rounded-lg border border-border p-2">
        <div className="space-y-4">
          {visibleRequired.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Label className="text-sm font-semibold text-foreground">
                  Обязательные
                </Label>
                <Badge variant="orange">{visibleRequired.length}</Badge>
              </div>
              <ul className="space-y-2">
                {visibleRequired.map((question) => (
                  <li key={question.id}>
                    <QuestionRow
                      question={question}
                      checked
                      locked
                      hasCompanyFork={forkIndex.replacedGlobalIds.has(
                        question.id,
                      )}
                      onToggle={() => undefined}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasOptional && (
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
                        {group.skill.isCustom ? <CustomScopeBadge /> : null}
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
                              <QuestionRow
                                question={question}
                                checked={checked}
                                locked={false}
                                highlighted={
                                  checked &&
                                  highlightCustomIds.has(question.id)
                                }
                                hasCompanyFork={forkIndex.replacedGlobalIds.has(
                                  question.id,
                                )}
                                onToggle={() => toggle(question.id)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="max-w-md space-y-1">
          <p className="text-sm font-medium text-foreground">
            Соберите набор вопросов
          </p>
          <p className="text-xs text-muted-foreground">
            Все вопросы банка по профессии; ваши и обязательные выделены и идут
            первыми. Вопросы сгруппированы по стеку; стеки с шага «Вакансия» идут
            первыми.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {playbookOptions.length > 1 && (
            <SelectField
              label="Применить набор"
              value={selectedPlaybookId}
              onValueChange={(value) => {
                if (!isApplyingPlaybook && data.professionId) {
                  void handleApplyPlaybook(value);
                }
              }}
              options={playbookOptions}
            />
          )}
          <Button
            variant="secondary"
            disabled={!data.professionId || data.questionIds.length === 0}
            onClick={() => setSavePlaybookOpen(true)}
          >
            <BookMarked className="size-4" />
            Сохранить набор
          </Button>
          <Button
            onClick={() => void handleSuggest()}
            loading={isSuggesting}
            disabled={!data.professionId}
            title={
              data.professionId
                ? 'AI подберёт вопросы из банка с приоритетом ваших.'
                : 'Сначала выберите профессию на шаге «Вакансия».'
            }
          >
            <SparklesIcon className="size-4" />
            Подобрать через AI
          </Button>
        </div>
      </div>

      {suggestSummary && suggestSummary.custom > 0 && (
        <Alert variant="info" title="AI-подбор завершён">
          {suggestSummary.custom} из {suggestSummary.total} — ваши вопросы
        </Alert>
      )}

      {suggestError && (
        <Alert variant="error" title="AI-подбор не удался">
          Не удалось сгенерировать вопросы. Выберите вручную или повторите позже.
        </Alert>
      )}

      <Tabs
        value={scope}
        onValueChange={(value) => {
          setScope(value as QuestionScope);
          setTopicId(ALL);
        }}
      >
        <TabsList>
          {SCOPE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SCOPE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-3">
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
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Банк вопросов по стекам
          </Label>
          {renderQuestionBank()}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-sm font-semibold text-foreground">
              Выбранные вопросы
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {selectedCustomCount > 0 && (
                <Badge variant="info">
                  {selectedCustomCount} ваших
                </Badge>
              )}
              <Badge variant={data.questionIds.length > 0 ? 'success' : 'muted'}>
                {data.questionIds.length} в интервью
              </Badge>
            </div>
          </div>

          {data.questionIds.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Отметьте вопросы слева или нажмите «Подобрать через AI».
            </p>
          ) : (
            <ScrollArea className="h-[32rem] rounded-lg border border-border p-2">
              <div className="space-y-4">
                {requiredSelectedIds.length > 0 && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Обязательные
                      </Label>
                      <LockIcon className="size-3 text-orange-500" />
                    </div>
                    <ul className="space-y-2">
                      {requiredSelectedIds.map((id) => {
                        const question = allById.get(id);
                        const skill = question
                          ? getQuestionPrimarySkill(question)
                          : null;
                        return (
                          <li
                            key={id}
                            className="flex items-start justify-between gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2.5"
                          >
                            <span className="space-y-2">
                              <span className="block text-sm leading-snug">
                                {question
                                  ? truncate(question.questionText, 80)
                                  : `Вопрос ${id}`}
                              </span>
                              <span className="flex flex-wrap items-center gap-1.5">
                                {question && (
                                  <QuestionScopeBadges
                                    item={question}
                                    hasCompanyFork={forkIndex.replacedGlobalIds.has(
                                      question.id,
                                    )}
                                  />
                                )}
                                {skill && (
                                  <Badge variant="secondary">{skill.name}</Badge>
                                )}
                              </span>
                            </span>
                            <LockIcon
                              className="size-4 shrink-0 text-orange-500"
                              aria-label="Обязательный вопрос"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {playbookSelectedIds.length > 0 && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Закреплено из набора
                      </Label>
                      <BookMarked className="size-3 text-primary" />
                    </div>
                    <ul className="space-y-2">
                      {playbookSelectedIds.map((id) => {
                        const question = allById.get(id);
                        const skill = question
                          ? getQuestionPrimarySkill(question)
                          : null;
                        return (
                          <li
                            key={id}
                            className="flex items-start justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5"
                          >
                            <span className="space-y-2">
                              <span className="block text-sm leading-snug">
                                {question
                                  ? truncate(question.questionText, 80)
                                  : `Вопрос ${id}`}
                              </span>
                              <span className="flex flex-wrap items-center gap-1.5">
                                {question && (
                                  <QuestionScopeBadges
                                    item={question}
                                    hasCompanyFork={forkIndex.replacedGlobalIds.has(
                                      question.id,
                                    )}
                                  />
                                )}
                                {skill && (
                                  <Badge variant="secondary">{skill.name}</Badge>
                                )}
                              </span>
                            </span>
                            <LockIcon
                              className="size-4 shrink-0 text-primary"
                              aria-label="Закреплённый вопрос из набора"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {optionalSelectedIds.length > 0 && (
                  <section className="space-y-2">
                    {(requiredSelectedIds.length > 0 ||
                      playbookSelectedIds.length > 0) && (
                      <Label className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Дополнительные
                      </Label>
                    )}
                    <ul className="space-y-2">
                      {optionalSelectedIds.map((id) => {
                        const question = allById.get(id);
                        const skill = question
                          ? getQuestionPrimarySkill(question)
                          : null;
                        const index = data.questionIds.indexOf(id);
                        const highlighted = highlightCustomIds.has(id);
                        return (
                          <li
                            key={id}
                            className={cn(
                              'flex items-start justify-between gap-2 rounded-lg border bg-card px-3 py-2.5',
                              highlighted
                                ? 'border-info/60 bg-info/5'
                                : 'border-border',
                            )}
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
                                {question && (
                                  <QuestionScopeBadges
                                    item={question}
                                    hasCompanyFork={forkIndex.replacedGlobalIds.has(
                                      question.id,
                                    )}
                                  />
                                )}
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
                                disabled={
                                  index === data.questionIds.length - 1
                                }
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
                  </section>
                )}
              </div>
            </ScrollArea>
          )}
        </section>
      </div>

      <SavePlaybookDialog
        open={savePlaybookOpen}
        onOpenChange={setSavePlaybookOpen}
        professionId={data.professionId}
        level={data.level}
        skillIds={data.skillIds}
        questionIds={data.questionIds}
        questionsById={allById}
      />
    </div>
  );
}
