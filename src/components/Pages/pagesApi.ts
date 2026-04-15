/**
 * pagesApi — thin fetch wrapper for the Pages REST API.
 *
 * Assumes your app already has a global `apiClient` (or axios instance) that:
 *   - Injects the Authorization header from the auth store
 *   - Handles 401 → redirect to login
 *
 * If your project uses axios, swap `request()` for `apiClient.get/post/...`
 * and remove the manual JSON handling.
 */

import type {
  Page,
  PageSummary,
  CreatePageRequest,
  UpdatePageRequest,
  MovePageRequest,
  SharePageRequest,
  ShareResponse,
} from './types';

const BASE = '/api/planning/pages';

// ── Internal fetch helper ──────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: replace with your auth token injection pattern
      // e.g. Authorization: `Bearer ${getToken()}`
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(error.message ?? 'API error'), {
      status: res.status,
      code: error.code,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Pages API ──────────────────────────────────────────────────────────────

/**
 * Fetch all PageSummary objects for the sidebar tree.
 * Call once on mount; re-call after create/delete/move.
 */
export async function listPages(): Promise<PageSummary[]> {
  return request<PageSummary[]>(BASE);
}

/**
 * Fetch a single page with full content.
 * Call when the user navigates to a page.
 */
export async function getPage(id: string): Promise<Page> {
  return request<Page>(`${BASE}/${id}`);
}

/**
 * Create a new page. Returns the full Page object.
 */
export async function createPage(data: CreatePageRequest = {}): Promise<Page> {
  return request<Page>(BASE, {
    method: 'POST',
    body: JSON.stringify({ title: 'Untitled', content: '', ...data }),
  });
}

/**
 * Auto-save endpoint — debounce calls in the editor before invoking.
 * Returns a PageSummary (lighter than full Page) to refresh the sidebar.
 */
export async function updatePage(
  id: string,
  data: UpdatePageRequest
): Promise<PageSummary> {
  return request<PageSummary>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Soft-delete a page. The server re-parents orphaned children.
 */
export async function deletePage(id: string): Promise<void> {
  return request<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

/**
 * Move a page to a new parent or reorder among siblings.
 * Returns all affected PageSummary objects so the caller can
 * update the local tree without re-fetching everything.
 */
export async function movePage(
  id: string,
  data: MovePageRequest
): Promise<PageSummary[]> {
  return request<PageSummary[]>(`${BASE}/${id}/move`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Shares API ─────────────────────────────────────────────────────────────

export async function listShares(pageId: string): Promise<ShareResponse[]> {
  return request<ShareResponse[]>(`${BASE}/${pageId}/shares`);
}

export async function sharePage(
  pageId: string,
  data: SharePageRequest
): Promise<ShareResponse> {
  return request<ShareResponse>(`${BASE}/${pageId}/shares`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function revokeShare(shareId: string): Promise<void> {
  return request<void>(`/api/planning/pages/shares/${shareId}`, {
    method: 'DELETE',
  });
}
