import type { ReactNode } from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@shared/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

export type TablePaginationConfig = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  totalLabel?: string;
  summary?: ReactNode;
};

export type TablePaginationProps = TablePaginationConfig & {
  className?: string;
};

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
  totalLabel = 'всего',
  summary,
  className,
}: TablePaginationProps) {
  const safePageSize = pageSize > 0 ? pageSize : 20;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const visiblePages = generatePageNumbers(currentPage, totalPages);
  const disabled = isLoading;
  const canGoBack = currentPage > 1 && !disabled;
  const canGoForward = currentPage < totalPages && !disabled;

  const summaryNode =
    summary ??
    (
      <>
        Страница {currentPage} из {totalPages} · {totalLabel} {total}
      </>
    );

  if (total <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <span>{summaryNode}</span>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canGoBack}
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                >
                  Назад
                </Button>
              </PaginationItem>

              {visiblePages.map((item, index) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <Button
                      variant={item === currentPage ? 'outline' : 'ghost'}
                      size="icon-sm"
                      aria-current={item === currentPage ? 'page' : undefined}
                      disabled={disabled}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </Button>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canGoForward}
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                >
                  Вперёд
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {onPageSizeChange ? (
          <Select
            value={String(safePageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}
      </div>
    </div>
  );
}
