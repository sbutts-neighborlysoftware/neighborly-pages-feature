# Pages API Contract

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | SQL Server DDL — two tables: `planning.Pages` + `planning.PageShares` |
| `openapi.yaml` | Full OpenAPI 3.1 spec — import into Swagger UI or Postman |
| `../src/components/Pages/types.ts` | TypeScript types (frontend) |
| `../src/components/Pages/pagesApi.ts` | Fetch wrapper — one function per endpoint |
| `../src/components/Pages/usePagesState.js` | React hook — wires API to UI state |

---

## Endpoints at a glance

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/planning/pages` | List all pages (summaries only, no content) |
| `POST` | `/api/planning/pages` | Create a page |
| `GET` | `/api/planning/pages/:id` | Get full page content |
| `PATCH` | `/api/planning/pages/:id` | Auto-save title / content |
| `DELETE` | `/api/planning/pages/:id` | Soft-delete (re-parents children) |
| `PATCH` | `/api/planning/pages/:id/move` | Reorder / reparent |
| `GET` | `/api/planning/pages/:id/shares` | List shares |
| `POST` | `/api/planning/pages/:id/shares` | Create share (user or link) |
| `DELETE` | `/api/planning/pages/shares/:shareId` | Revoke share |

---

## Key design decisions

### Two-shape pattern (Summary vs Full)
`GET /pages` returns `PageSummary` objects — title, parentId, sortOrder, updatedAt — with **no content blob**. Full HTML content is only sent on `GET /pages/:id`. This keeps the sidebar fast regardless of how large individual pages grow.

### Tenant isolation in the server, not the URL
`OrganizationId` is resolved server-side from the authenticated user's JWT claim. It is never accepted as a query param or request body field, preventing cross-tenant reads.

### Soft deletes + child re-parenting
`DELETE /pages/:id` sets `DeletedAt` rather than hard-deleting. The server also re-parents any direct children to the deleted page's parent in the same transaction, so the tree never has orphaned nodes. Hard deletes (cascade) can be added in a scheduled cleanup job later.

### Optimistic UI + coalesced saves
The frontend hook applies title/content changes to local state immediately (so the editor never lags), then debounces PATCH calls at 1200ms. Multiple rapid edits to the same page are coalesced into a single PATCH payload before hitting the network.

### SortOrder gaps
SortOrder is an integer, not a dense sequence. The server recalculates siblings' SortOrder values in the `PATCH /move` transaction to maintain a clean sequence. Clients should never assume SortOrder is contiguous.

---

## Backend implementation notes

- Sanitize HTML content server-side (e.g. **HtmlSanitizer** NuGet package) before storing — the editor sends raw `contenteditable` HTML.
- Add a `DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()` trigger or EF interceptor to keep `UpdatedAt` current on every PATCH.
- The `planning` schema matches the existing module namespace pattern in Neighborly Software.
- `PageShares.Token` for link shares should be generated as a cryptographically random 32-byte base64url string server-side.
