import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useSkillsQuery,
  type Topic,
} from '@features/question-bank/api/questionBankApi';
import {
  useCreateCompanyTopicMutation,
  useUpdateCompanyTopicMutation,
} from '../api/companyQuestionBankApi';
import { toSkillSelectOptions } from '@entities/question/lib/customSelectOptions';
import { Button, Input, SelectField } from '@shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Slider } from '@shared/ui/slider';

type CompanyTopicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic?: Topic | null;
};

type FormValues = {
  code: string;
  name: string;
  skillId: string;
  interviewWeight: number;
};

const emptyValues: FormValues = {
  code: '',
  name: '',
  skillId: '',
  interviewWeight: 5,
};

type TopicFormProps = {
  topic?: Topic | null;
  onOpenChange: (open: boolean) => void;
};

function TopicForm({ topic, onOpenChange }: TopicFormProps) {
  const isEdit = topic != null;
  const [values, setValues] = useState<FormValues>(() =>
    topic
      ? {
          code: topic.code,
          name: topic.name,
          skillId: topic.skill?.id ?? '',
          interviewWeight: topic.interviewWeight,
        }
      : emptyValues,
  );
  const { data: skills = [] } = useSkillsQuery();
  const [createTopic, createState] = useCreateCompanyTopicMutation();
  const [updateTopic, updateState] = useUpdateCompanyTopicMutation();

  const skillOptions = useMemo(
    () => toSkillSelectOptions(skills),
    [skills],
  );

  const isSaving = createState.isLoading || updateState.isLoading;

  const handleSubmit = async () => {
    const code = values.code.trim();
    const name = values.name.trim();

    if (!code || !name || !values.skillId) {
      toast.error('Заполните code, name и skill');
      return;
    }

    try {
      if (isEdit && topic) {
        await updateTopic({
          id: topic.id,
          code,
          name,
          skillId: values.skillId,
          interviewWeight: values.interviewWeight,
        }).unwrap();
        toast.success('Topic обновлён');
      } else {
        await createTopic({
          code,
          name,
          skillId: values.skillId,
          interviewWeight: values.interviewWeight,
        }).unwrap();
        toast.success('Topic создан');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? 'Не удалось обновить topic' : 'Не удалось создать topic');
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Input
          label="Code"
          value={values.code}
          onChange={(event) =>
            setValues((current) => ({ ...current, code: event.target.value }))
          }
          placeholder="internal_api_gateway"
          disabled={isSaving}
        />
        <Input
          label="Name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Internal API Gateway"
          disabled={isSaving}
        />
        <SelectField
          label="Skill"
          value={values.skillId}
          onValueChange={(skillId) =>
            setValues((current) => ({ ...current, skillId }))
          }
          options={skillOptions}
          placeholder="Выберите skill"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Interview weight: {values.interviewWeight}
          </label>
          <Slider
            min={1}
            max={10}
            step={0.5}
            value={[values.interviewWeight]}
            onValueChange={(next) => {
              const resolved = Array.isArray(next) ? next[0] : next;
              setValues((current) => ({
                ...current,
                interviewWeight: typeof resolved === 'number' ? resolved : 5,
              }));
            }}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isSaving}
        >
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={isSaving}
          onClick={() => void handleSubmit()}
        >
          {isSaving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogFooter>
    </>
  );
}

export function CompanyTopicDialog({
  open,
  onOpenChange,
  topic,
}: CompanyTopicDialogProps) {
  const isEdit = topic != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактировать company topic' : 'Новый company topic'}
          </DialogTitle>
          <DialogDescription>
            Тема привязывается к global или company skill. Interview weight
            влияет на приоритет в suggest (1–10).
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TopicForm
            key={topic?.id ?? 'create'}
            topic={topic}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
