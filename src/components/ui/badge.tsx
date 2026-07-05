import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const badgeVariants = {
  default:
    'bg-surface-secondary text-content-muted border-border',
  primary:
    'bg-accent/10 text-accent border-accent/20',
  success:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  warning:
    'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  danger:
    'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
} as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color variant. @default 'default' */
  variant?: keyof typeof badgeVariants;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        'transition-colors duration-150',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
