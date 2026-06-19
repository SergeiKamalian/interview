import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

import { Button as ShadcnButton } from '../button';

type LegacyVariant = 'primary' | 'secondary' | 'ghost';
type LegacySize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: LegacyVariant;
  size?: LegacySize;
  loading?: boolean;
};

const variantMap: Record<
  LegacyVariant,
  'default' | 'secondary' | 'ghost'
> = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
};

const sizeMap: Record<LegacySize, 'sm' | 'default' | 'lg'> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      type="button"
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={disabled ?? loading}
      className={className}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </ShadcnButton>
  );
}
