import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School'; 

function HomePage() {
  const navigate = useNavigate();

  const accentBlue = '#42A5F5';
  const accentRed = '#EF5350';
  const logoColor = '#FFD700';

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), 
                          url('https://www.campustimespune.com/how-to-reach-pict-campus/how-to-reach-pict-from-different-parts-of-pune/')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: 4,
        color: 'white',
      }}
    >
      <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
        
        <Paper 
          elevation={12} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            bgcolor: 'rgba(25, 33, 71, 0.95)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white', 
          }}
        >
          <Box sx={{ mb: 5 }}>
            <SchoolIcon sx={{ fontSize: 70, color: logoColor, mb: 1 }} />
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={700}
              sx={{ color: '#E0F2F7' }} 
            >
              PICT Placement Management System
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, color: '#B0BEC5' }}>
              Login to access your personalized portal.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 3, mt: 5, mb: 3 }}>
            
            <Box onClick={() => navigate('/student/auth')} sx={{ cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'scale(1.1)', boxShadow: `0 0 25px ${accentBlue}` } }}>
              <Avatar sx={{ bgcolor: accentBlue, width: 120, height: 120, mb: 1.5, boxShadow: '0 4px 20px rgba(0, 123, 255, 0.6)', border: '4px solid white', mx: 'auto' }}>
                <PersonIcon sx={{ fontSize: 70, color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ color: accentBlue }}>
                Student Login
              </Typography>
            </Box>

            <Box onClick={() => navigate('/admin/auth')} sx={{ cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'scale(1.1)', boxShadow: `0 0 25px ${accentRed}` } }}>
              <Avatar sx={{ bgcolor: accentRed, width: 120, height: 120, mb: 1.5, boxShadow: '0 4px 20px rgba(220, 53, 69, 0.6)', border: '4px solid white', mx: 'auto' }}>
                <SecurityIcon sx={{ fontSize: 70, color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ color: accentRed }}>
                Admin Login
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 5 }}>
            <Typography variant="body1" sx={{ color: '#aaa' }}>
              Don't have an account? 
              <span 
                onClick={() => navigate('/student/auth')} 
                style={{ color: accentBlue, cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline', fontWeight: 600 }}
              >
                Sign Up Here
              </span>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default HomePage;