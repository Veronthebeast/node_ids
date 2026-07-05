-- ==================================================
-- SQL Fix for Older Supabase Instances
-- Run this in your Supabase SQL Editor if you see
-- any function auth.jwt() does not exist errors.
-- ==================================================

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT 
    coalesce(
      nullif(current_setting('request.jwt.claims', true), ''),
      '{}'
    )::jsonb;
$$;
