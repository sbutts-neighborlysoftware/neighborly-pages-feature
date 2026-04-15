import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Chip,
  Tooltip,
  IconButton,
  Avatar,
  AvatarGroup,
  Button,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditorToolbar from './EditorToolbar';
import { SAVE_STATUS } from './usePagesState';

function SaveIndicator({ status }) {
  if (status === SAVE_STATUS.SAVING) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#9AA4AD', fontSize: 13 }}>
        <AutorenewIcon sx={{ fontSize: 15, animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
        <Typography sx={{ fontSize: 13, color: '#9AA4AD', fontFamily: "'Nunito Sans', sans-serif" }}>Saving…</Typography>
      </Box>
    );
  }
  if (status === SAVE_STATUS.SAVED) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#188af4' }} />
        <Typography sx={{ fontSize: 13, color: '#188af4', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 500 }}>Saved</Typography>
      </Box>
    );
  }
  return null;
}

// Mock collaborator avatars (replace with real user data)
const MOCK_COLLABORATORS = [
  { id: 'u1', initials: 'U1', color: '#188af4' },
  { id: 'u2', initials: 'U2', color: '#00419D' },
];

export default function PageEditor({ page, saveStatus, onTitleChange, onContentChange }) {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Sync content into editor when page changes (navigation)
  useEffect(() => {
    if (!editorRef.current || !page) return;
    isInitialLoad.current = true;
    editorRef.current.innerHTML = page.content ?? '';
    isInitialLoad.current = false;
  }, [page?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContentInput = useCallback(() => {
    if (!editorRef.current || !page) return;
    onContentChange(page.id, editorRef.current.innerHTML);
  }, [page, onContentChange]);

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editorRef.current?.focus();
    }
  };

  if (!page) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA4AD' }}>
        <Typography sx={{ fontFamily: "'Nunito Sans', sans-serif" }}>Select a page to get started</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
      {/* Page header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 1,
          borderBottom: '1px solid #E5E9EF',
          gap: 2,
          minHeight: 48,
        }}
      >
        {/* Breadcrumb title */}
        <InputBase
          value={page.title}
          onChange={(e) => onTitleChange(page.id, e.target.value)}
          onKeyDown={handleTitleKeyDown}
          inputRef={titleRef}
          sx={{
            flex: 0,
            minWidth: 80,
            maxWidth: 320,
            fontFamily: "'Nunito Sans', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: '#181B1F',
            '& input': { p: 0 },
          }}
        />

        <Box sx={{ flex: 1 }} />

        {/* Save status */}
        <SaveIndicator status={saveStatus} />

        {/* Collaborators */}
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 11, fontWeight: 700 } }}>
          {MOCK_COLLABORATORS.map((u) => (
            <Tooltip key={u.id} title={`User ${u.initials}`}>
              <Avatar sx={{ bgcolor: u.color, width: 26, height: 26, fontSize: 11 }}>{u.initials}</Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>

        {/* Share */}
        <Button
          startIcon={<ShareOutlinedIcon sx={{ fontSize: 16 }} />}
          variant="text"
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: 13,
            fontFamily: "'Nunito Sans', sans-serif",
            fontWeight: 500,
            color: '#5A6472',
            '&:hover': { color: '#188af4', bgcolor: 'rgba(24,138,244,0.06)' },
          }}
        >
          Share
        </Button>
      </Box>

      {/* Formatting toolbar */}
      <EditorToolbar editorRef={editorRef} />

      {/* Editable content area */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 3, md: 8 }, py: 4 }}>
        {/* Large inline title */}
        <InputBase
          value={page.title}
          onChange={(e) => onTitleChange(page.id, e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          multiline
          fullWidth
          sx={{
            mb: 1,
            '& textarea': {
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: '#181B1F',
              lineHeight: 1.3,
              p: 0,
              resize: 'none',
            },
          }}
        />

        {/* Rich text editor */}
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          sx={{
            minHeight: 400,
            outline: 'none',
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: 15,
            color: '#181B1F',
            lineHeight: 1.7,
            '& h1': { fontSize: 26, fontWeight: 700, color: '#0a2a5e', mt: 3, mb: 1, lineHeight: 1.3 },
            '& h2': { fontSize: 22, fontWeight: 700, color: '#0a2a5e', mt: 2.5, mb: 1, lineHeight: 1.35 },
            '& h3': { fontSize: 18, fontWeight: 600, color: '#0a2a5e', mt: 2, mb: 0.75 },
            '& h4': { fontSize: 15, fontWeight: 600, color: '#3D4552', mt: 1.5, mb: 0.5 },
            '& p': { my: 0.75 },
            '& ul, & ol': { pl: 3, my: 1 },
            '& li': { mb: 0.25 },
            '& blockquote': {
              borderLeft: '3px solid #188af4',
              pl: 2,
              ml: 0,
              color: '#5A6472',
              fontStyle: 'italic',
              my: 1.5,
            },
            '& pre': {
              bgcolor: '#F0F2F5',
              borderRadius: '6px',
              p: 2,
              fontFamily: 'monospace',
              fontSize: 13,
              overflowX: 'auto',
              my: 1.5,
            },
            '& code': {
              bgcolor: '#F0F2F5',
              px: '5px',
              py: '1px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: 13,
            },
            '& a': { color: '#188af4', textDecoration: 'underline' },
            '& table': { borderCollapse: 'collapse', width: '100%', my: 1.5 },
            '& td, & th': { border: '1px solid #E5E9EF', p: 1, fontSize: 14 },
            '& th': { bgcolor: '#F5F7FA', fontWeight: 600 },
            '& img': { maxWidth: '100%', borderRadius: '6px', my: 1 },
          }}
        />
      </Box>
    </Box>
  );
}
