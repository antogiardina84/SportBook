// ============================================
// frontend/src/components/layouts/Header.jsx
// Header Principale Applicazione
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifications = (event) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleClose();
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{
        bgcolor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo & Title */}
        <Box 
          display="flex" 
          alignItems="center" 
          flexGrow={1}
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Typography
            variant="h6"
            component="div"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎾 SportBook
          </Typography>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifiche">
          <IconButton
            color="inherit"
            onClick={handleNotifications}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Menu */}
        <Tooltip title="Account">
          <IconButton
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              alt={user?.firstName}
              src={user?.avatarUrl}
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'primary.main'
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 250, mt: 1 }
          }}
        >
          <Box px={2} py={1.5}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleDashboard}>
            <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
            Dashboard
          </MenuItem>
          
          <MenuItem onClick={handleProfile}>
            <AccountIcon fontSize="small" sx={{ mr: 1 }} />
            Il Mio Profilo
          </MenuItem>
          
          {isAdmin && (
            <MenuItem onClick={() => { handleClose(); navigate('/admin/settings'); }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Impostazioni
            </MenuItem>
          )}
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, mt: 1 }
          }}
        >
          <Box px={2} py={1.5}>
            <Typography variant="subtitle2" fontWeight="bold">
              Notifiche
            </Typography>
          </Box>
          
          <Divider />
          
          <MenuItem>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Prenotazione confermata
              </Typography>
              <Typography variant="caption" color="text.secondary">
                La tua prenotazione per il 15/10/2025 è confermata
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Pagamento completato
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pagamento di €25.00 completato con successo
              </Typography>
            </Box>
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={handleNotifClose}
            sx={{ justifyContent: 'center', color: 'primary.main' }}
          >
            <Typography variant="body2" fontWeight="bold">
              Vedi tutte le notifiche
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;