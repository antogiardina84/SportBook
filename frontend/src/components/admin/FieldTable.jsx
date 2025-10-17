import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, 
         TableRow, Paper, Chip, IconButton } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const FieldTable = ({ fields, onEdit, onDelete, onView }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nome Campo</TableCell>
          <TableCell>Tipo</TableCell>
          <TableCell>Tariffa Oraria</TableCell>
          <TableCell>Stato</TableCell>
          <TableCell align="right">Azioni</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {fields.map(field => (
          <TableRow key={field.id}>
            <TableCell>{field.name}</TableCell>
            <TableCell><Chip label={field.fieldType} size="small" /></TableCell>
            <TableCell>€{field.hourlyRate}</TableCell>
            <TableCell>
              <Chip 
                label={field.isActive ? 'Attivo' : 'Inattivo'} 
                color={field.isActive ? 'success' : 'error'} 
                size="small" 
              />
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onView(field)}>
                <Visibility fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onEdit(field)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(field)}>
                <Delete fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default FieldTable;