import type { ReactNode } from 'react';

import {
  Card as ShadcnCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';
import { cn } from '@shared/lib/utils';

type CardProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ header, footer, children, className = '' }: CardProps) {
  return (
    <ShadcnCard className={cn(className)}>
      {header && (
        <CardHeader className="border-b border-border">
          <CardTitle>{header}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="border-t border-border bg-muted/40">
          {footer}
        </CardFooter>
      )}
    </ShadcnCard>
  );
}
