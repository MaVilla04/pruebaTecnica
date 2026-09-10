import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container, CssBaseline, AppBar, Toolbar, Button, Typography } from '@mui/material';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RoomsPage from './pages/RoomsPage';
import BookingsPage from './pages/BookingsPage';

const qc = new QueryClient();

function Guard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>Salas ({user.email})</Typography>
        <Button color="inherit" component={Link} to="/rooms">
          Salas
        </Button>
        <Button color="inherit" component={Link} to="/bookings">
          Mis reservas
        </Button>
        <Button
          color="inherit"
          onClick={() => {
            void logout().then(() => nav('/login'));
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <CssBaseline />
          <Nav />
          <Container sx={{ py: 3 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/rooms" element={<Guard><RoomsPage /></Guard>} />
              <Route path="/bookings" element={<Guard><BookingsPage /></Guard>} />
              <Route path="*" element={<Navigate to="/rooms" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
