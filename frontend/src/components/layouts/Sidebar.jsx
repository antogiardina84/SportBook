// ============================================
// frontend/src/components/layouts/Sidebar.jsx
// Sidebar Navigazione Principale
// ============================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  SportsTennis as FieldIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  AttachMoney as PaymentIcon,
  ExpandLess,
  ExpandMore,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ open, onClose, variant = 'temporary', width = 280 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [bookingsOpen, setBookingsOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  // User Menu Items
  const userMenuItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      label: 'Le Mie Prenotazioni',
      icon: <EventIcon />,
      path: '/bookings'
    },
    {
      label: 'Nuova Prenotazione',
      icon: <CalendarIcon />,
      path: '/bookings/new'
    },
    {
      label: 'Campi Disponibili',
      icon: <FieldIcon />,
      path: '/fields'
    },
    {
      label: 'Il Mio Profilo',
      icon: <PersonIcon />,
      path: '/profile'
    }
  ];

  // Admin Menu Items
  const adminMenuItems = [
    {
      label: 'Admin Dashboard',
      icon: <AdminIcon />,
      path: '/admin/dashboard'
    },
    {
      label: 'Utenti',
      icon: <PeopleIcon />,
      path: '/admin/users'
    },
    {
      label: 'Campi',
      icon: <FieldIcon />,
      path: '/admin/fields'
    },
    {
      label: 'Prenotazioni',
      icon: <EventIcon />,
      path: '/admin/bookings'
    },
    {
      label: 'Pagamenti',
      icon: <PaymentIcon />,
      path: '/admin/payments'
    },
    {
      label: 'Report',
      icon: <ReportIcon />,
      path: '/admin/reports'
    },
    {
      label: 'Impostazioni',
      icon: <SettingsIcon />,
      path: '/admin/settings'
    }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">
          Menu
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.firstName} {user?.lastName}
        </Typography>
      </Box>

      {/* User Menu */}
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {userMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setAdminOpen(!adminOpen)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  bgcolor: 'grey.100'
                }}
              >
                <ListItemIcon>
                  <AdminIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Amministrazione" 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminMenuItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      selected={isActive(item.path)}
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        mx: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light'
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          SportBook v1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary">
          © 2025 Tutti i diritti riservati
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;