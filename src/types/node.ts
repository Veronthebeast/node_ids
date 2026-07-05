/**
 * Node domain types for NodeIDs.
 *
 * @remarks
 * Defines the shape of nodes on the canvas — their data payload,
 * priority levels, and input/output types for create/update operations.
 * All timestamps are ISO 8601 strings.
 *
 * @packageDocumentation
 */

/** Priority level for a node. */
export type NodePriority = 'low' | 'medium' | 'high' | 'urgent';

/** Data payload stored inside every canvas node. */
export interface NodeData extends Record<string, unknown> {
  /** Display title of the node. */
  title: string;
  /** Longer description shown in the node body. */
  description: string;
  /** Free-form notes (markdown-like). */
  notes: string;
  /** Hex colour for the node border/accent. */
  color: string;
  /** Priority ranking. */
  priority: NodePriority;
  /** User-defined labels for filtering/grouping. */
  tags: string[];
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
  /** Checklist completion percentage (0–100). */
  checklistProgress: number;
}

/** A node as it exists on the React Flow canvas. */
export interface CustomNode {
  /** Unique ID (nanoid). */
  id: string;
  /** React Flow node type discriminator. */
  type: 'customNode';
  /** Position in canvas coordinates. */
  position: { x: number; y: number };
  /** Application data carried by the node. */
  data: NodeData;
  /** The project this node belongs to. */
  projectId: string;
}

/** Input type for creating a new node (system-managed fields omitted). */
export type NodeCreateInput = Omit<CustomNode, 'id' | 'data'> & {
  data: Omit<NodeData, 'createdAt' | 'updatedAt' | 'checklistProgress'>;
};

/** Input type for updating an existing node (partial, mutable fields only). */
export type NodeUpdateInput = Partial<Omit<NodeData, 'createdAt' | 'updatedAt'>>;
