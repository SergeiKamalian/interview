import { useState, type KeyboardEvent } from 'react';
import { XIcon } from 'lucide-react';
import { Badge, Button, Input } from '@shared/ui';
import { cn } from '@shared/lib/utils';

type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function TagInput({
  label,
  values,
  onChange,
  placeholder = 'Добавить и Enter',
  className,
  disabled = false,
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addValue = (raw: string) => {
    const next = raw.trim();
    if (!next || values.includes(next)) {
      return;
    }

    onChange([...values, next]);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addValue(draft);
    }

    if (event.key === 'Backspace' && draft.length === 0 && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="rounded-lg border border-border bg-background p-2">
        {values.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {values.map((value) => (
              <Badge key={value} variant="secondary" className="gap-1 pr-1">
                {value}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-4 p-0 hover:bg-transparent"
                    onClick={() =>
                      onChange(values.filter((item) => item !== value))
                    }
                    aria-label={`Удалить ${value}`}
                  >
                    <XIcon className="size-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        )}
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addValue(draft)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
