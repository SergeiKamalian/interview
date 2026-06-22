import { useState } from 'react';
import { toast } from 'sonner';
import {
  useCompanyQuestionOverrideQuery,
  useUpsertCompanyQuestionOverrideMutation,
} from '../api/companyQuestionBankApi';
import { TagInput } from './TagInput';
import { Button, Card, Spinner } from '@shared/ui';

type OverrideFormProps = {
  sourceQuestionId: string;
  initialMustConcepts: string[];
  initialFalseClaims: string[];
};

function OverrideForm({
  sourceQuestionId,
  initialMustConcepts,
  initialFalseClaims,
}: OverrideFormProps) {
  const [upsertOverride, upsertState] = useUpsertCompanyQuestionOverrideMutation();
  const [extraMustConcepts, setExtraMustConcepts] = useState(initialMustConcepts);
  const [extraFalseClaims, setExtraFalseClaims] = useState(initialFalseClaims);

  const handleSave = async () => {
    try {
      await upsertOverride({
        sourceQuestionId,
        extraMustConcepts,
        extraFalseClaims,
      }).unwrap();
      toast.success('Дополнительные флаги сохранены');
    } catch {
      toast.error('Не удалось сохранить флаги');
    }
  };

  return (
    <>
      <TagInput
        label="Доп. green flags (must concepts)"
        values={extraMustConcepts}
        onChange={setExtraMustConcepts}
        placeholder="redux toolkit"
      />

      <TagInput
        label="Доп. red flags (false claims)"
        values={extraFalseClaims}
        onChange={setExtraFalseClaims}
        placeholder="we use mobx by default"
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          disabled={upsertState.isLoading}
          onClick={() => void handleSave()}
        >
          {upsertState.isLoading ? 'Сохранение…' : 'Сохранить флаги'}
        </Button>
      </div>
    </>
  );
}

type CompanyQuestionOverridePanelProps = {
  sourceQuestionId: string;
};

export function CompanyQuestionOverridePanel({
  sourceQuestionId,
}: CompanyQuestionOverridePanelProps) {
  const { data: override, isLoading } = useCompanyQuestionOverrideQuery(
    sourceQuestionId,
  );

  const formKey = `${sourceQuestionId}:${override?.updatedAt ?? 'empty'}`;

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-foreground">
            Флаги компании
          </h3>
          <p className="text-sm text-muted-foreground">
            Дополнительные green/red flags применяются при оценке ответов — без
            изменения текста платформенного вопроса.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Загрузка…
          </div>
        )}

        {!isLoading && (
          <OverrideForm
            key={formKey}
            sourceQuestionId={sourceQuestionId}
            initialMustConcepts={override?.extraMustConcepts ?? []}
            initialFalseClaims={override?.extraFalseClaims ?? []}
          />
        )}
      </div>
    </Card>
  );
}
