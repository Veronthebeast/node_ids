'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthErrorMessage } from './errors';
import type { ActionResponse } from './action-response';

export async function signOut(): Promise<ActionResponse> {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) return { data: null, error: getAuthErrorMessage(error) };
  return { data: null, error: null };
}
