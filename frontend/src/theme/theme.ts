import { alpha, createTheme } from '@mui/material/styles';

const navy = '#0f172a';
const slate = '#1e293b';
const indigo = '#4f46e5';
const indigoDark = '#3730a3';
const teal = '#0d9488';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: indigo,
      dark: indigoDark,
      light: '#818cf8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: teal,
      dark: '#0f766e',
      light: '#2dd4bf',
      contrastText: '#ffffff'
    },
    success: { main: '#059669', light: '#d1fae5', dark: '#047857' },
    warning: { main: '#d97706', light: '#fef3c7', dark: '#b45309' },
    error: { main: '#dc2626', light: '#fee2e2', dark: '#b91c1c' },
    info: { main: '#0284c7', light: '#e0f2fe', dark: '#0369a1' },
    text: {
      primary: navy,
      secondary: '#64748b'
    },
    divider: '#e2e8f0',
    background: {
      default: '#f4f6fb',
      paper: '#ffffff'
    }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['"Plus Jakarta Sans"', 'Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 700, letterSpacing: '-0.02em', color: navy },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, letterSpacing: '0.01em' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${alpha(navy, 0.25)} transparent`,
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(navy, 0.2),
            borderRadius: 8
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid',
          borderColor: alpha(navy, 0.08),
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)',
          backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fafbfe 100%)'
        }
      }
    },
    MuiButton: {
      defaultProps: { variant: 'contained', disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          padding: '8px 18px'
        },
        contained: {
          boxShadow: `0 1px 2px ${alpha(indigo, 0.2)}`
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5 }
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#ffffff'
          }
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.8125rem',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: '#475569',
            backgroundColor: alpha(navy, 0.03),
            borderBottom: `2px solid ${alpha(navy, 0.08)}`,
            whiteSpace: 'nowrap'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
          '&.MuiTableRow-hover:hover': {
            backgroundColor: alpha(indigo, 0.04)
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: alpha(navy, 0.06),
          padding: '14px 16px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
        colorSuccess: {
          backgroundColor: alpha('#059669', 0.12),
          color: '#047857'
        },
        colorWarning: {
          backgroundColor: alpha('#d97706', 0.12),
          color: '#b45309'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid',
          borderColor: alpha(navy, 0.08),
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.125rem',
          paddingBottom: 8
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginBottom: 4,
          padding: '10px 14px',
          '&.Mui-selected': {
            backgroundColor: alpha(indigo, 0.18),
            color: '#c7d2fe',
            '&:hover': { backgroundColor: alpha(indigo, 0.24) },
            '& .MuiListItemIcon-root': { color: '#a5b4fc' }
          },
          '&:hover': { backgroundColor: alpha('#ffffff', 0.06) }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, color: alpha('#ffffff', 0.65) }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontWeight: 500, fontSize: '0.9375rem' }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: slate,
          color: '#e2e8f0',
          backgroundImage: `linear-gradient(180deg, ${navy} 0%, ${slate} 40%, #172033 100%)`
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#ffffff', 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: alpha(navy, 0.08)
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 }
      }
    }
  }
});

export const chartColors = {
  income: indigo,
  incomeFill: alpha(indigo, 0.15),
  expenses: '#ea580c',
  expensesFill: alpha('#ea580c', 0.12),
  profit: teal,
  profitFill: alpha(teal, 0.15)
};
