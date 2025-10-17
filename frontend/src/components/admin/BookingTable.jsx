import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, 
         TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Visibility, Cancel } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const BookingTable = ({ bookings, onView, onCancel }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Cliente</TableCell>
          <TableCell>Campo</TableCell>
          <TableCell>Data</TableCell>
          <TableCell>Orario</TableCell>
          <TableCell>Stato</TableCell>
          <TableCell align="right">Importo</TableCell>
          <TableCell align="right">Azioni</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bookings.map(booking => (
          <TableRow key={booking.id}>
            <TableCell>{booking.user.firstName} {booking.user.lastName}</TableCell>
            <TableCell>{booking.field.name}</TableCell>
            <TableCell>{format(parseISO(booking.startTime), 'dd/MM/yyyy')}</TableCell>
            <TableCell>{format(parseISO(booking.startTime), 'HH:mm')}</TableCell>
            <TableCell><Chip label={booking.status} size="small" /></TableCell>
            <TableCell align="right">€{booking.totalAmount}</TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onView(booking)}>
                <Visibility fontSize="small" />
              </IconButton>
              {booking.status !== 'CANCELLED' && (
                <IconButton size="small" color="error" onClick={() => onCancel(booking)}>
                  <Cancel fontSize="small" />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default BookingTable;