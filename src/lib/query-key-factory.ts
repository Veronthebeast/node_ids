/**
 * TanStack Query key factory for NodeIDs.
 *
 * @remarks
 * Centralised, type-safe query key definitions that stay in sync across
 * query hooks and mutation invalidations.  Each domain exports a nested
 * set of factory functions returning `readonly` tuple keys.
 *
 * Usage:
 * ```typescript
 * queryKeys.projects.all          // → ['projects']
 * queryKeys.projects.byId(id)     // → ['projects', id]
 * queryKeys.nodes.all(projectId)  // → ['projects', projectId, 'nodes']
 * ```
 *
 * @packageDocumentation
 */

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    byId: (id: string) => ['projects', id] as const,
  },
  nodes: {
    all: (projectId: string) => ['projects', projectId, 'nodes'] as const,
    byId: (projectId: string, nodeId: string) =>
      ['projects', projectId, 'nodes', nodeId] as const,
  },
  edges: {
    all: (projectId: string) => ['projects', projectId, 'edges'] as const,
  },
  checklistItems: {
    all: (nodeId: string) => ['nodes', nodeId, 'checklist'] as const,
  },
} as const;
