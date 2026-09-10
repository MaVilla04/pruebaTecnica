import type { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface PageTitleProps {
  children: ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <Typography variant="h5" color="primary.dark" gutterBottom>
      {children}
    </Typography>
  );
}
