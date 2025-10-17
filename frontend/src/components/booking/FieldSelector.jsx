// TimeSlotPicker.jsx - Selettore Orari
import React from 'react';
import { Grid, Chip, Box, Typography } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';

const TimeSlotPicker = ({ timeSlots, selectedSlot, onSelect, disabledSlots = [] }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
        <TimeIcon /> Seleziona Orario
      </Typography>
      <Grid container spacing={1}>
        {timeSlots.map(slot => {
          const isDisabled = disabledSlots.includes(slot);
          const isSelected = selectedSlot === slot;
          
          return (
            <Grid item key={slot}>
              <Chip
                label={slot}
                onClick={() => !isDisabled && onSelect(slot)}
                color={isSelected ? 'primary' : 'default'}
                disabled={isDisabled}
                sx={{ minWidth: 80 }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TimeSlotPicker;