// ===========================================
// frontend/src/components/common/EmptyState.jsx
// ===========================================

import { Box, Typography, Button } from '@mui/material';
import { Inbox } from '@mui/icons-material';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nessun risultato',
  message = 'Non ci sono elementi da visualizzare',
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center',
      }}
    >
      <Icon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;