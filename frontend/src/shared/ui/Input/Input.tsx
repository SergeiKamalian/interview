import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm',
          'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-blue-200',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
