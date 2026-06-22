import { useMemo, useState } from 'react';
import { BookMarked, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useArchiveCompanyQuestionPlaybookMutation,
  useCompanyQuestionPlaybooksQuery,
} from '@features/company-question-playbooks/api/companyQuestionPlaybookApi';
import {
  Alert,
  Badge,
  Button,
  Card,
  Spinner,
} from '@shared/ui';
import { Button as ShadcnButton } from '@shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';

const levelLabel: Record<string, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
  lead: 'Lead',
};

export function CompanyQuestionPlaybooksSection() {
  const { data, isLoading, isError, error, refetch } =
    useCompanyQuestionPlaybooksQuery();
  const [archive, { isLoading: isArchiving }] =
    useArchiveCompanyQuestionPlaybookMutation();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const playbooks = useMemo(() => data ?? [], [data]);
  const confirmPlaybook = playbooks.find((item) => item.id === confirmId);

  const handleArchive = async () => {
    if (!confirmId) {
      return;
    }
    try {
      await archive(confirmId).unwrap();
      toast.success('Набор вопросов архивирован');
      setConfirmId(null);
    } catch {
      toast.error('Не удалось архивировать набор');
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookMarked className="size-4 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">
                Наборы вопросов
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Сохранённые подборки вопросов для типовых вакансий — чтобы не
              собирать интервью заново каждый раз.
            </p>
            <p className="text-xs text-muted-foreground">
              Как создать: интервью → шаг «Вопросы» → подберите вопросы →{' '}
              <span className="font-medium text-foreground">
                Сохранить набор
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void refetch()}>
              Обновить
            </Button>
            <ShadcnButton variant="default" render={<Link to="/dashboard/interviews/create" />}>
              <Plus className="size-4" />
              Создать набор
            </ShadcnButton>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {isError && (
          <Alert variant="error" title="Не удалось загрузить наборы">
            {error instanceof Error ? error.message : 'Ошибка запроса'}
          </Alert>
        )}

        {!isLoading && !isError && playbooks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Наборов пока нет. Создайте интервью, подберите вопросы на шаге
              «Вопросы» и нажмите «Сохранить набор».
            </p>
            <ShadcnButton
              className="mt-4"
              variant="secondary"
              render={<Link to="/dashboard/interviews/create" />}
            >
              Перейти к созданию интервью
            </ShadcnButton>
          </div>
        )}

        {!isLoading && !isError && playbooks.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Вопросов</TableHead>
                <TableHead>Закреплено</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {playbooks.map((playbook) => (
                <TableRow key={playbook.id}>
                  <TableCell className="font-medium">{playbook.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {levelLabel[playbook.level] ?? playbook.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{playbook.itemCount}</TableCell>
                  <TableCell>
                    {playbook.pinnedCount > 0 ? (
                      <Badge variant="orange">{playbook.pinnedCount}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Архивировать набор"
                      onClick={() => setConfirmId(playbook.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={confirmId != null} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Архивировать набор?</DialogTitle>
            <DialogDescription>
              «{confirmPlaybook?.name}» больше не будет доступен в визарде
              создания интервью.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmId(null)}>
              Отмена
            </Button>
            <ShadcnButton
              variant="destructive"
              disabled={isArchiving}
              onClick={() => void handleArchive()}
            >
              Архивировать
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
