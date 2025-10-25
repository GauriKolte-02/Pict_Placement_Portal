import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token || !userRole) {
    // Not logged in, redirect to home or login page
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    // Logged in but wrong role, redirect to unauthorized page or dashboard
    return <Navigate to="/" replace />; // Or a more specific /unauthorized page
  }

  return children;
};

export default PrivateRoute;