// ============================================
// frontend/src/components/common/ConfirmDialog.jsx
// Dialog di Conferma Riutilizzabile
// ============================================

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Conferma Azione',
  message = 'Sei sicuro di voler procedere?',
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  loading = false,
  variant = 'warning', // warning, danger, info, success
  maxWidth = 'sm'
}) => {
  const variantConfig = {
    warning: {
      icon: WarningIcon,
      color: 'warning',
      confirmColor: 'warning'
    },
    danger: {
      icon: DeleteIcon,
      color: 'error',
      confirmColor: 'error'
    },
    info: {
      icon: InfoIcon,
      color: 'info',
      confirmColor: 'primary'
    },
    success: {
      icon: SuccessIcon,
      color: 'success',
      confirmColor: 'success'
    }
  };

  const config = variantConfig[variant] || variantConfig.warning;
  const Icon = config.icon;

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon color={config.color} />
        {title}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          {cancelLabel}
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={config.confirmColor}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Elaborazione...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;