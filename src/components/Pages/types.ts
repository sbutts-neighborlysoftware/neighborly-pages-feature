// ── Shared user reference ──────────────────────────────────────────────────
export interface UserRef {
  id: number;
  name: string;
  avatar: string | null;
}

// ── Page shapes ────────────────────────────────────────────────────────────

/** Lightweight — used for the sidebar tree (no content blob). */
export interface PageSummary {
  id: string;
  title: string;
  parentId: string | null;
  sortOrder: number;
  updatedAt: string;      // ISO-8601
  updatedBy: UserRef;
}

/** Full page — fetched on demand when the user navigates to a page. */
export interface Page extends PageSummary {
  content: string;        // Sanitized HTML
  createdAt: string;
  createdBy: UserRef;
}

// ── Request shapes ─────────────────────────────────────────────────────────

export interface CreatePageRequest {
  title?: string;         // defaults to 'Untitled' server-side
  parentId?: string | null;
  content?: string;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
}

export interface MovePageRequest {
  parentId: string | null;
  sortOrder: number;
}

export interface SharePageRequest {
  userId?: number;        // omit for a link share
  permission: 'View' | 'Edit';
  expiresAt?: string | null;
}

// ── Share ─────────────────────────────────────────────────────────────────

export interface ShareResponse {
  id: string;
  token: string | null;
  shareUrl: string | null;
  permission: 'View' | 'Edit';
  expiresAt: string | null;
}

// ── Local-only UI state (not persisted) ───────────────────────────────────

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

/** Client-side tree node (PageSummary + resolved children). */
export interface PageTreeNode extends PageSummary {
  children: PageTreeNode[];
}
