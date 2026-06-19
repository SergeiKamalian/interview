import { Checkbox } from '../checkbox';
import { Label } from '../label';
import { cn } from '@shared/lib/utils';

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
};

export function CheckboxField({
  label,
  checked,
  onCheckedChange,
  id,
  className,
}: CheckboxFieldProps) {
  const fieldId = id ?? label;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox
        id={fieldId}
        checked={checked}
        onCheckedChange={(nextChecked) => onCheckedChange(nextChecked)}
      />
      <Label htmlFor={fieldId} className="text-sm font-normal text-foreground">
        {label}
      </Label>
    </div>
  );
}
