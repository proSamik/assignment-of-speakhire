/*
<aicontext>
This component provides the main layout for the application, including navigation and theme switching.
</aicontext>
*/

import React, { ReactNode } from 'react';
import { 
  AppBar, 
  Box, 
  Container, 
  IconButton, 
  Toolbar, 
  Typography, 
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../theme/useTheme';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component that wraps all pages with a common structure
 * @param children - Child components to render in the main content area
 * @returns Layout component with header and main content
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      color: 'text.primary'
    }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            {isMobile ? 'Survey App' : 'Survey Application'}
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label="toggle theme"
            edge="end"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto', 
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Survey Application
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 