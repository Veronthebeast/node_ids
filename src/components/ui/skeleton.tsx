import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to show as a circle (equal width/height with full rounding). */
  circle?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Skeleton({
  className,
  circle = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-panel bg-surface-tertiary',
        circle && 'rounded-full',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
