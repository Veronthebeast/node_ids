/**
 * Connection (edge) domain types for NodeIDs.
 *
 * @remarks
 * Defines the shape of edges that connect nodes on the canvas.
 * All timestamps are ISO 8601 strings.
 *
 * @packageDocumentation
 */

/** Data payload stored inside an edge. */
export interface ConnectionData extends Record<string, unknown> {
  [key: string]: unknown;
  /** Optional display label rendered along the edge. */
  label?: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
}

/** An edge as it exists on the React Flow canvas. */
export interface CustomEdge {
  /** Unique ID (nanoid). */
  id: string;
  /** ID of the source node. */
  source: string;
  /** ID of the target node. */
  target: string;
  /** Optional specific handle on the source node. */
  sourceHandle?: string;
  /** Optional specific handle on the target node. */
  targetHandle?: string;
  /** React Flow edge type. */
  type: 'smoothstep' | 'default';
  /** Whether the edge has a flow animation. */
  animated?: boolean;
  /** Application data carried by the edge. */
  data?: ConnectionData;
  /** The project this edge belongs to. */
  projectId: string;
}

/** Input type for creating a new edge (system-managed fields omitted). */
export type EdgeCreateInput = Omit<CustomEdge, 'data'> & {
  data?: Omit<ConnectionData, 'createdAt' | 'updatedAt'>;
};
