import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Card, CardContent, CardMedia, Typography, Chip, CircularProgress } from '@mui/material';
import { fieldApi } from '@api/fields';
import { getFieldTypeLabel } from '@utils/formatters';

const FieldList = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['fields'],
    queryFn: () => fieldApi.getAll({ isActive: true }),
  });

  const fields = data?.data?.fields || [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Campi Disponibili
      </Typography>

      <Grid container spacing={3}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.id}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(`/fields/${field.id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 180,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {field.name}
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <Chip label={getFieldTypeLabel(field.fieldType)} size="small" color="primary" />
                  <Chip label={field.surface} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {field.description || 'Campo disponibile per prenotazioni'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FieldList;