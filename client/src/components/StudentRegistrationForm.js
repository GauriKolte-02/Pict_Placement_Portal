import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define the static options
const CLASS_OPTIONS = ['SE', 'TE', 'BE'];
const BRANCH_OPTIONS = ['ENTC', 'IT', 'ECE', 'CE', 'AIDS'];
const DIVISION_OPTIONS = Array.from({ length: 15 }, (_, i) => (i + 1).toString());
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

function StudentRegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    className: '', 
    division: '', 
    branch: '', 
    email: '', 
    mobileNumber: '', 
    tenthMarks: '', 
    twelfthMarks: '', 
    cgpaAggregate: '', 
    activeBacklog: 'no', 
    resumeUrl: '', 
    gender: ''
  });
  const [resumeFile, setResumeFile] = useState(null); 
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/student/auth'); return; }
        const response = await axios.get('/api/students/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          // Use stable data handling
          const stableData = Object.fromEntries(
            Object.entries(response.data).map(([key, value]) => [key, value === null || value === undefined ? '' : value])
          );
          setFormData(stableData);
          setIsRegistered(!!response.data.name); 
        }
      } catch (error) { console.error('Error fetching student profile:', error); }
    };
    fetchStudentProfile();
  }, [navigate]);

  // Original stable handleChange function for basic HTML inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'yes' : 'no') : value,
    }));
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    setFormData(prev => ({
      ...prev,
      // Store filename/placeholder URL
      resumeUrl: e.target.files[0] ? `Upload success: ${e.target.files[0].name}` : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const url = '/api/students/profile'; 
      const method = isRegistered ? 'put' : 'post';

      await axios({
        method: method,
        url: url,
        data: formData, 
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Student profile updated successfully!');
      setIsRegistered(true);
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Server error while updating profile.');
    }
  };

  return (
    <div className="form-container">
      <h2>{isRegistered ? 'Update Student Profile' : 'Student Registration Form'}</h2>
      <form onSubmit={handleSubmit}>
        
        {/* --- Personal Details --- */}
        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
            <label htmlFor="className">Class (SE, TE, BE):</label>
            <select id="className" name="className" value={formData.className} onChange={handleChange} required>
                <option value="">Select Class</option>
                {CLASS_OPTIONS.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
        </div>

        <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required readOnly />
        </div>

        {/* This mobile field uses type="text" and will be stable */}
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input type="text" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required maxLength="10" />
        </div>

        {/* --- Academic Structure --- */}
        <div className="form-group">
            <label htmlFor="branch">Branch:</label>
            <select id="branch" name="branch" value={formData.branch} onChange={handleChange} required>
                <option value="">Select Branch</option>
                {BRANCH_OPTIONS.map(branch => (<option key={branch} value={branch}>{branch}</option>))}
            </select>
        </div>

        <div className="form-group">
            <label htmlFor="division">Division:</label>
            <select id="division" name="division" value={formData.division} onChange={handleChange} required>
                <option value="">Select Division (1-15)</option>
                {DIVISION_OPTIONS.map(div => (<option key={div} value={div}>{div}</option>))}
            </select>
        </div>
        
        {/* --- Performance Metrics --- */}
        <div className="form-group">
          <label htmlFor="tenthMarks">10th Marks (%):</label>
          <input type="number" id="tenthMarks" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange} min="0" max="100" step="0.01" required />
        </div>

        <div className="form-group">
          <label htmlFor="twelfthMarks">12th Marks (%):</label>
          <input type="number" id="twelfthMarks" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange} min="0" max="100" step="0.01" required />
        </div>

        <div className="form-group">
          <label htmlFor="cgpaAggregate">CGPA Aggregate:</label>
          <input type="number" id="cgpaAggregate" name="cgpaAggregate" value={formData.cgpaAggregate} onChange={handleChange} min="0" max="10" step="0.01" required />
        </div>

        {/* Backlog and Resume */}
        <div className="form-group">
          <input type="checkbox" id="activeBacklog" name="activeBacklog" checked={formData.activeBacklog === 'yes'} onChange={handleChange} />
          <label htmlFor="activeBacklog" style={{ display: 'inline' }}>Active Backlog</label>
        </div>

        <div className="form-group">
          <label htmlFor="resume">Upload Resume (PDF/Doc):</label>
          {/* Note: File input must be stable, hence using basic HTML input */}
          <input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx" style={{ border: 'none', padding: '10px 0' }} />
          {formData.resumeUrl && <p style={{ fontSize: '0.9em', color: 'gray', marginTop: '5px' }}>Current Status: {formData.resumeUrl}</p>}
        </div>

        <button type="submit">{isRegistered ? 'Update Profile' : 'Register'}</button>
      </form>
      {message && <p style={{ marginTop: '20px', textAlign: 'center', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default StudentRegistrationForm;