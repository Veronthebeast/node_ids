/**
 * Zustand store for canvas node state and checklist items.
 *
 * @remarks
 * Manages the array of React Flow nodes on the canvas, the set of
 * currently selected node IDs, and checklist items associated with each node.
 * Sincroniza automáticamente los cambios con la base de datos de Supabase.
 *
 * @packageDocumentation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Node } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { NodeData } from '@/types/node';
import type { ChecklistItem } from '@/types/checklist';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapDbToNode(db: any): Node<NodeData> {
  return {
    id: db.id,
    type: 'customNode',
    position: { x: Number(db.position_x), y: Number(db.position_y) },
    data: {
      title: db.data?.title || '',
      description: db.data?.description || '',
      notes: db.data?.notes || '',
      color: db.data?.color || '#6366f1',
      priority: db.data?.priority || 'medium',
      tags: db.data?.tags || [],
      createdAt: db.data?.createdAt || db.created_at,
      updatedAt: db.data?.updatedAt || db.updated_at,
      checklistProgress: db.data?.checklistProgress || 0,
    },
  };
}

function mapDbToChecklistItem(db: any): ChecklistItem {
  return {
    id: db.id,
    nodeId: db.node_id,
    text: db.text,
    completed: db.completed,
    position: db.position,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function createDefaultNode(
  position: { x: number; y: number },
  data?: Partial<NodeData>,
): Node<NodeData> {
  const id = nanoid();
  const now = new Date().toISOString();
  return {
    id,
    type: 'customNode',
    position,
    data: {
      title: '',
      description: '',
      notes: '',
      color: '#6366f1',
      priority: 'medium',
      tags: [],
      createdAt: now,
      updatedAt: now,
      checklistProgress: 0,
      ...data,
    },
  };
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface NodesState {
  /** All nodes currently on the canvas. */
  nodes: Node<NodeData>[];
  /** IDs of nodes that are currently selected. */
  selectedNodeIds: string[];
  /** Checklist items grouped by nodeId. */
  checklistItems: Record<string, ChecklistItem[]>;
  /** Whether nodes are loading. */
  isLoading: boolean;

  // ---- Local Actions -----------------------------------------------------

  /** Append a new node at the given position with optional partial data. */
  addNode: (position: { x: number; y: number }, data?: Partial<NodeData>) => string;
  /** Merge `data` into the node matching `id`. */
  updateNode: (id: string, data: Partial<NodeData>) => void;
  /** Remove a node and de-select it if it was selected. */
  removeNode: (id: string) => void;
  /** Replace the entire node list (e.g. after React Flow onNodesChange). */
  setNodes: (nodes: Node<NodeData>[]) => void;
  /** Replace the selected-node-ID set. */
  setSelectedNodes: (ids: string[]) => void;
  /** Update the canvas position of a single node. */
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  /** Remove all nodes and clear the selection. */
  clearNodes: () => void;

  // ---- Database Actions (Nodes) ------------------------------------------

  /** Fetch nodes for a specific project. */
  fetchNodes: (projectId: string) => Promise<void>;
  /** Add a node to the database and state. */
  addNodeDb: (projectId: string, position: { x: number; y: number }, data?: Partial<NodeData>) => Promise<string | null>;
  /** Save updated node properties to the database. */
  updateNodeDb: (id: string, data: Partial<NodeData>) => Promise<void>;
  /** Save updated node position to the database. */
  updateNodePositionDb: (id: string, position: { x: number; y: number }) => Promise<void>;
  /** Delete a node from the database. */
  removeNodeDb: (id: string) => Promise<void>;

  // ---- Database Actions (Checklist) --------------------------------------

  /** Fetch checklist items for nodes. */
  fetchChecklistItems: (nodeIds: string[]) => Promise<void>;
  /** Add a checklist item. */
  addChecklistItemDb: (nodeId: string, text: string) => Promise<void>;
  /** Update a checklist item's status or text. */
  updateChecklistItemDb: (id: string, nodeId: string, updates: Partial<ChecklistItem>) => Promise<void>;
  /** Delete a checklist item. */
  deleteChecklistItemDb: (id: string, nodeId: string) => Promise<void>;
  /** Save reordered checklist items. */
  reorderChecklistItemsDb: (nodeId: string, orderedItems: ChecklistItem[]) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNodesStore = create<NodesState>()(
  immer((set, get) => ({
    nodes: [],
    selectedNodeIds: [],
    checklistItems: {},
    isLoading: false,

    addNode: (position, data) => {
      const node = createDefaultNode(position, data);
      set((state) => {
        state.nodes.push(node);
      });
      return node.id;
    },

    updateNode: (id, data) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          Object.assign(node.data, data, { updatedAt: new Date().toISOString() });
        }
      });
    },

    removeNode: (id) => {
      set((state) => {
        state.nodes = state.nodes.filter((n) => n.id !== id);
        state.selectedNodeIds = state.selectedNodeIds.filter((nid) => nid !== id);
        delete state.checklistItems[id];
      });
    },

    setNodes: (nodes) => {
      set((state) => {
        state.nodes = nodes;
      });
    },

    setSelectedNodes: (ids) => {
      set((state) => {
        state.selectedNodeIds = ids;
      });
    },

    updateNodePosition: (id, position) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) {
          node.position = position;
          node.data.updatedAt = new Date().toISOString();
        }
      });
    },

    clearNodes: () => {
      set((state) => {
        state.nodes = [];
        state.selectedNodeIds = [];
        state.checklistItems = {};
      });
    },

    // ---- DB Actions (Nodes) ----

    fetchNodes: async (projectId) => {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('nodes')
          .select('*')
          .eq('project_id', projectId);

        if (error) throw error;

        const mappedNodes = (data || []).map(mapDbToNode);
        set((state) => {
          state.nodes = mappedNodes;
        });

        // Fetch checklist items for these nodes
        const nodeIds = mappedNodes.map((n) => n.id);
        if (nodeIds.length > 0) {
          await get().fetchChecklistItems(nodeIds);
        }
      } catch (err) {
        console.error('Error fetching nodes:', err);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    addNodeDb: async (projectId, position, data) => {
      try {
        const supabase = createClient();
        const id = nanoid();
        const now = new Date().toISOString();

        const nodeData: NodeData = {
          title: '',
          description: '',
          notes: '',
          color: '#6366f1',
          priority: 'medium',
          tags: [],
          createdAt: now,
          updatedAt: now,
          checklistProgress: 0,
          ...data,
        };

        const { error } = await supabase.from('nodes').insert({
          id,
          project_id: projectId,
          type: 'customNode',
          position_x: position.x,
          position_y: position.y,
          data: nodeData,
          created_at: now,
          updated_at: now,
        });

        if (error) throw new Error(error.message);

        set((state) => {
          state.nodes.push({
            id,
            type: 'customNode',
            position,
            data: nodeData,
          });
          state.checklistItems[id] = [];
        });

        return id;
      } catch (err: any) {
        console.error('Error adding node to DB:', err?.message || err);
        return null;
      }
    },

    updateNodeDb: async (id, data) => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        // Update local state first
        get().updateNode(id, data);

        // Fetch latest state data for this node
        const node = get().nodes.find((n) => n.id === id);
        if (!node) return;

        const { error } = await supabase
          .from('nodes')
          .update({
            data: node.data,
            updated_at: now,
          })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error updating node in DB:', err);
      }
    },

    updateNodePositionDb: async (id, position) => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        get().updateNodePosition(id, position);

        const { error } = await supabase
          .from('nodes')
          .update({
            position_x: position.x,
            position_y: position.y,
            updated_at: now,
          })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error updating node position in DB:', err);
      }
    },

    removeNodeDb: async (id) => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('nodes').delete().eq('id', id);

        if (error) throw error;

        get().removeNode(id);
      } catch (err) {
        console.error('Error removing node from DB:', err);
      }
    },

    // ---- DB Actions (Checklists) ----

    fetchChecklistItems: async (nodeIds) => {
      if (!nodeIds || nodeIds.length === 0) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('checklist_items')
          .select('*')
          .in('node_id', nodeIds)
          .order('position', { ascending: true });

        if (error) throw error;

        const items = (data || []).map(mapDbToChecklistItem);

        set((state) => {
          // Initialize empty lists
          nodeIds.forEach((nid) => {
            state.checklistItems[nid] = [];
          });
          // Populate list
          items.forEach((item) => {
            if (!state.checklistItems[item.nodeId]) {
              state.checklistItems[item.nodeId] = [];
            }
            state.checklistItems[item.nodeId]?.push(item);
          });
        });
      } catch (err) {
        console.error('Error fetching checklist items:', err);
      }
    },

    addChecklistItemDb: async (nodeId, text) => {
      try {
        const supabase = createClient();
        const id = nanoid();
        const now = new Date().toISOString();
        const currentItems = get().checklistItems[nodeId] || [];
        const position = currentItems.length;

        const { error } = await supabase.from('checklist_items').insert({
          id,
          node_id: nodeId,
          text,
          completed: false,
          position,
          created_at: now,
          updated_at: now,
        });

        if (error) throw error;

        const newItem: ChecklistItem = {
          id,
          nodeId,
          text,
          completed: false,
          position,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          if (!state.checklistItems[nodeId]) {
            state.checklistItems[nodeId] = [];
          }
          state.checklistItems[nodeId].push(newItem);
        });

        // Recalculate node progress
        const updatedItems = [...currentItems, newItem];
        const completedCount = updatedItems.filter((i) => i.completed).length;
        const progress = Math.round((completedCount / updatedItems.length) * 100);

        await get().updateNodeDb(nodeId, { checklistProgress: progress });
      } catch (err) {
        console.error('Error adding checklist item:', err);
      }
    },

    updateChecklistItemDb: async (id, nodeId, updates) => {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();

        const { error } = await supabase
          .from('checklist_items')
          .update({
            ...updates,
            updated_at: now,
          })
          .eq('id', id);

        if (error) throw error;

        set((state) => {
          const items = state.checklistItems[nodeId];
          if (items) {
            const item = items.find((i) => i.id === id);
            if (item) {
              Object.assign(item, updates, { updatedAt: now });
            }
          }
        });

        // Recalculate progress
        const items = get().checklistItems[nodeId] || [];
        const completedCount = items.filter((i) => i.completed).length;
        const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

        await get().updateNodeDb(nodeId, { checklistProgress: progress });
      } catch (err) {
        console.error('Error updating checklist item:', err);
      }
    },

    deleteChecklistItemDb: async (id, nodeId) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('checklist_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => {
          if (state.checklistItems[nodeId]) {
            state.checklistItems[nodeId] = state.checklistItems[nodeId].filter(
              (i) => i.id !== id
            );
          }
        });

        // Recalculate progress
        const items = get().checklistItems[nodeId] || [];
        const completedCount = items.filter((i) => i.completed).length;
        const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

        await get().updateNodeDb(nodeId, { checklistProgress: progress });
      } catch (err) {
        console.error('Error deleting checklist item:', err);
      }
    },

    reorderChecklistItemsDb: async (nodeId, orderedItems) => {
      try {
        const supabase = createClient();

        // Update locally
        set((state) => {
          state.checklistItems[nodeId] = orderedItems;
        });

        // Save position updates to database
        const updates = orderedItems.map((item, idx) => {
          return supabase
            .from('checklist_items')
            .update({ position: idx, updated_at: new Date().toISOString() })
            .eq('id', item.id);
        });

        await Promise.all(updates);
      } catch (err) {
        console.error('Error reordering checklist items:', err);
      }
    },
  })),
);
