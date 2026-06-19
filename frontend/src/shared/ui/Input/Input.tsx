import type { InputHTMLAttributes } from 'react';

import { Label } from '../label';
import { Input as ShadcnInput } from '../input';
import { cn } from '@shared/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <ShadcnInput
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(className)}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
