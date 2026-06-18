import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import { Alert, Avatar, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { api, setToken } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('teacher@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const result = await api.login(email, password);
      setToken(result.token);
      navigate('/');
    } catch {
      setError('Unable to sign in. Check the email and password.');
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #312e81 100%)',
        px: 2
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
              bgcolor: alpha('#818cf8', 0.2),
              color: '#c7d2fe',
              border: '1px solid',
              borderColor: alpha('#818cf8', 0.35)
            }}
          >
            <SchoolIcon />
          </Avatar>
          <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 700 }}>
            Tuition Manager
          </Typography>
          <Typography sx={{ color: alpha('#ffffff', 0.65), mt: 1 }}>
            Professional coaching center management
          </Typography>
        </Box>
        <Card sx={{ border: '1px solid', borderColor: alpha('#ffffff', 0.12) }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Sign in
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Manage classes, fees, attendance, and expenses from one dashboard.
            </Typography>
            <Stack component="form" spacing={2.5} onSubmit={submit}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
              <Button type="submit" size="large" fullWidth sx={{ py: 1.25, mt: 1 }}>
                Sign in
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                Seed login: teacher@example.com / Admin@123
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
