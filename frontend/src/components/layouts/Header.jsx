// ============================================
// frontend/src/components/layouts/Header.jsx
// Header con Sidebar Mobile
// ============================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SportsTennis,
  Dashboard as DashboardIcon,
  EventNote,
  Person,
  ExitToApp,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Menu items per utenti autenticati
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Le Mie Prenotazioni', icon: <EventNote />, path: '/bookings' },
    { text: 'Campi', icon: <SportsTennis />, path: '/fields' },
    { text: 'Profilo', icon: <Person />, path: '/profile' },
  ];

  // Aggiungi menu admin se l'utente è admin
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    menuItems.push({
      text: 'Admin Panel',
      icon: <AdminPanelSettings />,
      path: '/admin',
    });
  }

  // Sidebar mobile
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <SportsTennis sx={{ fontSize: 40, color: '#667eea' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
          SportBook
        </Typography>
      </Box>
      <Divider />
      <List>
        {isAuthenticated ? (
          <>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/login')}>
                <ListItemText primary="Accedi" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/register')}>
                <ListItemText primary="Registrati" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          {/* Menu hamburger per mobile */}
          {isAuthenticated && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          >
            <SportsTennis sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              SportBook
            </Typography>
          </Box>

          {/* Menu desktop */}
          {isAuthenticated ? (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/bookings')}>
                Prenotazioni
              </Button>
              <Button color="inherit" onClick={() => navigate('/fields')}>
                Campi
              </Button>
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Button color="inherit" onClick={() => navigate('/admin')}>
                  Admin
                </Button>
              )}
              
              {/* Avatar con menu dropdown */}
              <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 2 }}>
                <Avatar sx={{ bgcolor: '#764ba2', width: 32, height: 32 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  <Person sx={{ mr: 1 }} /> Profilo
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Accedi
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
                onClick={() => navigate('/register')}
              >
                Registrati
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;