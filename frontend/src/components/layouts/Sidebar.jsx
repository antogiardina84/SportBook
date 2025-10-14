// ===========================================
// frontend/src/components/layouts/Sidebar.jsx
// ===========================================

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard,
  EventNote,
  SportsTennis,
  Person,
  Settings,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Campi', icon: <SportsTennis />, path: '/fields' },
    { text: 'Prenotazioni', icon: <EventNote />, path: '/bookings' },
    { text: 'Profilo', icon: <Person />, path: '/profile' },
  ];

  const adminItems = [
    { text: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin' },
    { text: 'Utenti', icon: <Person />, path: '/admin/users' },
    { text: 'Campi', icon: <SportsTennis />, path: '/admin/fields' },
    { text: 'Impostazioni', icon: <Settings />, path: '/admin/settings' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          pt: 8,
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {user?.role === 'ADMIN' && (
          <>
            <Divider sx={{ my: 2 }} />
            <List>
              {adminItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;