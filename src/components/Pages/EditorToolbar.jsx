import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  Popover,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import SubscriptIcon from '@mui/icons-material/Subscript';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import FunctionsIcon from '@mui/icons-material/Functions';
import FormatClearIcon from '@mui/icons-material/FormatClear';

const HEADING_OPTIONS = [
  { label: 'Normal', value: 'p', tag: 'p' },
  { label: 'Heading 1', value: 'h1', tag: 'h1' },
  { label: 'Heading 2', value: 'h2', tag: 'h2' },
  { label: 'Heading 3', value: 'h3', tag: 'h3' },
  { label: 'Heading 4', value: 'h4', tag: 'h4' },
];

const ToolbarBtn = ({ title, icon: Icon, onClick, active = false }) => (
  <Tooltip title={title} placement="top" arrow>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        p: '4px',
        borderRadius: '4px',
        color: active ? '#188af4' : '#5A6472',
        bgcolor: active ? 'rgba(24,138,244,0.1)' : 'transparent',
        '&:hover': { bgcolor: 'rgba(24,138,244,0.08)', color: '#188af4' },
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
    </IconButton>
  </Tooltip>
);

const ToolbarDivider = () => (
  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: '6px', borderColor: '#E5E9EF' }} />
);

export default function EditorToolbar({ editorRef }) {
  const [headingValue, setHeadingValue] = useState('p');

  const exec = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const handleHeading = (e) => {
    const val = e.target.value;
    setHeadingValue(val);
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, val);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 0.25,
        px: 2,
        py: '6px',
        borderBottom: '1px solid #E5E9EF',
        bgcolor: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Block format selector */}
      <Select
        value={headingValue}
        onChange={handleHeading}
        size="small"
        variant="outlined"
        sx={{
          height: 28,
          fontSize: 13,
          fontFamily: "'Nunito Sans', sans-serif",
          mr: 0.5,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E9EF' },
          '& .MuiSelect-select': { py: '3px', pr: '24px !important', pl: '8px' },
        }}
      >
        {HEADING_OPTIONS.map((h) => (
          <MenuItem key={h.value} value={h.value} sx={{ fontSize: 13, fontFamily: "'Nunito Sans', sans-serif" }}>
            {h.label}
          </MenuItem>
        ))}
      </Select>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarBtn title="Bold (Ctrl+B)" icon={FormatBoldIcon} onClick={() => exec('bold')} />
      <ToolbarBtn title="Italic (Ctrl+I)" icon={FormatItalicIcon} onClick={() => exec('italic')} />
      <ToolbarBtn title="Underline (Ctrl+U)" icon={FormatUnderlinedIcon} onClick={() => exec('underline')} />
      <ToolbarBtn title="Strikethrough" icon={StrikethroughSIcon} onClick={() => exec('strikeThrough')} />
      <ToolbarBtn title="Subscript" icon={SubscriptIcon} onClick={() => exec('subscript')} />
      <ToolbarBtn title="Superscript" icon={SuperscriptIcon} onClick={() => exec('superscript')} />

      <ToolbarDivider />

      {/* Color */}
      <ToolbarBtn title="Text color" icon={FormatColorTextIcon} onClick={() => exec('foreColor', '#188af4')} />
      <ToolbarBtn title="Highlight" icon={FormatColorFillIcon} onClick={() => exec('hiliteColor', '#FFF3CD')} />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarBtn title="Bullet list" icon={FormatListBulletedIcon} onClick={() => exec('insertUnorderedList')} />
      <ToolbarBtn title="Numbered list" icon={FormatListNumberedIcon} onClick={() => exec('insertOrderedList')} />
      <ToolbarBtn title="Indent" icon={FormatIndentIncreaseIcon} onClick={() => exec('indent')} />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarBtn title="Align left" icon={FormatAlignLeftIcon} onClick={() => exec('justifyLeft')} />
      <ToolbarBtn title="Align center" icon={FormatAlignCenterIcon} onClick={() => exec('justifyCenter')} />
      <ToolbarBtn title="Align right" icon={FormatAlignRightIcon} onClick={() => exec('justifyRight')} />
      <ToolbarBtn title="Justify" icon={FormatAlignJustifyIcon} onClick={() => exec('justifyFull')} />

      <ToolbarDivider />

      {/* Block types */}
      <ToolbarBtn title="Blockquote" icon={FormatQuoteIcon} onClick={() => exec('formatBlock', 'blockquote')} />
      <ToolbarBtn title="Code block" icon={CodeIcon} onClick={() => exec('formatBlock', 'pre')} />

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarBtn title="Insert link" icon={InsertLinkIcon} onClick={() => {
        const url = window.prompt('Enter URL');
        if (url) exec('createLink', url);
      }} />
      <ToolbarBtn title="Insert image" icon={ImageOutlinedIcon} onClick={() => {
        const url = window.prompt('Enter image URL');
        if (url) exec('insertImage', url);
      }} />
      <ToolbarBtn title="Insert table" icon={TableChartOutlinedIcon} onClick={() => {
        exec('insertHTML',
          '<table style="border-collapse:collapse;width:100%"><tr>' +
          '<td style="border:1px solid #E5E9EF;padding:8px">Cell</td>' +
          '<td style="border:1px solid #E5E9EF;padding:8px">Cell</td>' +
          '</tr><tr>' +
          '<td style="border:1px solid #E5E9EF;padding:8px">Cell</td>' +
          '<td style="border:1px solid #E5E9EF;padding:8px">Cell</td>' +
          '</tr></table>'
        );
      }} />
      <ToolbarBtn title="Formula" icon={FunctionsIcon} onClick={() => {
        const formula = window.prompt('Enter formula or expression');
        if (formula) exec('insertHTML', `<code style="background:#F0F2F5;padding:2px 6px;border-radius:4px;font-family:monospace">${formula}</code>`);
      }} />

      <ToolbarDivider />

      <ToolbarBtn title="Clear formatting" icon={FormatClearIcon} onClick={() => exec('removeFormat')} />
    </Box>
  );
}
