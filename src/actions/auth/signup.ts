'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthErrorMessage } from './errors';
import type { ActionResponse } from './action-response';

export async function signUp(formData: FormData): Promise<ActionResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) return { data: null, error: getAuthErrorMessage(error) };
  return { data: null, error: null };
}
