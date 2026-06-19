import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileTextIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';

import {
  useCompanyInterviewTemplatesQuery,
  useCreateInterviewFromTemplateMutation,
} from '@entities/interview-template/api/interviewTemplatesApi';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { Badge, SelectField, Spinner } from '@shared/ui';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';

type LevelFilter = 'all' | 'junior' | 'middle' | 'senior' | 'lead';

type CreateInterviewStartButtonProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'size'
> & {
  children?: ReactNode;
  label?: string;
  size?: 'default' | 'sm';
};

const levelOptions = [
  { value: 'all', label: 'Все уровни' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }

  return 'Не удалось выполнить действие. Попробуйте ещё раз.';
}

export function CreateInterviewStartButton({
  label = 'Создать интервью',
  size = 'default',
  children,
  ...buttonProps
}: CreateInterviewStartButtonProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters = useMemo(
    () => ({
      page: 1,
      pageSize: 10,
      search: debouncedSearch.trim() || undefined,
      level: level === 'all' ? undefined : level,
    }),
    [debouncedSearch, level],
  );

  const { data, isFetching, isError, error, refetch } =
    useCompanyInterviewTemplatesQuery(filters, {
      refetchOnMountOrArgChange: true,
      skip: !isOpen,
    });
  const [
    createInterviewFromTemplate,
    { isLoading: isCreating, error: createError },
  ] = useCreateInterviewFromTemplateMutation();

  const templates = data?.items ?? [];
  const hasFilters = Boolean(debouncedSearch.trim()) || level !== 'all';

  const openModal = () => {
    setSearch('');
    setLevel('all');
    setSelectedTemplateId(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSearch('');
    setLevel('all');
    setSelectedTemplateId(null);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleManualCreate = () => {
    closeModal();
    navigate('/dashboard/interviews/create');
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    const interview = await createInterviewFromTemplate(templateId).unwrap();
    closeModal();
    navigate(`/dashboard/interviews/${interview.id}`);
  };

  return (
    <>
      <Button size={size} onClick={openModal} {...buttonProps}>
        {children ?? (
          <>
            <PlusIcon className="size-3.5" />
            {label}
          </>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Закрыть выбор способа создания интервью"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            type="button"
            onClick={closeModal}
          />
          <section
            aria-modal="true"
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4 border-b p-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Создать интервью
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Выберите готовый template или начните настройку с нуля.
                </p>
              </div>
              <Button
                aria-label="Закрыть"
                size="icon-sm"
                variant="ghost"
                onClick={closeModal}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="grid gap-4 overflow-y-auto p-5 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                  <label className="space-y-1.5 text-sm font-medium">
                    <span>Поиск template</span>
                    <span className="relative block">
                      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="Frontend, Middle, React..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </span>
                  </label>
                  <SelectField
                    label="Уровень"
                    value={level}
                    onValueChange={(value) => setLevel(value as LevelFilter)}
                    options={levelOptions}
                  />
                </div>

                <div className="space-y-2">
                  {isFetching && (
                    <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                      <Spinner />
                      Загружаю templates...
                    </div>
                  )}

                  {!isFetching && isError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                      <p className="font-medium text-destructive">
                        Не удалось загрузить templates
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {getApiErrorMessage(error)}
                      </p>
                      <Button
                        className="mt-3"
                        size="sm"
                        variant="outline"
                        onClick={() => void refetch()}
                      >
                        Повторить
                      </Button>
                    </div>
                  )}

                  {!isFetching && !isError && templates.length === 0 && (
                    <div className="rounded-xl border bg-muted/30 p-5 text-sm">
                      <p className="font-medium text-foreground">
                        {hasFilters
                          ? 'По этим фильтрам templates не найдены'
                          : 'Templates пока нет'}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Создайте интервью с нуля. Сохранение текущего интервью как
                        template будет добавлено следующим шагом.
                      </p>
                    </div>
                  )}

                  {!isFetching &&
                    templates.map((template) => {
                      const isCurrentCreating =
                        selectedTemplateId === template.id && isCreating;

                      return (
                        <article
                          key={template.id}
                          className="rounded-xl border bg-card p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate font-medium text-foreground">
                                {template.title}
                              </h4>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {template.jobRole}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={isCreating}
                              onClick={() =>
                                void handleCreateFromTemplate(template.id)
                              }
                            >
                              {isCurrentCreating && (
                                <Loader2Icon className="size-3.5 animate-spin" />
                              )}
                              Из шаблона
                            </Button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="secondary">{template.level}</Badge>
                            <Badge variant="outline">
                              {template.questionCount} вопросов
                            </Badge>
                            <Badge variant="outline">
                              {template.interviewLanguage}
                            </Badge>
                          </div>
                        </article>
                      );
                    })}

                  {createError && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                      {getApiErrorMessage(createError)}
                    </p>
                  )}
                </div>
              </div>

              <aside className="space-y-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SparklesIcon className="size-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">С нуля</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Откроется текущий flow: настройка роли, приветствия и ручной
                    выбор вопросов из question bank.
                  </p>
                </div>
                <Button className="w-full" variant="outline" onClick={handleManualCreate}>
                  <FileTextIcon className="size-3.5" />
                  Создать с нуля
                </Button>
              </aside>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
