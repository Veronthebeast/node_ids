'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';
import { ToastContainer } from '@/components/ui/toast-container';

/**
 * Combines all context providers into a single component.
 *
 * Nesting order:
 *   QueryProvider  →  ThemeProvider  →  AuthProvider
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
