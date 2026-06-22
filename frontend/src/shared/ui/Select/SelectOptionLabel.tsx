import { CustomScopeBadge } from '@entities/question/ui/CustomScopeBadge';
import type { SelectOption } from './SelectField';

export function SelectOptionLabel({ option }: { option: SelectOption }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {option.flag ? (
        <span aria-hidden className="text-base leading-none">
          {option.flag}
        </span>
      ) : null}
      <span className="truncate">{option.label}</span>
      {option.isCustom ? <CustomScopeBadge className="px-1 py-0 text-[10px]" /> : null}
    </span>
  );
}
