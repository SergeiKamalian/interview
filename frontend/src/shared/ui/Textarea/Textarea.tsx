import type { TextareaHTMLAttributes } from 'react';

import { Label } from '../label';
import { Textarea as ShadcnTextarea } from '../textarea';
import { cn } from '@shared/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({
  label,
  error,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={textareaId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <ShadcnTextarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={cn(className)}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
