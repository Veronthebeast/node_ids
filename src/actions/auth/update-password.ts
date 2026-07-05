'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthErrorMessage } from './errors';
import type { ActionResponse } from './action-response';

export async function updatePassword(formData: FormData): Promise<ActionResponse> {
  const password = formData.get('password') as string;
  
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) return { data: null, error: getAuthErrorMessage(error) };
  return { data: null, error: null };
}
