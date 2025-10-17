import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, 
         TableRow, Paper, Chip, IconButton, Avatar, Box } from '@mui/material';
import { Edit, Delete, Block } from '@mui/icons-material';

const UserTable = ({ users, onEdit, onDelete, onBlock }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Utente</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Ruolo</TableCell>
          <TableCell>Stato</TableCell>
          <TableCell align="right">Azioni</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 32, height: 32 }}>{user.firstName[0]}</Avatar>
                {user.firstName} {user.lastName}
              </Box>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell><Chip label={user.role} size="small" /></TableCell>
            <TableCell>
              <Chip 
                label={user.isActive ? 'Attivo' : 'Inattivo'} 
                color={user.isActive ? 'success' : 'error'} 
                size="small" 
              />
            </TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onEdit(user)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onBlock(user)}>
                <Block fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(user)}>
                <Delete fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default UserTable;