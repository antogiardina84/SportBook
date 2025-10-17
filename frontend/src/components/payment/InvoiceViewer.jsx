import React from 'react';
import { Paper, Box, Typography, Divider, Button, Grid } from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const InvoiceViewer = ({ invoice }) => (
  <Paper sx={{ p: 4 }}>
    <Box display="flex" justifyContent="space-between" mb={4}>
      <Box>
        <Typography variant="h4" fontWeight="bold">FATTURA</Typography>
        <Typography color="text.secondary">#{invoice.number}</Typography>
      </Box>
      <Box textAlign="right">
        <Typography variant="h6">SportBook</Typography>
        <Typography variant="body2" color="text.secondary">
          Via Roma 123, 41121 Modena<br />
          P.IVA: 12345678901
        </Typography>
      </Box>
    </Box>

    <Grid container spacing={3} mb={4}>
      <Grid item xs={6}>
        <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
        <Typography>{invoice.customerName}</Typography>
        <Typography variant="body2">{invoice.customerEmail}</Typography>
      </Grid>
      <Grid item xs={6} textAlign="right">
        <Typography variant="subtitle2" color="text.secondary">Data Fattura</Typography>
        <Typography>{format(parseISO(invoice.date), 'dd/MM/yyyy')}</Typography>
      </Grid>
    </Grid>

    <Divider sx={{ my: 3 }} />

    <Box mb={3}>
      {invoice.items.map((item, idx) => (
        <Box key={idx} display="flex" justifyContent="space-between" mb={1}>
          <Typography>{item.description}</Typography>
          <Typography fontWeight="bold">€{item.amount.toFixed(2)}</Typography>
        </Box>
      ))}
    </Box>

    <Divider sx={{ my: 3 }} />

    <Box display="flex" justifyContent="flex-end" mb={4}>
      <Box>
        <Box display="flex" justifyContent="space-between" gap={4} mb={1}>
          <Typography>Subtotale:</Typography>
          <Typography>€{invoice.subtotal.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" gap={4} mb={1}>
          <Typography>IVA (22%):</Typography>
          <Typography>€{invoice.tax.toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" gap={4}>
          <Typography variant="h6">Totale:</Typography>
          <Typography variant="h6" color="primary">
            €{invoice.total.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Box>

    <Box display="flex" gap={2}>
      <Button variant="contained" startIcon={<Download />} fullWidth>
        Scarica PDF
      </Button>
      <Button variant="outlined" startIcon={<Print />} fullWidth>
        Stampa
      </Button>
    </Box>
  </Paper>
);

export default InvoiceViewer;