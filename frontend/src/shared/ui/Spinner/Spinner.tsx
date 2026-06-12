type SpinnerProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

export function Spinner({ label = 'Loading', size = 'md' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={[
        'inline-block animate-spin rounded-full border-slate-300 border-t-brand-primary',
        sizeClasses[size],
      ].join(' ')}
    />
  );
}
