import { useMemo, useState } from 'react';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompanyQuestionImportDialog } from '@features/company-question-import/ui/CompanyQuestionImportDialog';
import { CompanyQuestionPlaybooksSection } from '@features/company-question-playbooks/ui/CompanyQuestionPlaybooksSection';
import { CompanySkillDialog } from '@features/company-question-bank/ui/CompanySkillDialog';
import {
  useQuestionBankListQuery,
  useSkillsQuery,
} from '@features/question-bank/api/questionBankApi';
import type { QuestionScope, QuestionStatus } from '@entities/question/model/types';
import {
  EMPTY_QUESTION_BANK_FILTERS,
  filterQuestionBankItems,
  hasActiveQuestionBankFilters,
  type QuestionBankClientFilters,
} from '@entities/question/lib/filterQuestionBankItems';
import { QuestionBankFiltersBar } from '@widgets/question-bank/QuestionBankFiltersBar';
import { QuestionBankSkillAccordion } from '@widgets/question-bank/QuestionBankSkillAccordion';
import { cn } from '@shared/lib/utils';
import {
  COMPANY_SCOPE_FILTER_LABEL,
  PLATFORM_SCOPE_FILTER_LABEL,
} from '@entities/question/lib/questionScopeLabels';
import {
  Alert,
  Button,
  Card,
  PAGE_SECTION_NAV_LAYOUT,
  PageSectionNav,
  SelectField,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui';
import { Button as ShadcnButton } from '@shared/ui/button';

type ScopeTab = QuestionScope;
type StatusFilter = 'published' | 'draft' | 'all';

const scopeTabs: Array<{ value: ScopeTab; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'company', label: COMPANY_SCOPE_FILTER_LABEL },
  { value: 'global', label: PLATFORM_SCOPE_FILTER_LABEL },
];

const statusOptions = [
  { value: 'published', label: 'Опубликованные' },
  { value: 'draft', label: 'Черновики' },
  { value: 'all', label: 'Все статусы' },
];

const QUESTION_BANK_SECTIONS = [
  { id: 'qb-playbooks', label: 'Плейбуки' },
  { id: 'qb-questions', label: 'Вопросы' },
] as const;

const { sectionClassName, pageClassName } = PAGE_SECTION_NAV_LAYOUT;

export function QuestionBankPage() {
  const [scope, setScope] = useState<ScopeTab>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('published');
  const [importOpen, setImportOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [filters, setFilters] = useState<QuestionBankClientFilters>(
    EMPTY_QUESTION_BANK_FILTERS,
  );

  const serverFilters = useMemo(
    () => ({
      scope: scope === 'all' ? undefined : scope,
      status:
        statusFilter === 'all'
          ? undefined
          : (statusFilter as QuestionStatus),
    }),
    [scope, statusFilter],
  );

  const { data, isLoading, isError, error, refetch } =
    useQuestionBankListQuery(serverFilters);
  const { data: allSkills = [] } = useSkillsQuery();

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const filteredCount = useMemo(
    () => filterQuestionBankItems(items, filters).length,
    [items, filters],
  );
  const emptyCustomSkillCount = useMemo(
    () => allSkills.filter((skill) => skill.isCustom).length,
    [allSkills],
  );
  const showSkillAccordion =
    !isLoading && !isError && (filteredCount > 0 || emptyCustomSkillCount > 0);

  return (
    <div className={cn('space-y-4', pageClassName)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Банк вопросов
          </h2>
          <p className="text-sm text-muted-foreground">
            Платформенные и ваши вопросы — по стекам, с red/green flags и
            приоритетом при подборе.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void refetch()}>
            Обновить
          </Button>
          <ShadcnButton variant="secondary" onClick={() => setSkillDialogOpen(true)}>
            <Plus className="size-4" />
            Создать стек
          </ShadcnButton>
          <ShadcnButton
            variant="secondary"
            onClick={() => setImportOpen(true)}
          >
            <FileSpreadsheet className="size-4" />
            Импорт из Excel
          </ShadcnButton>
          <ShadcnButton variant="default" render={<Link to="/dashboard/question-bank/new" />}>
            Создать вопрос
          </ShadcnButton>
        </div>
      </div>

      <CompanySkillDialog
        open={skillDialogOpen}
        onOpenChange={setSkillDialogOpen}
      />

      <CompanyQuestionImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onViewDrafts={() => {
          setScope('company');
          setStatusFilter('draft');
        }}
      />

      <div id="qb-playbooks" className={sectionClassName}>
        <CompanyQuestionPlaybooksSection />
      </div>

      <Card id="qb-questions" className={sectionClassName}>
        <Tabs
          value={scope}
          onValueChange={(value) => setScope(value as ScopeTab)}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              {scopeTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="w-full max-w-xs">
              <SelectField
                label="Статус"
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
                options={statusOptions}
              />
            </div>
          </div>

          {scopeTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              <QuestionBankFiltersBar
                filters={filters}
                onChange={setFilters}
                onRefresh={() => void refetch()}
                onReset={() => setFilters(EMPTY_QUESTION_BANK_FILTERS)}
                showReset={hasActiveQuestionBankFilters(filters)}
              />

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  Загрузка вопросов…
                </div>
              )}

              {isError && (
                <Alert variant="error" title="Не удалось загрузить банк вопросов">
                  {'message' in (error as object)
                    ? String((error as { message: string }).message)
                    : 'Неизвестная ошибка'}
                </Alert>
              )}

              {!isLoading && !isError && filteredCount === 0 && emptyCustomSkillCount === 0 && (
                <Alert variant="info" title="Ничего не найдено">
                  {items.length === 0
                    ? 'Вопросов пока нет — создайте свой вопрос или измените фильтры.'
                    : 'Нет вопросов по текущим фильтрам.'}
                </Alert>
              )}

              {showSkillAccordion && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {filteredCount > 0
                      ? `Показано ${filteredCount} из ${data?.total ?? items.length} вопросов · сгруппировано по стекам`
                      : 'Ваши стеки без вопросов — создайте первый вопрос в нужном стеке'}
                  </p>
                  <QuestionBankSkillAccordion
                    items={items}
                    filters={filters}
                    allSkills={allSkills}
                  />
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      <PageSectionNav sections={QUESTION_BANK_SECTIONS} />
    </div>
  );
}
