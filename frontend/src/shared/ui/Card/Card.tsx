import type { ReactNode } from 'react';

type CardProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ header, footer, children, className = '' }: CardProps) {
  return (
    <section
      className={[
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      ].join(' ')}
    >
      {header && (
        <header className="border-b border-slate-200 px-5 py-4 font-medium text-slate-900">
          {header}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3">
          {footer}
        </footer>
      )}
    </section>
  );
}
