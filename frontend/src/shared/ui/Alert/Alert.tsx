import type { ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'info';

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export function Alert({ variant = 'info', title, children }: AlertProps) {
  return (
    <div
      role="alert"
      className={['rounded-lg border px-4 py-3 text-sm', variantClasses[variant]].join(' ')}
    >
      {title && <p className="mb-1 font-medium">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
