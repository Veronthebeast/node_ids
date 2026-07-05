/**
 * Canvas state and viewport types for NodeIDs.
 *
 * @remarks
 * Describes the runtime state of the React Flow canvas — current viewport,
 * selection, and interaction flags.  Also provides serialisable snapshot
 * types for the undo/redo history stack.
 *
 * @packageDocumentation
 */

import type { Viewport } from '@xyflow/react';

/** Runtime state of the React Flow canvas. */
export interface CanvasState {
  /** Current viewport (x, y, zoom). */
  viewport: Viewport;
  /** IDs of currently selected nodes. */
  selectedNodeIds: string[];
  /** IDs of currently selected edges. */
  selectedEdgeIds: string[];
  /** Whether the user is currently dragging on the canvas. */
  isDragging: boolean;
  /** Whether the user is currently drawing a connection. */
  isConnecting: boolean;
}

/** A serialised snapshot of canvas state for the undo/redo stack. */
export interface CanvasHistoryEntry {
  /** Serialised node state at the point of capture. */
  nodes: unknown[];
  /** Serialised edge state at the point of capture. */
  edges: unknown[];
  /** Epoch milliseconds when the snapshot was taken. */
  timestamp: number;
}

/** Lightweight viewport descriptor (serialisable). */
export interface CanvasViewport {
  /** Horizontal scroll offset. */
  x: number;
  /** Vertical scroll offset. */
  y: number;
  /** Zoom level (1 = 100%). */
  zoom: number;
}
