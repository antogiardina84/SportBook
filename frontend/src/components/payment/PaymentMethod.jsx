import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { CreditCard, Delete, Star } from '@mui/icons-material';

const PaymentMethod = ({ method, onDelete, onSetDefault, isDefault }) => (
  <Card variant="outlined">
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <CreditCard color="primary" />
          <Box>
            <Typography variant="body1">
              •••• •••• •••• {method.last4}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Scadenza {method.expMonth}/{method.expYear}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          {isDefault ? (
            <Chip label="Predefinito" size="small" color="primary" icon={<Star />} />
          ) : (
            <IconButton size="small" onClick={onSetDefault}>
              <Star />
            </IconButton>
          )}
          <IconButton size="small" color="error" onClick={onDelete}>
            <Delete />
          </IconButton>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default PaymentMethod;