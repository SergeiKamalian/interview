import { useState } from 'react';
import { toast } from 'sonner';
import type { Skill } from '@features/question-bank/api/questionBankApi';
import {
  useCreateCompanySkillMutation,
  useUpdateCompanySkillMutation,
} from '../api/companyQuestionBankApi';
import { Button, Input } from '@shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';

type CompanySkillDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill | null;
};

type FormValues = {
  code: string;
  name: string;
};

const emptyValues: FormValues = { code: '', name: '' };

type SkillFormProps = {
  skill?: Skill | null;
  onOpenChange: (open: boolean) => void;
};

function SkillForm({ skill, onOpenChange }: SkillFormProps) {
  const isEdit = skill != null;
  const [values, setValues] = useState<FormValues>(() =>
    skill ? { code: skill.code, name: skill.name } : emptyValues,
  );
  const [createSkill, createState] = useCreateCompanySkillMutation();
  const [updateSkill, updateState] = useUpdateCompanySkillMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  const handleSubmit = async () => {
    const code = values.code.trim();
    const name = values.name.trim();

    if (!code || !name) {
      toast.error('Заполните код и название');
      return;
    }

    try {
      if (isEdit && skill) {
        await updateSkill({ id: skill.id, code, name }).unwrap();
        toast.success('Стек обновлён');
      } else {
        await createSkill({ code, name }).unwrap();
        toast.success('Стек создан');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? 'Не удалось обновить стек' : 'Не удалось создать стек');
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Input
          label="Код (латиница)"
          value={values.code}
          onChange={(event) =>
            setValues((current) => ({ ...current, code: event.target.value }))
          }
          placeholder="acme_internal_api"
          disabled={isSaving}
        />
        <Input
          label="Название"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Internal API Gateway"
          disabled={isSaving}
        />
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

export function CompanySkillDialog({
  open,
  onOpenChange,
  skill,
}: CompanySkillDialogProps) {
  const isEdit = skill != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактировать стек' : 'Новый стек компании'}
          </DialogTitle>
          <DialogDescription>
            Код в snake_case, например `acme_internal_api`. Стек виден только
            вашей компании.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <SkillForm
            key={skill?.id ?? 'create'}
            skill={skill}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
