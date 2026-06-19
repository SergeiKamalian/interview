import { Label } from '../label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { cn } from '@shared/lib/utils';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function SelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: SelectFieldProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Select
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value || '__empty'} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
