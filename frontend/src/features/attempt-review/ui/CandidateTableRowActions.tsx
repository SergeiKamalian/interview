import { Link } from 'react-router-dom';
import { ArrowRightIcon, GitCompareArrowsIcon, MoreHorizontalIcon } from 'lucide-react';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

type CandidateTableRowActionsProps = {
  reviewUrl: string;
  canCompare: boolean;
  isSelected: boolean;
  selectionFull: boolean;
  onCompare: () => void;
  onToggleSelect: () => void;
};

export function CandidateTableRowActions({
  reviewUrl,
  canCompare,
  isSelected,
  selectionFull,
  onCompare,
  onToggleSelect,
}: CandidateTableRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="sm" variant="secondary" render={<Link to={reviewUrl} />}>
        Посмотреть детали
        <ArrowRightIcon className="size-3.5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Ещё действия"
            />
          }
        >
          <MoreHorizontalIcon className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canCompare ? (
            <DropdownMenuItem onClick={onCompare}>
              <GitCompareArrowsIcon className="size-3.5" />
              Сравнить с другими
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            disabled={!isSelected && selectionFull}
            onClick={onToggleSelect}
          >
            {isSelected ? 'Убрать из сравнения' : 'Выбрать для сравнения'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
