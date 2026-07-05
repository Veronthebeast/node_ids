/**
 * Project domain types for NodeIDs.
 *
 * @remarks
 * A project is the top-level organisational unit that owns nodes,
 * edges, and canvas state. All timestamps are ISO 8601 strings.
 *
 * @packageDocumentation
 */

/** A NodeIDs project. */
export interface Project {
  /** Unique ID (nanoid). */
  id: string;
  /** Display name of the project. */
  name: string;
  /** Longer description of the project's purpose. */
  description: string;
  /** ID of the user who owns this project. */
  ownerId: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
}

/** Input type for creating a new project (system-managed fields omitted). */
export type ProjectCreateInput = Pick<Project, 'name' | 'description'>;

/** Input type for updating a project (partial, mutable fields only). */
export type ProjectUpdateInput = Partial<Pick<Project, 'name' | 'description'>>;
