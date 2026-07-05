import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional card header content. */
  header?: ReactNode;
  /** Optional card footer content. */
  footer?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card({
  className,
  header,
  footer,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-panel border border-border bg-surface shadow-sm',
        className,
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-border px-5 py-4">
          {header}
        </div>
      )}

      {children && <div className="px-5 py-4">{children}</div>}

      {footer && (
        <div className="border-t border-border px-5 py-3">{footer}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-b border-border px-5 py-4 font-medium text-content',
        className,
      )}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-t border-border px-5 py-3 text-sm text-content-muted',
        className,
      )}
      {...props}
    />
  );
}
