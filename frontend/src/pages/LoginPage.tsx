import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Tab, Tabs, TextField } from '@mui/material';
import PageTitle from '../components/PageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiErrors } from '../lib/api';

export default function LoginPage() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (tab === 0) await login(email, password);
      else await register(name, email, password);
      nav('/rooms');
    } catch (err) {
      setError(apiErrors(err));
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <PageTitle>
        Reserva de Salas
      </PageTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Login" />
        <Tab label="Register" />
      </Tabs>
      <Box component="form" onSubmit={submit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
        {tab === 1 && <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          helperText={tab === 1 ? 'min 8 chars' : undefined}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained">
          {tab === 0 ? 'Login' : 'Register'}
        </Button>
      </Box>
    </Box>
  );
}
