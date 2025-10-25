import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentAuth from './components/StudentAuth';
import AdminAuth from './components/AdminAuth';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import StudentRegistrationForm from './components/StudentRegistrationForm';
import PrivateRoute from './components/PrivateRoute'; // For protected routes
import './App.css'; // For global styles

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student/auth" element={<StudentAuth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          
          {/* Protected Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} 
          />
          <Route 
            path="/student/register" 
            element={<PrivateRoute role="student"><StudentRegistrationForm /></PrivateRoute>} 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} 
          />
          {/* Add more admin routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;