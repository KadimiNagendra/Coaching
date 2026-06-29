import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { theme } from './theme/theme';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,             // Data is always considered stale → always re-fetched from DB
      refetchOnWindowFocus: true, // Re-fetch when user returns to the browser tab
      refetchOnMount: true,       // Re-fetch every time a component mounts
      refetchOnReconnect: true,   // Re-fetch when network reconnects
      retry: 1,                   // Retry failed requests once before showing error
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
