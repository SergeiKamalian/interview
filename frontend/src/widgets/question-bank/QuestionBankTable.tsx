import { Link } from 'react-router-dom';
import type { QuestionListItem } from '@entities/question/model/types';
import {
  QuestionMetaBadges,
  QuestionScopeBadges,
} from '@entities/question/ui/QuestionBadges';
import { CustomScopeBadge } from '@entities/question/ui/CustomScopeBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/table';

type QuestionBankTableProps = {
  items: QuestionListItem[];
};

function truncate(text: string, max = 96): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function QuestionBankTable({ items }: QuestionBankTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[16rem]">Вопрос</TableHead>
            <TableHead className="min-w-[9rem]">Стек</TableHead>
            <TableHead className="min-w-[8rem]">Уровень</TableHead>
            <TableHead className="min-w-[5rem]">Вес темы</TableHead>
            <TableHead className="min-w-[6rem]">Метки</TableHead>
            <TableHead className="min-w-[6rem] text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="align-top whitespace-normal">
                <p className="font-medium text-foreground wrap-break-word">
                  {truncate(item.questionText)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.profession.name}
                </p>
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">
                    {item.topic.skill?.name ??
                      item.skills?.[0]?.name ??
                      '—'}
                  </p>
                  {(item.topic.skill?.isCustom || item.skills?.[0]?.isCustom) && (
                    <CustomScopeBadge className="px-1 py-0 text-[10px]" />
                  )}
                </div>
                {item.topic.isCustom ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <p className="text-xs text-muted-foreground">
                      {item.topic.name}
                    </p>
                    <CustomScopeBadge className="px-1 py-0 text-[10px]" />
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.topic.name}
                  </p>
                )}
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                <QuestionMetaBadges item={item} />
              </TableCell>
              <TableCell className="align-top text-sm text-muted-foreground">
                {item.topic.interviewWeight ?? '—'}
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                <QuestionScopeBadges item={item} />
              </TableCell>
              <TableCell className="align-top text-right whitespace-nowrap">
                <Link
                  to={`/dashboard/question-bank/${item.id}/edit`}
                  className="text-sm text-brand-primary hover:underline"
                >
                  {item.isCustom ? 'Редактировать' : 'Открыть'}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
