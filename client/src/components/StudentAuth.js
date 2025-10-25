import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Container, Paper, Button, TextField, Link } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function StudentAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Define accent colors
  const studentAccentColor = '#81D4FA';
  const primaryBg = '#1A202C'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const url = isLogin ? '/api/students/login' : '/api/students/register';
      const response = await axios.post(url, { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', 'student');
        
        const successMessage = isLogin 
          ? 'Login successful. Redirecting to dashboard...' 
          : 'Sign up successful. Redirecting to complete registration...';
        
        setMessage(successMessage);
        
        setTimeout(() => {
          navigate('/student/dashboard'); 
        }, 500); 
      } else {
        setMessage(response.data.message || 'Success! Please log in now.');
        setIsLogin(true); 
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: primaryBg, // Consistent dark background
        color: 'white' 
    }}>
      <Container component={Paper} elevation={10} maxWidth="xs" 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          bgcolor: 'rgba(25, 33, 71, 0.95)', // Central card theme
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center' 
        }}
      >
        <PersonIcon sx={{ fontSize: 60, color: studentAccentColor, mb: 1 }} />
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: studentAccentColor }}>
          {isLogin ? 'Student Login' : 'Student Sign Up'}
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
              label: { color: studentAccentColor }, 
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
              label: { color: studentAccentColor }, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              borderRadius: 1 
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: studentAccentColor, '&:hover': { bgcolor: '#0070a8' } }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </Box>
        
        <Typography variant="body2" sx={{ color: '#aaa', mt: 2 }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          {' '}
          <Link 
            component="span" 
            onClick={() => setIsLogin(!isLogin)} 
            sx={{ color: studentAccentColor, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </Typography>

        {message && <Typography sx={{ color: message.includes('successful') ? 'lightgreen' : 'error.main', mt: 2 }}>{message}</Typography>}
      </Container>
    </Box>
  );
}

export default StudentAuth;