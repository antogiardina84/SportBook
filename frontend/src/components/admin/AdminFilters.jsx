import React from 'react';
import { Paper, Grid, TextField, MenuItem, Button, Box } from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';

const AdminFilters = ({ filters, onChange, onClear }) => (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <FilterList />
      <Typography variant="h6">Filtri</Typography>
    </Box>
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Cerca"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          select
          label="Stato"
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <MenuItem value="">Tutti</MenuItem>
          <MenuItem value="ACTIVE">Attivo</MenuItem>
          <MenuItem value="INACTIVE">Inattivo</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="date"
          label="Data Da"
          InputLabelProps={{ shrink: true }}
          value={filters.dateFrom || ''}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={onClear}
          fullWidth
        >
          Cancella Filtri
        </Button>
      </Grid>
    </Grid>
  </Paper>
);

export default AdminFilters;