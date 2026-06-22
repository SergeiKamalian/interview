import { Label } from '../label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { cn } from '@shared/lib/utils';
import { SelectOptionLabel } from './SelectOptionLabel';

export type SelectOption = {
  value: string;
  label: string;
  flag?: string;
  isCustom?: boolean;
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
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Select
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <SelectOptionLabel option={selectedOption} />
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option.value || '__empty'} value={option.value}>
              <SelectOptionLabel option={option} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
