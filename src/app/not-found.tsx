import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page not found — NodeIDs',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-content">404</h1>
        <p className="text-lg text-content-muted">This page could not be found.</p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        Go home
      </Link>
    </div>
  );
}
