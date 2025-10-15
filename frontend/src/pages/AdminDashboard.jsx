// ============================================
// frontend/src/pages/AdminDashboard.jsx
// Dashboard Amministratore Completo
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  SportsTennis as SportsIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { adminAPI } from '../api/admin';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 0,
      totalBookings: 0,
      totalRevenue: 0,
      activeFields: 0
    },
    recentBookings: [],
    topFields: [],
    userGrowth: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboardStats();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel caricamento dei dati');
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  +{trend}% questo mese
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.100`,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Amministratore
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Benvenuto {user?.firstName}, ecco una panoramica della tua organizzazione
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Utenti Totali"
            value={dashboardData.overview.totalUsers}
            icon={<PeopleIcon sx={{ color: 'primary.main', fontSize: 32 }} />}
            color="primary"
            trend={dashboardData.userGrowth}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Prenotazioni"
            value={dashboardData.overview.totalBookings}
            icon={<EventIcon sx={{ color: 'success.main', fontSize: 32 }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue Totale"
            value={`€${dashboardData.overview.totalRevenue.toFixed(2)}`}
            icon={<MoneyIcon sx={{ color: 'warning.main', fontSize: 32 }} />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Campi Attivi"
            value={dashboardData.overview.activeFields}
            icon={<SportsIcon sx={{ color: 'info.main', fontSize: 32 }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Azioni Rapide
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/users')}
            >
              Gestisci Utenti
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SportsIcon />}
              onClick={() => navigate('/admin/fields')}
            >
              Gestisci Campi
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/admin/reports')}
            >
              Report
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/admin/settings')}
            >
              Impostazioni
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Prenotazioni Recenti" />
          <Tab label="Campi Più Utilizzati" />
          <Tab label="Revenue Analysis" />
        </Tabs>

        {/* Recent Bookings Tab */}
        {tabValue === 0 && (
          <Box p={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Campo</TableCell>
                    <TableCell>Data & Ora</TableCell>
                    <TableCell>Stato</TableCell>
                    <TableCell align="right">Importo</TableCell>
                    <TableCell align="center">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          Nessuna prenotazione recente
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboardData.recentBookings.map((booking) => (
                      <TableRow key={booking.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {booking.customer[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {booking.customer}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {booking.field}
                            </Typography>
                            <Chip
                              label={booking.fieldType}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(booking.startTime), 'dd/MM/yyyy', { locale: it })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(parseISO(booking.startTime), 'HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={
                              booking.status === 'CONFIRMED' ? 'success' :
                              booking.status === 'PENDING' ? 'warning' :
                              'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            €{booking.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, booking)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Top Fields Tab */}
        {tabValue === 1 && (
          <Box p={3}>
            <Grid container spacing={3}>
              {dashboardData.topFields.map((field, index) => (
                <Grid item xs={12} md={6} key={field.fieldId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {field.fieldName}
                          </Typography>
                          <Chip label={field.fieldType} size="small" />
                        </Box>
                        <Box
                          sx={{
                            bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          #{index + 1}
                        </Box>
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Prenotazioni
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {field.bookingCount}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(field.bookingCount / dashboardData.topFields[0].bookingCount) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Revenue Analysis Tab */}
        {tabValue === 2 && (
          <Box p={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Analisi Revenue
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Revenue Totale
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    €{dashboardData.overview.totalRevenue.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Revenue Media/Prenotazione
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    €{dashboardData.overview.totalBookings > 0 
                      ? (dashboardData.overview.totalRevenue / dashboardData.overview.totalBookings).toFixed(2)
                      : '0.00'
                    }
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tasso di Utilizzo
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {dashboardData.overview.activeFields > 0
                      ? ((dashboardData.overview.totalBookings / (dashboardData.overview.activeFields * 30 * 12)) * 100).toFixed(1)
                      : '0'
                    }%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Suggerimento:</strong> Per report dettagliati e analisi approfondite, 
                vai alla sezione <Button size="small" onClick={() => navigate('/admin/reports')}>Report Completi</Button>
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/bookings/${selectedItem?.id}`);
          handleMenuClose();
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Visualizza
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/bookings/${selectedItem?.id}/edit`);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Modifica
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Cancella
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminDashboard;