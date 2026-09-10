import type { ReactNode } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

interface AppDialogProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function AppDialog({
  title,
  open,
  onClose,
  onSubmit,
  submitLabel,
  loading,
  error,
  children,
  maxWidth,
}: AppDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth ?? 'sm'}>
      <DialogTitle sx={{ color: 'primary.dark' }}>{title}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 3,
          pb: 1,
          px: 3,
          overflow: 'visible',
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {onSubmit && (
          <Button variant="contained" disabled={loading} onClick={onSubmit}>
            {submitLabel ?? 'Guardar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
