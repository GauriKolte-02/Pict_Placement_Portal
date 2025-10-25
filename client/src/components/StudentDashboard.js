import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Box, Typography, Container, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, 
    ListItemIcon, CircularProgress, Link 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [applications, setApplications] = useState([]); 
  const [appliedStatus, setAppliedStatus] = useState({});

  // Define student theme accent color
  const primaryAccent = '#1976D2'; 
  const primaryBg = '#f0f2f5'; 
  const cardBgColor = '#ffffff'; 

  const getStatusColor = (status) => {
    switch (status) {
        case 'Applied': return '#ff9800'; 
        case 'Shortlisted': return '#4caf50'; 
        case 'Interview Scheduled': return '#2196f3'; 
        case 'Placed': return '#00bcd4'; 
        default: return '#d32f2f'; 
    }
  };

  const getStatusColorStyle = (status) => ({
      color: getStatusColor(status),
      fontWeight: 600
  });

  const handleApply = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to apply to ${companyName}?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`/api/students/apply/${companyId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const newApplication = response.data.application;

        setAppliedStatus(prev => ({ ...prev, [companyId]: true }));
        setApplications(prev => [newApplication, ...prev]);

        alert(`Successfully applied to ${companyName}! Status: Applied`);

    } catch (error) {
        alert(error.response?.data?.message || `Failed to submit application to ${companyName}.`);
    }
  };

  useEffect(() => {
    let isMounted = true; // Flag for clean up

    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/student/auth');
        return;
      }

      try {
        const [profileRes, companiesRes, notificationsRes, applicationsRes] = await Promise.all([
          axios.get('/api/students/profile', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/students/eligible-companies', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/students/notifications', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/students/applications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (isMounted) {
            if (profileRes.data && !profileRes.data.name) {
                navigate('/student/register');
                return; 
            }
            
            setProfile(profileRes.data);
            setCompanies(companiesRes.data);
            setNotifications(notificationsRes.data);
            setApplications(applicationsRes.data);
            
            const appliedMap = applicationsRes.data.reduce((acc, app) => {
                // Ensure app.companyId exists and has _id before mapping
                if (app.companyId && app.companyId._id) { 
                    acc[app.companyId._id] = true; 
                }
                return acc;
            }, {});
            setAppliedStatus(appliedMap);
        }

      } catch (err) {
        if (isMounted) {
            // Check for profile not found/inadequate data errors specifically
            const errorMessage = err.response?.data?.message || 'Failed to load dashboard data.';
            setError(errorMessage);
            
            if (err.response?.status === 404) {
              navigate('/student/register');
            } else if (err.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              navigate('/student/auth');
            }
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    fetchDashboardData();
    
    return () => {
        isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Typography align="center" color="error" sx={{ mt: 5 }}>Error: {error}</Typography>;
  if (!profile) return <Typography align="center" color="text.secondary" sx={{ mt: 5 }}>Please complete your registration.</Typography>;


  // Custom List Item for clean profile display
  const ProfileListItem = ({ label, value }) => (
    <ListItem disableGutters sx={{ py: 0.5, borderBottom: '1px dotted #eee' }}>
      <ListItemText
        primary={
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}:
          </Typography>
        }
        secondary={
          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
        }
      />
    </ListItem>
  );

  return (
    <Container maxWidth="xl" sx={{ my: 4, bgcolor: primaryBg, minHeight: '100vh', py: 0 }}>
      
      {/* --- HEADER BAR (Clean Top Bar) --- */}
      <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start',
          alignItems: 'center', 
          mb: 4, 
          p: 2, 
          bgcolor: cardBgColor, 
          borderRadius: 2, 
          boxShadow: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon sx={{ color: primaryAccent, fontSize: 30 }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: '#333' }}>
                Student Dashboard
            </Typography>
        </Box>
      </Box>

      {/* --- MAIN 2-COLUMN CONTENT GRID --- */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        
        {/* === COLUMN 1 (Left - 4/12 width): STUDENT PROFILE === */}
        <Box sx={{ flexBasis: '30%', minWidth: '30%', maxWidth: { md: '33.333%' } }}>
          <Card elevation={6} sx={{ borderRadius: 3 }}>
            {/* User Info Header Section */}
            <Box sx={{ bgcolor: primaryAccent, color: 'white', p: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, textAlign: 'center' }}>
                <PersonOutlineIcon sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{profile.name || 'Profile Incomplete'}</Typography>
                <Typography variant="body2">{profile.email}</Typography>
            </Box>
            
            {/* Profile Details */}
            <CardContent sx={{ bgcolor: cardBgColor, p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: primaryAccent, mb: 2, borderBottom: '2px solid #eee', pb: 1 }}>
                Profile & Academics
              </Typography>

              <List disablePadding>
                <ProfileListItem label="Branch" value={profile.branch || 'N/A'} />
                <ProfileListItem label="Division" value={profile.division || 'N/A'} />
                <ProfileListItem label="Gender" value={profile.gender || 'N/A'} />
                <ProfileListItem label="Mobile" value={profile.mobileNumber || 'N/A'} />
                <Divider sx={{ my: 1 }} />
                <ProfileListItem label="10th Marks" value={`${profile.tenthMarks || '0'}%`} />
                <ProfileListItem label="12th Marks" value={`${profile.twelfthMarks || '0'}%`} />
                <ProfileListItem label="CGPA Aggregate" value={profile.cgpaAggregate || '0.0'} />
                <ProfileListItem label="Active Backlog" value={profile.activeBacklog === 'yes' ? 'Yes' : 'No'} />
                <ProfileListItem label="Resume Status" value={profile.resumeUrl ? 'Uploaded' : 'Missing'} />
              </List>

              {/* Action Buttons: Update and Logout */}
              <Button 
                onClick={() => navigate('/student/register')} 
                variant="contained" 
                fullWidth 
                sx={{ mt: 3, mb: 1, bgcolor: primaryAccent, '&:hover': { bgcolor: '#005a88' } }}
              >
                Update Profile
              </Button>

              <Link 
                  component="button" 
                  onClick={handleLogout} 
                  sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%', 
                      mt: 1, 
                      color: '#757575', 
                      textDecoration: 'none',
                      '&:hover': { color: '#d32f2f', textDecoration: 'underline' } 
                  }}
              >
                  <ExitToAppIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Sign Out of Portal
              </Link>
            </CardContent>
          </Card>
        </Box>

        {/* === COLUMN 2 (Right - 8/12 width): NOTIFICATIONS, APPLICATIONS & COMPANIES === */}
        <Box sx={{ flexBasis: '70%', maxWidth: { md: '66.667%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* NOTIFICATIONS CARD - TOP RIGHT */}
          <Card elevation={6} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: primaryAccent, borderBottom: '2px solid #eee', pb: 1 }}>
                <NotificationsActiveIcon sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>Notifications ({notifications.length})</Typography>
              </Box>
              
              <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
                {notifications.length > 0 ? (
                  <List disablePadding>
                    {notifications.map((notification, index) => (
                        <ListItem key={index} alignItems="flex-start" sx={{ bgcolor: index % 2 === 0 ? '#f5f5f5' : cardBgColor, borderRadius: 1, mb: 1, borderLeft: `5px solid ${primaryAccent}` }}>
                          <ListItemText
                            primary={<Typography variant="subtitle1" fontWeight={600}>{notification.companyName}</Typography>}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                                  {notification.message}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {new Date(notification.date).toLocaleString()}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    You're all caught up! No new notifications.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* MY APPLICATIONS TRACKING CARD - MIDDLE RIGHT */}
          <Card elevation={6} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: primaryAccent, borderBottom: '2px solid #eee', pb: 1 }}>
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>My Applications ({applications.length})</Typography>
              </Box>
              
              <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
                {applications.length > 0 ? (
                  <List disablePadding>
                    {applications.map((app) => (
                      <ListItem key={app._id} sx={{ 
                          bgcolor: '#fff3e0',
                          borderRadius: 1, 
                          mb: 1, 
                          borderLeft: `5px solid ${getStatusColor(app.status)}` 
                      }}>
                        <ListItemText
                          primary={<Typography variant="subtitle1" fontWeight={700}>
                              {app.companyId?.name || 'Company Name Missing'}
                          </Typography>}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" sx={getStatusColorStyle(app.status)} >
                                Status: {app.status}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Applied on: {new Date(app.dateApplied).toLocaleDateString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    You have not submitted any applications yet.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          
          {/* ELIGIBLE COMPANIES CARD - BOTTOM RIGHT */}
          <Card elevation={6} sx={{ p: 2, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: primaryAccent, borderBottom: '2px solid #eee', pb: 1 }}>
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>Eligible Companies</Typography>
              </Box>

              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {companies.length > 0 ? (
                  <Grid container spacing={2}>
                    {companies.map((company) => (
                      <Grid item xs={12} sm={6} key={company._id}>
                        {/* Company Detail Card */}
                        <Card variant="outlined" sx={{ bgcolor: cardBgColor, p: 2, borderRadius: 2, borderColor: '#ccc', transition: '0.3s', '&:hover': { boxShadow: 3, borderColor: primaryAccent } }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#333', borderBottom: '1px solid #eee', pb: 1 }}>{company.name}</Typography>
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>Visiting: {new Date(company.visitingDate).toLocaleDateString()}</Typography>
                          
                          <List disablePadding sx={{ mt: 1, borderTop: '1px dashed #eee' }}>
                            <ListItemText primary={<Typography variant="body2" color="text.primary">CGPA: {company.eligibility.cgpaAggregate} | 10th: {company.eligibility.tenthMarks}%</Typography>} />
                            <ListItemText primary={<Typography variant="body2" color="text.primary">12th: {company.eligibility.twelfthMarks}% | Backlog: {company.eligibility.activeBacklog === 'yes' ? 'Yes' : 'No'}</Typography>} />
                          </List>
                          
                          {/* APPLY BUTTON LOGIC */}
                          <Button 
                              size="small" 
                              variant="contained" 
                              disabled={appliedStatus[company._id]}
                              onClick={() => handleApply(company._id, company.name)}
                              sx={{ mt: 1, bgcolor: appliedStatus[company._id] ? '#9e9e9e' : primaryAccent, '&:hover': { bgcolor: appliedStatus[company._id] ? '#757575' : '#005a88' } }}
                          >
                            {appliedStatus[company._id] ? 'Applied' : 'Apply Now'}
                          </Button>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No eligible companies currently available.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}

export default StudentDashboard;