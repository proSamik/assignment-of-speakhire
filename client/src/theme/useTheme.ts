/*
<aicontext>
This file contains the custom hook for accessing the theme context.
</aicontext>
*/

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

/**
 * Custom hook to access the theme context
 * @returns Theme context containing current mode and toggle function
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 