'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { LogOut, User, LayoutGrid, Sun, Moon, X } from 'lucide-react';
import { signOut } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);

  const handleSignOut = async () => {
    setMobileSidebarOpen(false);
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Background overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "w-64 border-r bg-surface flex flex-col h-full shrink-0 transition-transform duration-200 z-40",
          "md:translate-x-0 md:relative fixed inset-y-0 left-0 shadow-lg md:shadow-none",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.png"
              alt="NodeIDs Logo"
              width={120}
              height={32}
              className="h-8 w-auto dark:invert"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 hover:bg-surface-secondary rounded-md md:hidden cursor-pointer"
            title="Cerrar menú"
          >
            <X className="w-5 h-5 text-content" />
          </button>
        </div>

        {isAuthenticated && user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-content">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-content-muted truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation menu */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-panel hover:bg-surface-secondary text-content transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-content-muted" />
            Proyectos
          </Link>
        </nav>

        {/* Footer controls (Theme & Logout) */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-content-muted"
            onClick={toggleTheme}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                Modo Claro
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2 text-blue-500" />
                Modo Oscuro
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-content-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
