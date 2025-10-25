import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Container, Paper, Button, TextField } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Define accent colors
  const adminAccentColor = '#FF8A65';
  const primaryBg = '#1A202C'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('/api/admin/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', 'admin');
        setMessage('Admin login successful. Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid credentials or connection error.');
    }
  };

  return (
    <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: primaryBg, 
        color: 'white' 
    }}>
      <Container component={Paper} elevation={10} maxWidth="xs" 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          bgcolor: 'rgba(25, 33, 71, 0.95)', 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center' 
        }}
      >
        <SecurityIcon sx={{ fontSize: 60, color: adminAccentColor, mb: 1 }} />
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: adminAccentColor }}>
          Admin Portal Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
            variant="filled"
            sx={{ 
              input: { color: 'white' }, 
              label: { color: adminAccentColor }, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: 1
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
            variant="filled"
            sx={{ 
              input: { color: 'white' }, 
              label: { color: adminAccentColor }, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: 1 
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: adminAccentColor, '&:hover': { bgcolor: '#e64a19' } }}
          >
            Login
          </Button>
        </Box>
        
        {message && <Typography sx={{ color: 'error.main', mt: 2 }}>{message}</Typography>}
      </Container>
    </Box>
  );
}

export default AdminAuth;