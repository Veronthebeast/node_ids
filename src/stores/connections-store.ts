/**
 * Zustand store for canvas edge / connection state.
 *
 * @remarks
 * Manages the array of React Flow edges on the canvas and the set of
 * currently selected edge IDs. Sincroniza automáticamente los cambios con la base de datos de Supabase.
 *
 * @packageDocumentation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { ConnectionData } from '@/types/connection';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapDbToEdge(db: any): Edge<ConnectionData> {
  return {
    id: db.id,
    source: db.source,
    target: db.target,
    sourceHandle: db.source_handle || undefined,
    targetHandle: db.target_handle || undefined,
    type: db.type || 'smoothstep',
    animated: db.animated || false,
    data: {
      label: db.data?.label || '',
      createdAt: db.data?.createdAt || db.created_at,
      updatedAt: db.data?.updatedAt || db.updated_at,
    },
  };
}

function createDefaultEdge(
  source: string,
  target: string,
  data?: Partial<ConnectionData>,
): Edge<ConnectionData> {
  const id = nanoid();
  const now = new Date().toISOString();
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    animated: false,
    data: {
      label: '',
      createdAt: now,
      updatedAt: now,
      ...data,
    },
  };
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface ConnectionsState {
  /** All edges currently on the canvas. */
  edges: Edge<ConnectionData>[];
  /** IDs of edges that are currently selected. */
  selectedEdgeIds: string[];
  /** Whether edges are loading. */
  isLoading: boolean;

  // ---- Local Actions -----------------------------------------------------

  /** Append a new edge between `source` and `target`. */
  addEdge: (source: string, target: string, data?: Partial<ConnectionData>) => string;
  /** Merge `data` into the edge matching `id`. */
  updateEdge: (id: string, data: Partial<ConnectionData>) => void;
  /** Remove an edge and de-select it if it was selected. */
  removeEdge: (id: string) => void;
  /** Replace the entire edge list (e.g. after React Flow onEdgesChange). */
  setEdges: (edges: Edge<ConnectionData>[]) => void;
  /** Replace the selected-edge-ID set. */
  setSelectedEdges: (ids: string[]) => void;
  /** Remove all edges and clear the selection. */
  clearEdges: () => void;

  // ---- Database Actions --------------------------------------------------

  /** Fetch edges for a specific project. */
  fetchEdges: (projectId: string) => Promise<void>;
  /** Add a new edge to database and state. */
  addEdgeDb: (
    projectId: string,
    source: string,
    sourceHandle: string | null,
    target: string,
    targetHandle: string | null,
    data?: Partial<ConnectionData>,
  ) => Promise<string | null>;
  /** Update edge label or fields in DB. */
  updateEdgeDb: (id: string, data: Partial<ConnectionData>) => Promise<void>;
  /** Delete an edge from the database. */
  removeEdgeDb: (id: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useConnectionsStore = create<ConnectionsState>()(
  immer((set, get) => ({
    edges: [],
    selectedEdgeIds: [],
    isLoading: false,

    addEdge: (source, target, data) => {
      const edge = createDefaultEdge(source, target, data);
      set((state) => {
        state.edges.push(edge);
      });
      return edge.id;
    },

    updateEdge: (id, data) => {
      set((state) => {
        const edge = state.edges.find((e) => e.id === id);
        if (edge) {
          if (!edge.data) {
            edge.data = { label: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ConnectionData;
          }
          Object.assign(edge.data, data, { updatedAt: new Date().toISOString() });
        }
      });
    },

    removeEdge: (id) => {
      set((state) => {
        state.edges = state.edges.filter((e) => e.id !== id);
        state.selectedEdgeIds = state.selectedEdgeIds.filter((eid) => eid !== id);
      });
    },

    setEdges: (edges) => {
      set((state) => {
        state.edges = edges;
      });
    },

    setSelectedEdges: (ids) => {
      set((state) => {
        state.selectedEdgeIds = ids;
      });
    },

    clearEdges: () => {
      set((state) => {
        state.edges = [];
        state.selectedEdgeIds = [];
      });
    },

    // ---- DB Actions ----

    fetchEdges: async (projectId) => {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('edges')
          .select('*')
          .eq('project_id', projectId);

        if (error) throw error;

        const mappedEdges = (data || []).map(mapDbToEdge);
        set((state) => {
          state.edges = mappedEdges;
        });
      } catch (err) {
        console.error('Error fetching edges:', err);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    addEdgeDb: async (projectId, source, sourceHandle, target, targetHandle, data) => {
      try {
        const supabase = createClient();
        const id = nanoid();
        const now = new Date().toISOString();

        const edgeData = {
          label: '',
          createdAt: now,
          updatedAt: now,
          ...data,
        };

        const { error } = await supabase.from('edges').insert({
          id,
          project_id: projectId,
          source,
          target,
          source_handle: sourceHandle || null,
          target_handle: targetHandle || null,
          type: 'smoothstep',
          animated: false,
          data: edgeData,
          created_at: now,
          updated_at: now,
        });

        if (error) throw error;

        set((state) => {
          state.edges.push({
            id,
            source,
            target,
            sourceHandle: sourceHandle || undefined,
            targetHandle: targetHandle || undefined,
            type: 'smoothstep',
            animated: false,
            data: edgeData,
          });
        });

        return id;
      } catch (err) {
        console.error('Error adding edge to DB:', err);
        return null;
      }
    },

    updateEdgeDb: async (id, data) => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        get().updateEdge(id, data);

        const edge = get().edges.find((e) => e.id === id);
        if (!edge) return;

        const { error } = await supabase
          .from('edges')
          .update({
            data: edge.data,
            updated_at: now,
          })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error updating edge in DB:', err);
      }
    },

    removeEdgeDb: async (id) => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('edges').delete().eq('id', id);

        if (error) throw error;

        get().removeEdge(id);
      } catch (err) {
        console.error('Error removing edge from DB:', err);
      }
    },
  })),
);
