import { AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import type { CompanyQuestionImportPreview } from '../model/types';
import { buildImportPreviewRows } from '../lib/previewRows';
import { Alert, Badge, CheckboxField } from '@shared/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';
import { ScrollArea } from '@shared/ui';

type ImportPreviewStepProps = {
  preview: CompanyQuestionImportPreview;
  publishImmediately: boolean;
  onPublishImmediatelyChange: (value: boolean) => void;
};

const entityLabels = {
  topic: 'Тема',
  skill: 'Стек',
  question: 'Вопрос',
} as const;

function ActionBadge({ kind }: { kind: 'create' | 'update' }) {
  if (kind === 'create') {
    return (
      <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
        <Plus className="size-3" />
        Создать
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
      <RefreshCw className="size-3" />
      Обновить
    </Badge>
  );
}

export function ImportPreviewStep({
  preview,
  publishImmediately,
  onPublishImmediatelyChange,
}: ImportPreviewStepProps) {
  const rows = buildImportPreviewRows(preview);
  const hasErrors = preview.errors.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Новые темы"
          value={preview.toCreate.topics.length}
        />
        <SummaryCard
          label="Новые вопросы"
          value={preview.toCreate.questions.length}
        />
        <SummaryCard
          label="Обновления"
          value={
            preview.toUpdate.topics.length + preview.toUpdate.questions.length
          }
        />
        <SummaryCard
          label="Checkpoints"
          value={preview.toCreate.checkpoints}
        />
      </div>

      {preview.warnings.length > 0 && (
        <Alert variant="info" title="Предупреждения">
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
            {preview.warnings.map((warning, index) => (
              <li key={`${warning.row}-${index}`}>
                Строка {warning.row}: {warning.message}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {hasErrors ? (
        <Alert variant="error" title="Ошибки в файле — импорт невозможен">
          <ScrollArea className="mt-2 max-h-48">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Строка</TableHead>
                  <TableHead className="w-32">Поле</TableHead>
                  <TableHead>Сообщение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.errors.map((item, index) => (
                  <TableRow key={`${item.row}-${item.field}-${index}`}>
                    <TableCell>{item.row || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.field}
                    </TableCell>
                    <TableCell>{item.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Alert>
      ) : (
        <>
          {rows.length === 0 ? (
            <Alert variant="info" title="Изменений не найдено">
              Файл валиден, но не содержит новых или обновляемых сущностей.
            </Alert>
          ) : (
            <ScrollArea className="max-h-72 rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Действие</TableHead>
                    <TableHead className="w-24">Тип</TableHead>
                    <TableHead>Code / тема</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <ActionBadge kind={row.kind} />
                      </TableCell>
                      <TableCell>{entityLabels[row.entity]}</TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {row.code ?? row.name ?? '—'}
                        </p>
                        {row.name && row.code && (
                          <p className="text-xs text-muted-foreground">
                            {row.name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md text-sm text-muted-foreground">
                        {row.details ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          {!hasErrors && preview.importToken && (
            <CheckboxField
              label="Опубликовать сразу (иначе — черновики)"
              checked={publishImmediately}
              onCheckedChange={onPublishImmediatelyChange}
            />
          )}
        </>
      )}

      {!hasErrors && preview.importToken && rows.length > 0 && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          Повторный импорт с теми же topic_code обновит существующие company
          questions. Токен предпросмотра действует 15 минут.
        </p>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
