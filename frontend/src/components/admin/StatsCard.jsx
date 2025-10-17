import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="text.secondary" variant="body2">{title}</Typography>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp fontSize="small" color="success" />
              <Typography variant="body2" color="success.main" ml={0.5}>
                +{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ bgcolor: `${color}.100`, p: 1.5, borderRadius: 2 }}>
          <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatsCard;