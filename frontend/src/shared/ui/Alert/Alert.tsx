import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import {
  Alert as ShadcnAlert,
  AlertDescription,
  AlertTitle,
} from '../alert';
import { cn } from '@shared/lib/utils';

type AlertVariant = 'success' | 'error' | 'info';

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
};

const variantConfig: Record<
  AlertVariant,
  { shadcnVariant?: 'default' | 'destructive'; className: string; icon: typeof Info }
> = {
  success: {
    className: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100',
    icon: CheckCircle2,
  },
  error: {
    shadcnVariant: 'destructive',
    className: '',
    icon: AlertCircle,
  },
  info: {
    className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100',
    icon: Info,
  },
};

export function Alert({ variant = 'info', title, children }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <ShadcnAlert variant={config.shadcnVariant} className={cn(config.className)}>
      <Icon />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </ShadcnAlert>
  );
}
