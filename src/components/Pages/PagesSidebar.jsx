import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { buildPageTree } from './pagesData';

function PageTreeItem({ node, depth = 0, activePageId, onSelect, onAdd, onDelete, expandedIds, onToggle }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const hasChildren = node.children?.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isActive = node.id === activePageId;

  const handleContextMenu = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: `${12 + depth * 14}px`,
          pr: 1,
          py: '3px',
          cursor: 'pointer',
          borderRadius: '6px',
          mx: '6px',
          bgcolor: isActive ? 'rgba(24,138,244,0.10)' : 'transparent',
          borderLeft: isActive ? '2px solid #188af4' : '2px solid transparent',
          '&:hover': { bgcolor: isActive ? 'rgba(24,138,244,0.12)' : 'rgba(0,0,0,0.04)' },
          '&:hover .page-actions': { opacity: 1 },
          transition: 'background 0.1s',
          group: true,
        }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand toggle */}
        <Box sx={{ width: 18, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {hasChildren ? (
            <IconButton
              size="small"
              sx={{ p: 0, color: '#9AA4AD', '&:hover': { color: '#181B1F' } }}
              onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            >
              {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ChevronRightIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          ) : null}
        </Box>

        {/* Icon */}
        <Box sx={{ color: isActive ? '#188af4' : '#9AA4AD', mr: 0.75, display: 'flex', flexShrink: 0 }}>
          {hasChildren
            ? <FolderOutlinedIcon sx={{ fontSize: 15 }} />
            : <ArticleOutlinedIcon sx={{ fontSize: 15 }} />
          }
        </Box>

        {/* Title */}
        <Typography
          noWrap
          sx={{
            flex: 1,
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#0a2a5e' : '#3D4552',
            lineHeight: '22px',
            fontFamily: "'Nunito Sans', sans-serif",
          }}
        >
          {node.title || 'Untitled'}
        </Typography>

        {/* Actions (visible on hover) */}
        <Box className="page-actions" sx={{ opacity: 0, display: 'flex', ml: 0.5, transition: 'opacity 0.1s' }}>
          <Tooltip title="Add subpage" placement="top">
            <IconButton size="small" sx={{ p: '2px', color: '#9AA4AD' }} onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}>
              <AddIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" sx={{ p: '2px', color: '#9AA4AD' }} onClick={handleContextMenu}>
            <MoreHorizIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 160 } } }}
      >
        <MenuItem onClick={() => { onAdd(node.id); setMenuAnchor(null); }} dense>
          <ListItemIcon><AddCircleOutlineIcon fontSize="small" /></ListItemIcon>
          Add subpage
        </MenuItem>
        <MenuItem
          onClick={() => { onDelete(node.id); setMenuAnchor(null); }}
          dense
          sx={{ color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }}
        >
          <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Children */}
      {hasChildren && (
        <Collapse in={isExpanded} timeout={150} unmountOnExit>
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activePageId={activePageId}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </Collapse>
      )}
    </>
  );
}

export default function PagesSidebar({ pages, activePageId, onSelect, onAdd, onDelete, expandedIds, onToggle }) {
  const tree = buildPageTree(pages);

  return (
    <Box
      sx={{
        width: 220,
        minWidth: 220,
        borderRight: '1px solid #E5E9EF',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 2, pb: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={() => onAdd(null)}
          sx={{
            bgcolor: '#188af4',
            borderRadius: '8px',
            textTransform: 'none',
            fontFamily: "'Nunito Sans', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            boxShadow: '0 2px 4px rgba(24,138,244,0.25)',
            '&:hover': { bgcolor: '#1278d8' },
          }}
        >
          New Page
        </Button>
      </Box>

      {/* Tree */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
        {tree.map((node) => (
          <PageTreeItem
            key={node.id}
            node={node}
            activePageId={activePageId}
            onSelect={onSelect}
            onAdd={onAdd}
            onDelete={onDelete}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
      </Box>
    </Box>
  );
}
