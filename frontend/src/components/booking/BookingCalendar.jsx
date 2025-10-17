// BookingCalendar.jsx - Componente Calendario Prenotazioni
import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Grid } from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isToday, isBefore, startOfToday } from 'date-fns';
import { it } from 'date-fns/locale';

const BookingCalendar = ({ onDateSelect, selectedDate, disabledDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const isDateDisabled = (date) => {
    if (isBefore(date, startOfToday())) return true;
    return disabledDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton onClick={handlePrevMonth}>
          <PrevIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <NextIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={1}>
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography variant="caption" align="center" display="block" fontWeight="bold">
              {day}
            </Typography>
          </Grid>
        ))}
        
        {days.map(day => {
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isDisabled = isDateDisabled(day);
          const isTodayDate = isToday(day);
          
          return (
            <Grid item xs={12/7} key={day.toString()}>
              <Box
                onClick={() => !isDisabled && onDateSelect(day)}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  borderRadius: 1,
                  bgcolor: isSelected ? 'primary.main' : isTodayDate ? 'primary.light' : 'transparent',
                  color: isSelected ? 'white' : isDisabled ? 'grey.400' : 'text.primary',
                  '&:hover': !isDisabled && {
                    bgcolor: isSelected ? 'primary.dark' : 'grey.100'
                  }
                }}
              >
                <Typography variant="body2">{format(day, 'd')}</Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default BookingCalendar;