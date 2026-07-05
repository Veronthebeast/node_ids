/**
 * App-wide constants for NodeIDs.
 *
 * @packageDocumentation
 */

/** Application name used in metadata and UI. */
export const APP_NAME = 'NodeIDs';

/** Short tagline displayed in marketing / landing contexts. */
export const APP_TAGLINE = 'Professional infinite whiteboard';

/** Default page size for paginated queries. */
export const DEFAULT_PAGE_SIZE = 50;

/** Minimum panel width in pixels (left & right sidebars). */
export const MIN_PANEL_WIDTH = 240;

/** Maximum panel width in pixels. */
export const MAX_PANEL_WIDTH = 480;

/** Default panel width in pixels. */
export const DEFAULT_PANEL_WIDTH = 300;

/** Maximum number of undo/redo history entries. */
export const MAX_HISTORY = 50;

/** How long (ms) before TanStack Query considers data stale. */
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes

/** How long (ms) unused query data is kept in cache. */
export const QUERY_GC_TIME = 1000 * 60 * 30; // 30 minutes

/** Maximum retry count for failed queries. */
export const QUERY_RETRY_COUNT = 1;

/** Supported node types. */
export const NODE_TYPES = ['note', 'task', 'mindmap'] as const;

/** Priority levels in ascending order. */
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'] as const;

/** Default node color. */
export const DEFAULT_NODE_COLOR = '#6366f1';

/** Default canvas zoom limits. */
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 4;
export const ZOOM_DEFAULT = 1;
