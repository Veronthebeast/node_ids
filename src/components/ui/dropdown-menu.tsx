'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerId: string;
  menuId: string;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown sub-components must be inside Dropdown');
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

let _dropdownId = 0;

export interface DropdownMenuProps {
  children: ReactNode;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  children,
  defaultOpen = false,
  onOpenChange,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [uid] = useState(() => ++_dropdownId);

  const handleSetOpen = useCallback(
    (v: boolean) => {
      setOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen: handleSetOpen,
        triggerId: `dropdown-trigger-${uid}`,
        menuId: `dropdown-menu-${uid}`,
      }}
    >
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface DropdownMenuTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownMenuTrigger({
  children,
  className,
  asChild,
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerId, menuId } = useDropdown();

  const handleClick = () => setOpen(!open);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  };

  if (asChild) {
    return (
      <div
        role="button"
        tabIndex={0}
        id={triggerId}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      id={triggerId}
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center justify-center rounded-panel px-3 py-2 text-sm font-medium',
        'text-content transition-colors hover:bg-surface-secondary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface DropdownMenuContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end';
}

export function DropdownMenuContent({
  children,
  className,
  align = 'start',
}: DropdownMenuContentProps) {
  const { open, setOpen, menuId } = useDropdown();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    // Delay so the trigger click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  // Focus trap
  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        'absolute z-50 mt-1 min-w-[180px] rounded-panel border border-border bg-surface py-1 shadow-lg',
        'animate-in fade-in zoom-in-95 duration-100',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-content',
        'transition-colors hover:bg-surface-secondary',
        'focus-visible:outline-none focus-visible:bg-surface-secondary',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div className={cn('mx-2 my-1 border-t border-border', className)} />
  );
}
