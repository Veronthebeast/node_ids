/**
 * Checklist domain types for NodeIDs.
 *
 * @remarks
 * Defines checklist items that belong to a canvas node.
 * Items can be reordered via the `position` field.
 * All timestamps are ISO 8601 strings.
 *
 * @packageDocumentation
 */

/** A single checklist item attached to a node. */
export interface ChecklistItem {
  /** Unique ID (nanoid). */
  id: string;
  /** ID of the parent node. */
  nodeId: string;
  /** Display text for the checklist item. */
  text: string;
  /** Whether the item is checked off. */
  completed: boolean;
  /** Ordinal position for drag-drop reordering (0-based). */
  position: number;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
}

/** Input type for creating a new checklist item (system-managed fields omitted). */
export type ChecklistItemCreateInput = Omit<
  ChecklistItem,
  'id' | 'createdAt' | 'updatedAt' | 'position'
>;

/** Input type for updating a checklist item (partial, mutable fields only). */
export type ChecklistItemUpdateInput = Partial<
  Pick<ChecklistItem, 'text' | 'completed' | 'position'>
>;
