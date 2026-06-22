import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useArchiveQuestionMutation,
  useQuestionByIdQuery,
} from '@features/question-bank/api/questionBankApi';
import { useForkQuestionMutation } from '@features/company-question-bank/api/companyQuestionBankApi';
import { CompanyQuestionOverridePanel } from '@features/company-question-bank/ui/CompanyQuestionOverridePanel';
import { QuestionEditorForm } from '@features/company-question-bank/ui/QuestionEditorForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/ui/alert-dialog';
import {
  Alert,
  Card,
  PAGE_SECTION_NAV_LAYOUT,
  PageSectionNav,
  Spinner,
} from '@shared/ui';
import { Button as ShadcnButton } from '@shared/ui/button';

const QUESTION_EDITOR_SECTIONS = [
  { id: 'question-form-main', label: 'Основное' },
  { id: 'question-form-settings', label: 'Настройки' },
  { id: 'question-form-checkpoints', label: 'Критерии' },
  { id: 'question-form-examples', label: 'Примеры' },
] as const;

const { pageClassName } = PAGE_SECTION_NAV_LAYOUT;

export function QuestionBankEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { questionId } = useParams<{ questionId?: string }>();
  const isCreateMode = !questionId;
  const resolvedQuestionId = questionId;
  const initialSkillId = isCreateMode
    ? searchParams.get('skillId') ?? undefined
    : undefined;

  const { data: question, isLoading, isError } = useQuestionByIdQuery(
    resolvedQuestionId ?? '',
    { skip: !resolvedQuestionId },
  );
  const [archiveQuestion, archiveState] = useArchiveQuestionMutation();
  const [forkQuestion, forkState] = useForkQuestionMutation();
  const [archiveOpen, setArchiveOpen] = useState(false);

  const title = isCreateMode
    ? 'Новый вопрос'
    : question?.questionText
      ? `Редактирование: ${question.questionText.slice(0, 64)}`
      : 'Редактирование вопроса';

  if (!isCreateMode && !resolvedQuestionId) {
    return <Navigate to="/dashboard/question-bank" replace />;
  }

  const handleSaved = (savedId: string) => {
    navigate(`/dashboard/question-bank/${savedId}/edit`, { replace: true });
  };

  const handleFork = async () => {
    if (!resolvedQuestionId) {
      return;
    }

    try {
      const forked = await forkQuestion(resolvedQuestionId).unwrap();
      toast.success('Создана ваша копия — теперь можно редактировать');
      navigate(`/dashboard/question-bank/${forked.id}/edit`, { replace: true });
    } catch {
      toast.error('Не удалось создать копию вопроса');
    }
  };

  const isGlobalQuestion = question != null && !question.isCustom;

  const handleArchive = async () => {
    if (!resolvedQuestionId) {
      return;
    }

    try {
      await archiveQuestion(resolvedQuestionId).unwrap();
      toast.success('Вопрос архивирован');
      setArchiveOpen(false);
      navigate('/dashboard/question-bank');
    } catch {
      toast.error('Не удалось архивировать вопрос');
    }
  };

  return (
    <div className={`space-y-4 ${pageClassName}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ShadcnButton
            variant="ghost"
            size="sm"
            className="mb-2 px-0"
            render={<Link to="/dashboard/question-bank" />}
          >
            ← К банку вопросов
          </ShadcnButton>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {isCreateMode
              ? 'Создайте свой вопрос с checkpoints и red/green flags.'
              : 'Изменения сохраняются только для ваших вопросов.'}
          </p>
        </div>

        {!isCreateMode && isGlobalQuestion && (
          <div className="max-w-xs space-y-1 text-right">
            <ShadcnButton
              variant="default"
              disabled={forkState.isLoading}
              onClick={() => void handleFork()}
            >
              {forkState.isLoading ? 'Копирование…' : 'Сделать свою копию'}
            </ShadcnButton>
            <p className="text-xs text-muted-foreground">
              Редактируемая копия для вашей компании. Оригинал не изменится.
            </p>
          </div>
        )}

        {!isCreateMode && question?.isCustom && question.isActive && (
          <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
            <AlertDialogTrigger render={<ShadcnButton variant="secondary" />}>
              Архивировать
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Архивировать вопрос?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вопрос исчезнет из списка по умолчанию, но останется в базе.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  disabled={archiveState.isLoading}
                  onClick={() => void handleArchive()}
                >
                  Архивировать
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {!isCreateMode && isLoading && (
        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка вопроса…
          </div>
        </Card>
      )}

      {!isCreateMode && isError && (
        <Alert variant="error" title="Не удалось загрузить вопрос">
          Проверьте id или вернитесь к списку.
        </Alert>
      )}

      {(isCreateMode || question) && (
        <>
          <QuestionEditorForm
            key={isCreateMode ? `create-${initialSkillId ?? ''}` : question?.id ?? 'loading'}
            mode={isCreateMode ? 'create' : 'edit'}
            question={question}
            initialSkillId={initialSkillId}
            onSaved={handleSaved}
            onCancel={() => navigate('/dashboard/question-bank')}
          />

          {!isCreateMode && isGlobalQuestion && resolvedQuestionId && (
            <CompanyQuestionOverridePanel sourceQuestionId={resolvedQuestionId} />
          )}
        </>
      )}

      <PageSectionNav sections={QUESTION_EDITOR_SECTIONS} />
    </div>
  );
}
