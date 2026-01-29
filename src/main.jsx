// src/main.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './app/store'; // <- Ensure you have a Redux store set up
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { getTheme } from './theme'; // <- Create this theme.js

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  const [mode, setMode] = useState(() => {
    // Get from localStorage or fallback to 'light'
    return localStorage.getItem('appThemeMode') || 'light';
  });

  // Save theme mode in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appThemeMode', mode);
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };
  return (
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App mode={mode} toggleTheme={toggleTheme} />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);


