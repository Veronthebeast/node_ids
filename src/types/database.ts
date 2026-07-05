/**
 * Supabase database row types for NodeIDs.
 *
 * @remarks
 * These types mirror the PostgreSQL table schemas and use
 * **snake_case** column names (Supabase convention) with
 * `any` for JSONB columns since the actual shapes are
 * validated at the application layer.
 *
 * These are manual stubs for the scaffold phase.  Once the
 * Supabase project is live, replace this file with:
 * ```
 * npx supabase gen types typescript --linked > src/types/database.ts
 * ```
 *
 * @packageDocumentation
 */

/** Row shape for the `projects` table. */
export interface DbProject {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

/** Row shape for the `nodes` table. */
export interface DbNode {
  id: string;
  project_id: string;
  type: string;
  position_x: number;
  position_y: number;
  /** JSONB — validated at runtime as {@link NodeData}. */
  data: unknown;
  created_at: string;
  updated_at: string;
}

/** Row shape for the `edges` table. */
export interface DbEdge {
  id: string;
  project_id: string;
  source: string;
  target: string;
  source_handle?: string;
  target_handle?: string;
  type: string;
  animated: boolean;
  /** JSONB — validated at runtime as {@link ConnectionData}. */
  data?: unknown;
  created_at: string;
  updated_at: string;
}

/** Row shape for the `checklist_items` table. */
export interface DbChecklistItem {
  id: string;
  node_id: string;
  text: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}
