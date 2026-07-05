import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  // If there's a code, exchange it for a session
  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If it's a password recovery flow, redirect to update-password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // Support custom next param, default to /dashboard
      const next = searchParams.get('next') ?? '/dashboard';
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
