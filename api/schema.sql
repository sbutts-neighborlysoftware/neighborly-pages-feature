-- ============================================================
-- Pages Feature — Database Schema
-- Compatible with SQL Server (Neighborly Software standard)
-- ============================================================

-- Pages are scoped to a grantee organization (tenant isolation
-- matches the existing pattern used across Programs, Cases, etc.)

CREATE TABLE [planning].[Pages] (
    [Id]             UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWSEQUENTIALID(),
    [OrganizationId] INT               NOT NULL,  -- FK to existing Organizations table
    [ParentId]       UNIQUEIDENTIFIER  NULL,       -- NULL = root-level page
    [Title]          NVARCHAR(512)     NOT NULL DEFAULT 'Untitled',
    [Content]        NVARCHAR(MAX)     NULL,       -- HTML from the editor
    [SortOrder]      INT               NOT NULL DEFAULT 0,
    [CreatedBy]      INT               NOT NULL,  -- FK to Users.Id
    [UpdatedBy]      INT               NOT NULL,
    [CreatedAt]      DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt]      DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [DeletedAt]      DATETIMEOFFSET    NULL,       -- soft delete; NULL = active

    CONSTRAINT [PK_Pages]            PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Pages_Parent]     FOREIGN KEY ([ParentId])       REFERENCES [planning].[Pages]([Id]),
    CONSTRAINT [FK_Pages_Org]        FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations]([Id]),
    CONSTRAINT [FK_Pages_CreatedBy]  FOREIGN KEY ([CreatedBy])      REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_Pages_UpdatedBy]  FOREIGN KEY ([UpdatedBy])      REFERENCES [dbo].[Users]([Id])
);

-- Index for the most common query: all active pages for an org
CREATE NONCLUSTERED INDEX [IX_Pages_Org_Active]
    ON [planning].[Pages] ([OrganizationId], [DeletedAt])
    INCLUDE ([Id], [ParentId], [Title], [SortOrder], [UpdatedAt]);

-- Index for tree traversal (fetch children of a parent)
CREATE NONCLUSTERED INDEX [IX_Pages_Parent]
    ON [planning].[Pages] ([ParentId])
    WHERE [DeletedAt] IS NULL;


-- ── Page Shares ────────────────────────────────────────────────────────────
-- Tracks explicit share links and per-user permissions.
-- Initially: owner = full control; shared = view-only (expandable later).

CREATE TABLE [planning].[PageShares] (
    [Id]          UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWSEQUENTIALID(),
    [PageId]      UNIQUEIDENTIFIER  NOT NULL,
    [SharedWith]  INT               NULL,       -- NULL = public link share
    [Token]       NVARCHAR(64)      NULL,       -- opaque token for link shares
    [Permission]  NVARCHAR(32)      NOT NULL DEFAULT 'View',  -- 'View' | 'Edit'
    [CreatedBy]   INT               NOT NULL,
    [CreatedAt]   DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [ExpiresAt]   DATETIMEOFFSET    NULL,

    CONSTRAINT [PK_PageShares]       PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PageShares_Page]  FOREIGN KEY ([PageId])     REFERENCES [planning].[Pages]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PageShares_User]  FOREIGN KEY ([SharedWith]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [UQ_PageShares_Token] UNIQUE ([Token])
);
