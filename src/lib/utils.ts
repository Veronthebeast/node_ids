import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

/**
 * Merge class names using clsx + tailwind-merge.
 * Resolves Tailwind class conflicts automatically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID using nanoid.
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Format a date string or Date object into a human-readable form.
 *
 * @example formatDate('2024-01-15') // → "Jan 15, 2024"
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
