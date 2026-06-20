import { useState } from 'react';
import { ChevronDownIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '@app/store/hooks';
import { Button, Spinner } from '@shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { buildAttemptExportBundle } from '../lib/buildAttemptExportBundle';
import { downloadTextFile } from '../lib/downloadFile';
import { fetchExportEvaluations } from '../lib/fetchExportEvaluations';
import { openPrintableHtmlReport } from '../lib/renderPrintableHtmlReport';
import type {
  AttemptExportInterviewMeta,
  AttemptExportTableItem,
} from '../lib/attemptExport.types';

type AttemptExportMenuProps = {
  interview: AttemptExportInterviewMeta;
  selectedAttempts: Map<string, AttemptExportTableItem>;
};

function buildExportFilename(interviewId: string, extension: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `interview-${interviewId}-export-${date}.${extension}`;
}

export function AttemptExportMenu({
  interview,
  selectedAttempts,
}: AttemptExportMenuProps) {
  const dispatch = useAppDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const selectedCount = selectedAttempts.size;
  const isDisabled = selectedCount === 0 || isExporting;

  const buildBundle = async () => {
    const attempts = [...selectedAttempts.values()];
    const evaluationsByAttemptId = await fetchExportEvaluations(
      dispatch,
      attempts,
    );

    return buildAttemptExportBundle({
      interview,
      selectedAttempts: attempts,
      evaluationsByAttemptId,
    });
  };

  const handleJsonExport = async () => {
    setIsExporting(true);

    try {
      const bundle = await buildBundle();
      downloadTextFile(
        JSON.stringify(bundle, null, 2),
        buildExportFilename(interview.id, 'json'),
        'application/json;charset=utf-8',
      );
      toast.success('JSON экспортирован', {
        description: `${bundle.candidates.length} кандидат(ов)`,
      });
    } catch (error) {
      toast.error('Не удалось экспортировать JSON', {
        description:
          error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintExport = async () => {
    setIsExporting(true);

    try {
      const bundle = await buildBundle();
      openPrintableHtmlReport(bundle);
      toast.success('Отчёт открыт для печати', {
        description: `${bundle.candidates.length} кандидат(ов)`,
      });
    } catch (error) {
      toast.error('Не удалось открыть печать', {
        description:
          error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            size="sm"
            disabled={isDisabled}
            className="gap-2"
          />
        }
      >
        {isExporting ? <Spinner size="sm" /> : <DownloadIcon className="size-4" />}
        Экспорт
        {selectedCount > 0 ? ` (${selectedCount})` : ''}
        <ChevronDownIcon className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={isDisabled} onClick={() => void handleJsonExport()}>
          <DownloadIcon className="size-4" />
          Скачать JSON
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isDisabled} onClick={() => void handlePrintExport()}>
          <PrinterIcon className="size-4" />
          Печать HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
