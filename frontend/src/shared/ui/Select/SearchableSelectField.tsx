import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command';
import { Label } from '../label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../popover';
import type { SelectOption } from './SelectField';
import { SelectOptionLabel } from './SelectOptionLabel';

type SearchableSelectFieldProps = {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

export function SearchableSelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder = 'Поиск…',
  emptyText = 'Ничего не найдено',
  className,
}: SearchableSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50',
              )}
            >
              <span
                className={cn(
                  'line-clamp-1 min-w-0 text-left',
                  !selectedOption && 'text-muted-foreground',
                )}
              >
                {selectedOption ? (
                  <SelectOptionLabel option={selectedOption} />
                ) : (
                  (placeholder ?? 'Выберите…')
                )}
              </span>
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <PopoverContent
          className="w-(--anchor-width) p-0"
          align="start"
          side="bottom"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value || '__empty'}
                    value={option.label}
                    keywords={[option.value]}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <SelectOptionLabel option={option} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
