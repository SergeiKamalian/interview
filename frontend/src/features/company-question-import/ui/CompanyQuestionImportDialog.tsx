import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  previewCompanyQuestionImport,
  useCommitCompanyQuestionImportMutation,
} from '../api/companyQuestionImportApi';
import type {
  CompanyQuestionImportCommitResult,
  CompanyQuestionImportPreview,
} from '../model/types';
import { hasImportPreviewChanges } from '../lib/previewRows';
import { ImportPreviewStep } from './ImportPreviewStep';
import { ImportSuccessStep } from './ImportSuccessStep';
import { ImportUploadStep } from './ImportUploadStep';
import { Button } from '@shared/ui';
import { Button as ShadcnButton } from '@shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';

type WizardStep = 'upload' | 'preview' | 'success';

type CompanyQuestionImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDrafts: () => void;
};

function emptyPreview(): CompanyQuestionImportPreview {
  return {
    toCreate: { topics: [], skills: [], questions: [], checkpoints: 0 },
    toUpdate: { topics: [], questions: [] },
    errors: [],
    warnings: [],
    importToken: null,
  };
}

export function CompanyQuestionImportDialog({
  open,
  onOpenChange,
  onViewDrafts,
}: CompanyQuestionImportDialogProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CompanyQuestionImportPreview>(
    emptyPreview(),
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [commitResult, setCommitResult] =
    useState<CompanyQuestionImportCommitResult | null>(null);

  const [commitImport, commitState] = useCommitCompanyQuestionImportMutation();

  const resetWizard = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(emptyPreview());
    setUploadError(null);
    setIsPreviewLoading(false);
    setPublishImmediately(false);
    setCommitResult(null);
  }, []);

  const runPreview = async (nextFile: File) => {
    setFile(nextFile);
    setUploadError(null);
    setIsPreviewLoading(true);

    try {
      const result = await previewCompanyQuestionImport(nextFile);
      setPreview(result);
      setStep('preview');
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Не удалось загрузить файл',
      );
      setStep('upload');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview.importToken) {
      toast.error('Нет токена импорта — загрузите файл заново');
      return;
    }

    try {
      const result = await commitImport({
        importToken: preview.importToken,
        status: publishImmediately ? 'published' : 'draft',
      }).unwrap();

      setCommitResult(result);
      setStep('success');
      toast.success('Question bank импортирован');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Не удалось выполнить импорт',
      );
    }
  };

  const canCommit =
    step === 'preview' &&
    preview.errors.length === 0 &&
    Boolean(preview.importToken) &&
    hasImportPreviewChanges(preview);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && (isPreviewLoading || commitState.isLoading)) {
      return;
    }
    if (!nextOpen) {
      resetWizard();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Импорт из Excel</DialogTitle>
          <DialogDescription>
            {step === 'upload' &&
              'Загрузите .xlsx или .csv по шаблону — мы покажем diff перед сохранением.'}
            {step === 'preview' &&
              'Проверьте создаваемые и обновляемые сущности, затем подтвердите импорт.'}
            {step === 'success' && 'Вопросы добавлены в question bank компании.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <ImportUploadStep
            file={file}
            onFileSelect={(nextFile) => void runPreview(nextFile)}
            isLoading={isPreviewLoading}
            error={uploadError}
          />
        )}

        {step === 'preview' && (
          <ImportPreviewStep
            preview={preview}
            publishImmediately={publishImmediately}
            onPublishImmediatelyChange={setPublishImmediately}
          />
        )}

        {step === 'success' && commitResult && (
          <ImportSuccessStep
            result={commitResult}
            published={publishImmediately}
            onViewDrafts={() => {
              onViewDrafts();
              onOpenChange(false);
            }}
            onClose={() => onOpenChange(false)}
          />
        )}

        {step !== 'success' && (
          <DialogFooter className="gap-2 sm:gap-0">
            {step === 'preview' && (
              <ShadcnButton
                type="button"
                variant="outline"
                onClick={() => setStep('upload')}
                disabled={commitState.isLoading}
              >
                Назад
              </ShadcnButton>
            )}
            <ShadcnButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPreviewLoading || commitState.isLoading}
            >
              Отмена
            </ShadcnButton>
            {step === 'preview' && (
              <Button
                type="button"
                variant="primary"
                disabled={!canCommit || commitState.isLoading}
                loading={commitState.isLoading}
                onClick={() => void handleCommit()}
              >
                Подтвердить импорт
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
