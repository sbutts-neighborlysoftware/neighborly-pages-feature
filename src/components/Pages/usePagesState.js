/**
 * usePagesState — manages all Pages UI state with real API calls.
 *
 * Strategy:
 *   - Sidebar tree uses PageSummary objects (no content) fetched on mount.
 *   - Full page content is fetched lazily on navigation and cached locally.
 *   - Edits are applied optimistically then flushed to the API via a
 *     1200ms debounce (matching the original auto-save UX).
 *   - On API error the save indicator turns red and the last good state
 *     is preserved in local state.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as pagesApi from './pagesApi';

export const SAVE_STATUS = {
  SAVED:   'saved',
  SAVING:  'saving',
  ERROR:   'error',
};

export function usePagesState() {
  // Flat list of PageSummary objects (populated on mount, kept in sync)
  const [summaries, setSummaries] = useState([]);
  // Cache of full Page objects keyed by id { [id]: Page }
  const [pageCache, setPageCache] = useState({});
  const [activePageId, setActivePageIdRaw] = useState(null);
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.SAVED);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const saveTimerRef = useRef(null);
  // Tracks pending PATCH payloads keyed by page id — coalesced on flush
  const pendingUpdates = useRef({});

  // ── Bootstrap ──────────────────────────────────────────────────────────
  useEffect(() => {
    pagesApi.listPages()
      .then((data) => {
        setSummaries(data);
        if (data.length > 0) setActivePageIdRaw(data[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Derived: the active PageSummary (always available once loaded)
  const activeSummary = summaries.find((s) => s.id === activePageId) ?? null;
  // Derived: full page from cache (may be null until fetched)
  const activePage = activePageId ? (pageCache[activePageId] ?? null) : null;

  // ── Navigation ─────────────────────────────────────────────────────────
  const setActivePageId = useCallback(async (id) => {
    setActivePageIdRaw(id);
    if (!id || pageCache[id]) return;   // already cached

    try {
      const page = await pagesApi.getPage(id);
      setPageCache((prev) => ({ ...prev, [id]: page }));
    } catch (err) {
      setError(err.message);
    }
  }, [pageCache]);

  // ── Auto-save ──────────────────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    setSaveStatus(SAVE_STATUS.SAVING);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      // Flush all pending updates
      const toFlush = { ...pendingUpdates.current };
      pendingUpdates.current = {};

      try {
        await Promise.all(
          Object.entries(toFlush).map(([id, patch]) =>
            pagesApi.updatePage(id, patch).then((summary) => {
              // Keep sidebar summary fresh
              setSummaries((prev) =>
                prev.map((s) => (s.id === id ? { ...s, ...summary } : s))
              );
            })
          )
        );
        setSaveStatus(SAVE_STATUS.SAVED);
      } catch (err) {
        setSaveStatus(SAVE_STATUS.ERROR);
        // Re-queue failed updates so next keystroke retries them
        pendingUpdates.current = { ...toFlush, ...pendingUpdates.current };
      }
    }, 1200);
  }, []);

  // ── Page edits ─────────────────────────────────────────────────────────
  const updatePageTitle = useCallback((id, title) => {
    // Optimistic local update
    setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    setPageCache((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], title } } : prev
    );
    // Queue for API flush
    pendingUpdates.current[id] = { ...pendingUpdates.current[id], title };
    scheduleSave();
  }, [scheduleSave]);

  const updatePageContent = useCallback((id, content) => {
    setPageCache((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], content } } : prev
    );
    pendingUpdates.current[id] = { ...pendingUpdates.current[id], content };
    scheduleSave();
  }, [scheduleSave]);

  // ── Create ─────────────────────────────────────────────────────────────
  const addPage = useCallback(async (parentId = null) => {
    try {
      const newPage = await pagesApi.createPage({ parentId });
      setSummaries((prev) => [...prev, newPage]);
      setPageCache((prev) => ({ ...prev, [newPage.id]: newPage }));
      if (parentId) setExpandedIds((prev) => new Set([...prev, parentId]));
      setActivePageIdRaw(newPage.id);
      return newPage.id;
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────────
  const deletePage = useCallback(async (id) => {
    const target = summaries.find((s) => s.id === id);

    // Optimistic removal
    setSummaries((prev) => prev.filter((s) => s.id !== id));
    setPageCache((prev) => { const next = { ...prev }; delete next[id]; return next; });
    if (activePageId === id) {
      const fallback = summaries.find((s) => s.id !== id);
      setActivePageIdRaw(fallback?.id ?? null);
    }

    try {
      await pagesApi.deletePage(id);
    } catch (err) {
      // Rollback on failure
      setError(err.message);
      if (target) setSummaries((prev) => [...prev, target]);
    }
  }, [summaries, activePageId]);

  // ── Move ───────────────────────────────────────────────────────────────
  const movePage = useCallback(async (id, parentId, sortOrder) => {
    try {
      const updated = await pagesApi.movePage(id, { parentId, sortOrder });
      setSummaries((prev) => {
        const map = Object.fromEntries(updated.map((s) => [s.id, s]));
        return prev.map((s) => map[s.id] ?? s);
      });
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // ── Tree expand/collapse ───────────────────────────────────────────────
  const toggleExpanded = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return {
    // Data
    pages: summaries,         // PageSummary[] for the sidebar tree
    activePage,               // Full Page | null (may be loading)
    activeSummary,            // PageSummary | null (always available)
    activePageId,
    // Status
    loading,
    error,
    saveStatus,
    // Tree UI
    expandedIds,
    toggleExpanded,
    // Actions
    setActivePageId,
    updatePageTitle,
    updatePageContent,
    addPage,
    deletePage,
    movePage,
  };
}
