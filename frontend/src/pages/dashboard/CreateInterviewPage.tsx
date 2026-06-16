import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionBankQuery } from '@features/question-bank/api/questionBankApi';
import {
  useCreateInterviewMutation,
  usePublishInterviewMutation,
} from '@features/interview-create/api/interviewCreateApi';
import { QuestionPicker } from '@features/interview-create/ui/QuestionPicker';
import { useQuestionSelection } from '@features/interview-create/model/useQuestionSelection';
import { Alert, Button, Card, Input } from '@shared/ui';

export function CreateInterviewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [jobRole, setJobRole] = useState('Frontend Developer');
  const [level, setLevel] = useState<'junior' | 'middle' | 'senior' | 'lead'>(
    'middle',
  );
  const [interviewerName, setInterviewerName] = useState('');
  const [welcomeMessageTemplate, setWelcomeMessageTemplate] = useState('');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const { data, isLoading } = useQuestionBankQuery({ limit: 100, offset: 0 });
  const items = data?.items ?? [];

  const {
    selectedIds,
    toggleQuestion,
    moveUp,
    moveDown,
    removeQuestion,
  } = useQuestionSelection(items);

  const [createInterview, { isLoading: isCreating, error: createError }] =
    useCreateInterviewMutation();
  const [publishInterview, { isLoading: isPublishing }] =
    usePublishInterviewMutation();

  const handleCreate = async () => {
    const result = await createInterview({
      title,
      jobRole,
      level,
      interviewerName: interviewerName.trim() || undefined,
      welcomeMessageTemplate: welcomeMessageTemplate.trim() || undefined,
      questionIds: selectedIds,
    }).unwrap();

    setCreatedId(result.id);
    setCreatedUrl(result.publicUrl);
  };

  const handlePublish = async () => {
    if (!createdId) {
      return;
    }

    const result = await publishInterview(createdId).unwrap();
    setCreatedUrl(result.publicUrl);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Создать интервью
        </h2>
        <p className="text-sm text-slate-500">
          Выберите вопросы из question bank и опубликуйте ссылку для кандидата.
        </p>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <Input
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Frontend React — Middle"
          />
          <Input
            label="Роль"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Уровень
            </label>
            <select
              value={level}
              onChange={(e) =>
                setLevel(e.target.value as typeof level)
              }
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="junior">junior</option>
              <option value="middle">middle</option>
              <option value="senior">senior</option>
              <option value="lead">lead</option>
            </select>
          </div>
          <Input
            label="Имя интервьюера (TTS)"
            value={interviewerName}
            onChange={(e) => setInterviewerName(e.target.value)}
            placeholder="AI-интервьюер"
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Текст приветствия
            </label>
            <textarea
              value={welcomeMessageTemplate}
              onChange={(e) => setWelcomeMessageTemplate(e.target.value)}
              placeholder="Привет, {{candidateName}}! Я {{interviewerName}}. Сегодня у нас интервью на позицию «{{jobRole}}». Готов начать?"
              rows={4}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Плейсхолдеры: {'{{candidateName}}'}, {'{{interviewerName}}'},{' '}
              {'{{jobRole}}'}, {'{{title}}'}, {'{{questionCount}}'}
            </p>
          </div>
        </div>

        <QuestionPicker
          items={items}
          selectedIds={selectedIds}
          onToggle={toggleQuestion}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onRemove={removeQuestion}
          isLoading={isLoading}
        />

        {createError && (
          <Alert variant="error" title="Ошибка создания">
            {'message' in (createError as object)
              ? String((createError as { message: string }).message)
              : 'Unknown error'}
          </Alert>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => void handleCreate()}
            loading={isCreating}
            disabled={!title.trim() || selectedIds.length === 0}
          >
            Создать интервью
          </Button>
          {createdId && (
            <Button
              variant="secondary"
              onClick={() => void handlePublish()}
              loading={isPublishing}
            >
              Опубликовать
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Назад
          </Button>
        </div>

        {createdUrl && (
          <Alert variant="success" title="Публичная ссылка">
            <code>{window.location.origin}{createdUrl}</code>
          </Alert>
        )}
      </Card>
    </div>
  );
}
