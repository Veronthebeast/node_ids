'use client';

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-content">Something went wrong</h1>
        <p className="text-sm text-content-muted">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-content-muted">Error ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
