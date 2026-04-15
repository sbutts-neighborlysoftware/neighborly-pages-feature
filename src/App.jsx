import React from 'react';
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PagesModule from './components/Pages/PagesModule';

const theme = createTheme({
  palette: {
    primary:   { main: '#188af4', dark: '#1278d8' },
    secondary: { main: '#00419D' },
    background:{ default: '#F5F7FA' },
    text:      { primary: '#181B1F', secondary: '#5A6472' },
  },
  typography: {
    fontFamily: "'Nunito Sans', 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton:  { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 12 } } },
  },
});

// Minimal shell that mimics the Planning module chrome
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F5F7FA' }}>
        {/* Simulated top nav */}
        <Box sx={{
          height: 48, bgcolor: '#fff', borderBottom: '1px solid #E5E9EF',
          display: 'flex', alignItems: 'center', px: 2, gap: 0.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
          <Box sx={{
            width: 32, height: 32, bgcolor: '#00419D', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16, mr: 1.5,
          }}>N</Box>
          {['Dashboard', 'Programs', 'Cases', 'Finance'].map((item) => (
            <Typography key={item} sx={{
              px: 1.5, py: 0.75, fontSize: 13, fontWeight: 500,
              color: '#5A6472', borderRadius: '6px', cursor: 'pointer',
              '&:hover': { bgcolor: '#F5F7FA' },
            }}>{item}</Typography>
          ))}
          <Typography sx={{
            px: 1.5, py: 0.75, fontSize: 13, fontWeight: 600,
            color: '#188af4', borderRadius: '6px', cursor: 'pointer',
          }}>Planning ▾</Typography>
        </Box>

        {/* Pages module */}
        <Box sx={{ flex: 1, overflow: 'hidden', p: 1.5 }}>
          <PagesModule />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
