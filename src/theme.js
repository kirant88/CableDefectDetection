// src/theme.js
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#2563eb', dark: '#1e40af', light: '#60a5fa' },
            secondary: { main: '#7c3aed', dark: '#5b21b6', light: '#a78bfa' },
            background: { default: '#f8fafc', paper: '#ffffff' },
            success: { main: '#10b981' },
            warning: { main: '#f59e0b' },
            error: { main: '#ef4444' },
            info: { main: '#06b6d4' },
          }
        : {
            primary: { main: '#3b82f6', dark: '#1e40af', light: '#60a5fa' },
            secondary: { main: '#8b5cf6', dark: '#6d28d9', light: '#a78bfa' },
            background: { default: '#0f172a', paper: '#1e293b' },
            success: { main: '#10b981' },
            warning: { main: '#f59e0b' },
            error: { main: '#ef4444' },
            info: { main: '#06b6d4' },
          }),
    },
    typography: {
      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
      h4: {
        fontSize: '2rem',
        fontWeight: 600,
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h5: {
        fontSize: '1.5rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1.25rem',
        },
      },
      h6: {
        fontSize: '1.25rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      body1: {
        fontSize: '1rem',
        '@media (max-width:600px)': {
          fontSize: '0.875rem',
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 500,
            '@media (max-width:600px)': {
              fontSize: '0.75rem',
              padding: '6px 12px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            '@media (max-width:600px)': {
              fontSize: '0.75rem',
              height: '24px',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              padding: '6px',
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              minWidth: '120px !important',
            },
          },
        },
      },
    },
  });
