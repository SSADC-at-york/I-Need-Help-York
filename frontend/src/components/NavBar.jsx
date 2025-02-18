// src/components/Navbar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Box,
  Avatar
} from '@mui/material';
import {
  HelpOutline,
  Login,
  Person,
  AdminPanelSettings,
  Add,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  // Allow admin access if the user's role is admin or root (case-insensitive)
  const canAccessAdminPanel = user && user.role && ['admin', 'root'].includes(user.role.toLowerCase());

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink}
          to="/"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 500,
            fontSize: '1.2rem',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          INeedHelp@YorkU
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button 
            color="inherit" 
            component={RouterLink}
            to="/"
            sx={{ textTransform: 'none', fontWeight: 400, mr: 1 }}
          >
            Resources
          </Button>

          {user ? (
            <>
              {canAccessAdminPanel && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin"
                  sx={{ textTransform: 'none', fontWeight: 400, mr: 1 }}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ textTransform: 'none', fontWeight: 400 }}
              >
                {user.username}
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ textTransform: 'none', fontWeight: 400, mr: 1 }}
              >
                Login
              </Button>
              <Button 
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={{ textTransform: 'none', fontWeight: 400 }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          color="inherit"
          sx={{ display: { xs: 'flex', md: 'none' } }}
          onClick={handleMobileMenuOpen}
        >
          <MenuIcon />
        </IconButton>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
        >
          {canAccessAdminPanel && (
            <MenuItem component={RouterLink} to="/admin">
              Admin Panel
            </MenuItem>
          )}
          <MenuItem component={RouterLink} to="/suggest-resource">
            Suggest Resource
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
        >
          <MenuItem component={RouterLink} to="/">
            Resources
          </MenuItem>
          {user ? (
            [
              canAccessAdminPanel && (
                <MenuItem key="admin" component={RouterLink} to="/admin">
                  Admin Panel
                </MenuItem>
              ),
              <MenuItem key="suggest" component={RouterLink} to="/suggest-resource">
                Suggest Resource
              </MenuItem>,
              <MenuItem key="logout" onClick={handleLogout}>
                Logout
              </MenuItem>
            ]
          ) : (
            [
              <MenuItem key="login" component={RouterLink} to="/login">
                Login
              </MenuItem>,
              <MenuItem key="register" component={RouterLink} to="/register">
                Register
              </MenuItem>
            ]
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
