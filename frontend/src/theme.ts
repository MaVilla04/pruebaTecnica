import { createTheme } from '@mui/material/styles';

// Paleta institucional Reserva de Salas v1.
// Azules: marca/acción. Grises: texto/bordes. Fondos: superficies claras.
// Semáforo (success/error/warning): defaults MUI para estados de reserva.

export const theme = createTheme({
  palette: {
    primary: {
      light: '#95ADD4',
      main: '#1976d2',
      dark: '#21459a',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#404040',
      secondary: '#787878',
      disabled: '#a2a2a2',
    },
    divider: '#8b8b8b',
    background: {
      default: '#F5F6FA',
      paper: '#F4F4F5',
    },
    info: {
      light: '#F0F9FF',
      main: '#1976d2',
      dark: '#21459a',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});
