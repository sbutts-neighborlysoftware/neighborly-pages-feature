/**
 * PagesModule — drop-in component for the Planning module.
 *
 * Usage:
 *   import PagesModule from 'components/Pages/PagesModule';
 *   // Inside your Planning route or tab:
 *   <PagesModule />
 *
 * The component is fully self-contained. State is managed locally via
 * usePagesState. When you're ready to persist to a backend, swap the
 * local setters in usePagesState for API calls.
 */
import React from 'react';
import { Box } from '@mui/material';
import PagesSidebar from './PagesSidebar';
import PageEditor from './PageEditor';
import { usePagesState } from './usePagesState';

export default function PagesModule() {
  const {
    pages,
    activePage,
    activePageId,
    setActivePageId,
    saveStatus,
    expandedIds,
    toggleExpanded,
    updatePageTitle,
    updatePageContent,
    addPage,
    deletePage,
  } = usePagesState();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        bgcolor: '#fff',
        borderRadius: '8px',
        border: '1px solid #E5E9EF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <PagesSidebar
        pages={pages}
        activePageId={activePageId}
        onSelect={setActivePageId}
        onAdd={addPage}
        onDelete={deletePage}
        expandedIds={expandedIds}
        onToggle={toggleExpanded}
      />

      <PageEditor
        page={activePage}
        saveStatus={saveStatus}
        onTitleChange={updatePageTitle}
        onContentChange={updatePageContent}
      />
    </Box>
  );
}
