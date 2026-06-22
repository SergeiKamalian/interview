import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { Alert } from '@shared/ui';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';

const TEMPLATE_URL = '/templates/company-question-bank-import.xlsx';

type ImportUploadStepProps = {
  file: File | null;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
};

const ACCEPT = '.xlsx,.csv';

export function ImportUploadStep({
  file,
  onFileSelect,
  isLoading,
  error,
}: ImportUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (nextFile: File | undefined) => {
      if (!nextFile) {
        return;
      }
      onFileSelect(nextFile);
    },
    [onFileSelect],
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files.item(0) ?? undefined);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Шаблон Excel</p>
        <p className="mt-1">
          Скачайте шаблон с примером строки и листом «Инструкция». Одна строка =
          один checkpoint; колонки вопроса/темы повторяются для каждого
          checkpoint.
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          nativeButton={false}
          render={
            <a
              href={TEMPLATE_URL}
              download="company-question-bank-import.xlsx"
            />
          }
        >
          <FileSpreadsheet className="size-4" />
          Скачать шаблон
        </Button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/40',
        )}
      >
        <Upload className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">
            Перетащите файл сюда или нажмите для выбора
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Поддерживаются .xlsx и .csv, до 5 МБ
          </p>
        </div>
        {file && (
          <p className="text-sm text-foreground">
            Выбран: <span className="font-medium">{file.name}</span>
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) =>
            handleFile(event.target.files?.item(0) ?? undefined)
          }
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Проверяем файл…</p>
      )}

      {error && (
        <Alert variant="error" title="Не удалось обработать файл">
          {error}
        </Alert>
      )}
    </div>
  );
}
