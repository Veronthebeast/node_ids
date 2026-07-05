'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResponse } from './action-response';

interface SessionData {
  user: {
    id: string;
    email: string | undefined;
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

export async function getSession(): Promise<ActionResponse<SessionData>> {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) return { data: null, error: error.message };
  
  return {
    data: {
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
      } : null,
    },
    error: null,
  };
}
