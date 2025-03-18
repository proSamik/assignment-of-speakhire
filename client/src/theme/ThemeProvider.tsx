/*
<aicontext>
This component provides theme context to the application, managing light/dark mode preferences.
It detects the browser's color scheme preference and allows theme toggling.
</aicontext>
*/

import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that wraps the application and provides theme context
 * Detects preferred color scheme from browser and allows theme toggling
 * @param children - Child components
 * @returns ThemeProvider component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme based on browser preference
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check for stored preference
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    if (storedMode) {
      return storedMode;
    }
    // Otherwise use browser preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Update stored preference when mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Listen for changes to browser preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Memoize theme context value
  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  // Use the appropriate theme based on current mode
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 