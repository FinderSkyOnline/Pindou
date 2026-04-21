import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App.tsx';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4FC3F7', light: '#81D4FA', dark: '#0288D1' },
    secondary: { main: '#80CBC4' },
    background: { default: '#0E1117', paper: '#161B27' },
    error: { main: '#CF6679' },
    divider: 'rgba(255,255,255,0.08)',
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Roboto", system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 50, paddingInline: 20, paddingBlock: 8 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)' },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
