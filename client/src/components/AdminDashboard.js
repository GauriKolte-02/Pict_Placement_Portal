import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- UTILITY FUNCTIONS ---

// Utility function to calculate statistics (for charts)
const analyzeStudents = (students) => {
  const stats = {
    totalRegistered: 0,
    gender: { Male: 0, Female: 0, Other: 0 },
    branch: {},
  };
  const fullyRegisteredStudents = students.filter(student => student.name && student.branch);
  stats.totalRegistered = fullyRegisteredStudents.length;

  fullyRegisteredStudents.forEach(student => {
    const genderKey = student.gender || 'Other';
    if (stats.gender.hasOwnProperty(genderKey)) { stats.gender[genderKey] += 1; } else { stats.gender[genderKey] = 1; }
    const branchKey = student.branch || 'N/A';
    stats.branch[branchKey] = (stats.branch[branchKey] || 0) + 1;
  });
  stats.gender = Object.fromEntries(Object.entries(stats.gender).filter(([, count]) => count > 0));
  return stats;
};

// Utility function to get status chip color (needed for modal)
const getStatusChipColor = (status) => {
  switch (status) {
    case 'Placed': return { bg: '#4caf50', text: '#fff' };
    case 'Shortlisted': return { bg: '#2196f3', text: '#fff' };
    case 'Interview Scheduled': return { bg: '#ff9800', text: '#fff' };
    case 'Applied': return { bg: '#ffee58', text: '#333' };
    case 'Rejected': return { bg: '#d32f2f', text: '#fff' };
    default: return { bg: '#e0e0e0', text: '#333' };
  }
};

// Utility function to calculate application counts
const countApplicationsByCompany = (applications) => {
    return applications.reduce((acc, app) => {
        const companyId = app.companyId?._id || app.companyId; 
        acc[companyId] = (acc[companyId] || 0) + 1;
        return acc;
    }, {});
};


// Component for Gender Pie Chart (retained)
const GenderPieChart = ({ genderStats }) => {
    const labels = Object.keys(genderStats);
    const data = {
        labels: labels,
        datasets: [
            {
                data: Object.values(genderStats),
                backgroundColor: ['#007bff', '#ff6384', '#cccccc'], 
                hoverBackgroundColor: ['#0056b3', '#cc4d68', '#b3b3b3'],
            },
        ],
    };
    return (
        <div style={{ height: '200px', width: '90%' }}>
            <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
    );
};

// Component for Branch Pie Chart (retained)
const BranchPieChart = ({ branchStats }) => {
    const labels = Object.keys(branchStats);
    const data = {
        labels: labels,
        datasets: [
            {
                data: Object.values(branchStats),
                backgroundColor: labels.map((_, i) => `hsl(${i * 60}, 70%, 50%)`),
                hoverBackgroundColor: labels.map((_, i) => `hsl(${i * 60}, 80%, 40%)`),
            },
        ],
    };
    return (
        <div style={{ height: '200px', width: '90%' }}>
            <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
    );
};


// --- APPLICANT DETAIL MODAL COMPONENT (Working Modal) ---
const ApplicantDetailModal = ({ company, allApplications, onClose }) => {
    const companyId = company._id;
    // Filter applications where companyId matches (accessing the populated ID)
    const applicants = allApplications.filter(app => (app.companyId?._id || app.companyId) === companyId);

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            <div style={{ 
                backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
                width: '700px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
            }}>
                <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px', color: '#333' }}>
                    Applicants for: {company.name}
                </h3>
                <p>Total Applicants: <strong>{applicants.length}</strong></p>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Branch</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.length > 0 ? (
                                applicants.map((app) => {
                                    const student = app.studentId; // Student data is populated
                                    const statusChip = getStatusChipColor(app.status);
                                    
                                    return (
                                        <tr key={app._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{student?.name || student?.email || 'N/A'}</td>
                                            <td style={{ padding: '8px 10px' }}>{student?.email || 'N/A'}</td>
                                            <td style={{ padding: '8px 10px' }}>{student?.branch || 'N/A'}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <span style={{ 
                                                    backgroundColor: statusChip.bg, 
                                                    color: statusChip.text, 
                                                    padding: '4px 8px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '0.8em',
                                                }}>
                                                    {app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No applications recorded for this company.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Close
                </button>
            </div>
        </div>
    );
};
// --------------------------------------------------------------------------------


function AdminDashboard() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]); 
  const [appCounts, setAppCounts] = useState({});
  const [stats, setStats] = useState(analyzeStudents([])); 
  const [message, setMessage] = useState('');
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '', visitingDate: '', eligibility: { tenthMarks: '', twelfthMarks: '', cgpaAggregate: '', activeBacklog: 'no' },
  });
  const [showSendNotificationForm, setShowSendNotificationForm] = useState(false);
  const [notificationData, setNotificationData] = useState({
    companyName: '', message: '', eligibleStudents: [],
  });
  const [selectedCompanyForNotification, setSelectedCompanyForNotification] = useState(null);
  
  const [selectedCompanyForView, setSelectedCompanyForView] = useState(null); // MODAL STATE


  // Utility function to map IDs to Names (retained)
  const getStudentName = (id) => {
    const student = students.find(s => s._id === id);
    return student ? (student.name || student.email) : 'Unknown Student';
  };
  
  const getCompanyName = (id) => {
    const company = companies.find(c => c._id === id);
    return company ? company.name : 'Unknown Company';
  };
  
  const handleViewApplicants = (company) => {
    setSelectedCompanyForView(company);
  };


  // --- Data Fetch ---
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/admin/auth'); return; }

      try {
        const [companiesRes, studentsRes, applicationsRes] = await Promise.all([
          axios.get('/api/companies', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/applications/all', { headers: { Authorization: `Bearer ${token}` } }), 
        ]);
        
        setCompanies(companiesRes.data);
        setStudents(studentsRes.data);
        setApplications(applicationsRes.data); 
        
        const counts = countApplicationsByCompany(applicationsRes.data);
        setAppCounts(counts);
        setStats(analyzeStudents(studentsRes.data));
        
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setMessage(err.response?.data?.message || 'Failed to load data. Please ensure the backend server and MongoDB are running.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/admin/auth');
        }
      }
    };
    fetchAdminData();
  }, [navigate]);

  // Update Statistics on Student Data Change
  useEffect(() => { setStats(analyzeStudents(students)); }, [students]);


  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/'); };
  
  // --- CORE FUNCTIONAL HANDLERS (RESTORED) ---
  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in newCompany.eligibility) {
      setNewCompany({
        ...newCompany,
        eligibility: {
          ...newCompany.eligibility,
          [name]: type === 'checkbox' ? (checked ? 'yes' : 'no') : value,
        },
      });
    } else {
      setNewCompany({ ...newCompany, [name]: value });
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/companies', newCompany, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      setCompanies([...companies, response.data.company]);
      window.location.reload(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add company.');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) { return; }
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/companies/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Company deleted successfully.');
      window.location.reload(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete company.');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    const studentIdentifier = name || id; 
    if (!window.confirm(`Are you sure you want to permanently delete the student: ${studentIdentifier}?`)) { return; }
    setMessage('');
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setMessage(`Student ${studentIdentifier} deleted successfully.`);
        window.location.reload();
    } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to delete student.');
    }
  };

  const handleNotificationMessageChange = (e) => {
    setNotificationData({ ...notificationData, message: e.target.value });
  };
  
  const handleSendNotificationClick = async (company) => {
    setSelectedCompanyForNotification(company);
    setNotificationData({ ...notificationData, companyName: company.name, message: '' }); 
    setShowSendNotificationForm(true);

    const eligibleStudents = students.filter(student => {
      if (!student.tenthMarks || !student.twelfthMarks || !student.cgpaAggregate) return false;

      return (
        parseFloat(student.tenthMarks) >= parseFloat(company.eligibility.tenthMarks) &&
        parseFloat(student.twelfthMarks) >= parseFloat(company.eligibility.twelfthMarks) &&
        parseFloat(student.cgpaAggregate) >= parseFloat(company.eligibility.cgpaAggregate) &&
        (company.eligibility.activeBacklog === 'no' ? student.activeBacklog === 'no' : true)
      );
    });
    setNotificationData(prev => ({ 
      ...prev, 
      eligibleStudents: eligibleStudents.map(s => s._id)
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (notificationData.eligibleStudents.length === 0) {
        return setMessage('Error: No students are eligible for this company based on criteria.');
    }

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/admin/send-notification', notificationData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        setMessage(response.data.message);
        
        setNotificationData({ companyName: '', message: '', eligibleStudents: [] });
        setSelectedCompanyForNotification(null);
        setShowSendNotificationForm(false);
        
    } catch (error) {
        console.error("Notification Send Error:", error);
        setMessage(error.response?.data?.message || 'Failed to send notification.');
    }
  };
  // -----------------------------------------------------------


  return (
    <div className="dashboard-container">
      
      {/* --- MODAL OVERLAY --- */}
      {selectedCompanyForView && (
          <ApplicantDetailModal 
              company={selectedCompanyForView} 
              allApplications={applications} 
              onClose={() => setSelectedCompanyForView(null)}
          />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={{ width: 'auto', padding: '10px 20px', backgroundColor: '#dc3545' }}>Logout</button>
      </div>

      {message && <p style={{ color: message.includes('success') ? 'green' : 'red', textAlign: 'center' }}>{message}</p>}

      {/* -------------------------------------- */}
      {/* 📊 STATISTICS PANEL WITH CHARTS 📊 */}
      {/* -------------------------------------- */}
      <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Placement Statistics (Registered Profiles)</h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', marginBottom: '40px', textAlign: 'center' }}>
        
        {/* Total Registered Students Card */}
        <div className="card" style={{ width: '300px', padding: '20px', backgroundColor: '#e9f5ff', boxShadow: 'none' }}>
            <h2 style={{ color: '#007bff' }}>{stats.totalRegistered}</h2>
            <p>Total Registered Students</p>
        </div>

        {/* Gender Split Card - Pie Chart */}
        <div className="card" style={{ width: '300px', padding: '20px', backgroundColor: '#e9f5ff', boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Gender Split</h4>
            {stats.totalRegistered > 0 ? ( <GenderPieChart genderStats={stats.gender} /> ) : ( <p>No data</p> )}
        </div>

        {/* Department/Branch Breakdown - Pie Chart */}
        <div className="card" style={{ width: '400px', padding: '20px', backgroundColor: '#e9f5ff', boxShadow: 'none' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Branch-wise Applicants</h4>
            {stats.totalRegistered > 0 ? ( <BranchPieChart branchStats={stats.branch} /> ) : ( <p>No data</p> )}
        </div>
      </div>
      <hr />
      
      
      {/* --- APPLICATIONS OVERVIEW TABLE (NEW FEATURE) --- */}
      <h3 style={{ marginTop: '40px', borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Application Summary (Total Companies: {companies.length})</h3>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '0', marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
              <th style={{ border: '1px solid #007bff', padding: '12px', textAlign: 'left' }}>Company Name</th>
              <th style={{ border: '1px solid #007bff', padding: '12px', textAlign: 'center' }}>Total Applied</th>
              <th style={{ border: '1px solid #007bff', padding: '12px', textAlign: 'left' }}>Last Visiting Date</th>
              <th style={{ border: '1px solid #007bff', padding: '12px', textAlign: 'left' }}>View Applicants</th> 
            </tr>
          </thead>
          <tbody>
            {companies.length > 0 ? (
              companies.map((company) => {
                const count = appCounts[company._id] || 0;
                return (
                  <tr key={company._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #eee', padding: '10px', textAlign: 'left' }}>
                      <strong>{company.name}</strong>
                    </td>
                    <td style={{ border: '1px solid #eee', padding: '10px', textAlign: 'center' }}>
                      <span style={{ 
                          backgroundColor: count > 0 ? '#ffee58' : '#e0e0e0', 
                          color: count > 0 ? '#333' : '#757575',
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontWeight: 'bold',
                          fontSize: '0.9em'
                      }}>
                          {count}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #eee', padding: '10px', textAlign: 'left' }}>
                      {new Date(company.visitingDate).toLocaleDateString()}
                    </td>
                    <td style={{ border: '1px solid #eee', padding: '10px', textAlign: 'left' }}>
                      <button 
                        onClick={() => handleViewApplicants(company)}
                        style={{ padding: '4px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        disabled={count === 0}
                      >
                        View Applicants
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#555' }}>
                  No companies are listed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* ----------------------------------------------------------- */}


      <button onClick={() => setShowAddCompanyForm(!showAddCompanyForm)} style={{ marginTop: '30px', marginBottom: '20px', width: 'auto', padding: '10px 20px' }}>
        {showAddCompanyForm ? 'Cancel Add Company' : 'Add New Company'}
      </button>

      {showAddCompanyForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Company</h3>
          <form onSubmit={handleAddCompany}>
            <div className="form-group">
              <label htmlFor="companyName">Company Name:</label>
              <input type="text" id="companyName" name="name" value={newCompany.name} onChange={handleCompanyChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="visitingDate">Visiting Date:</label>
              <input type="date" id="visitingDate" name="visitingDate" value={newCompany.visitingDate} onChange={handleCompanyChange} required />
            </div>
            <h4>Eligibility Criteria:</h4>
            <div className="form-group">
              <label htmlFor="eligibilityTenth">10th Marks (%):</label>
              <input type="number" id="eligibilityTenth" name="tenthMarks" value={newCompany.eligibility.tenthMarks} onChange={handleCompanyChange} min="0" max="100" required />
            </div>
            <div className="form-group">
              <label htmlFor="eligibilityTwelfth">12th Marks (%):</label>
              <input type="number" id="eligibilityTwelfth" name="twelfthMarks" value={newCompany.eligibility.twelfthMarks} onChange={handleCompanyChange} min="0" max="100" required />
            </div>
            <div className="form-group">
              <label htmlFor="eligibilityCgpa">CGPA Aggregate:</label>
              <input type="number" id="eligibilityCgpa" name="cgpaAggregate" value={newCompany.eligibility.cgpaAggregate} onChange={handleCompanyChange} min="0" max="10" step="0.01" required />
            </div>
            <div className="form-group">
              <input type="checkbox" id="eligibilityBacklog" name="activeBacklog" checked={newCompany.eligibility.activeBacklog === 'yes'} onChange={handleCompanyChange} />
              <label htmlFor="eligibilityBacklog" style={{ display: 'inline' }}>Allows Active Backlog</label>
            </div>
            <button type="submit">Add Company</button>
          </form>
        </div>
      )}

      <h3 style={{ marginTop: '40px' }}>Companies Visiting Campus</h3>
      {companies.length > 0 ? (
        companies.map((company) => (
          <div key={company._id} className="company-card">
            <h3>{company.name}</h3>
            <p><strong>Visiting Date:</strong> {new Date(company.visitingDate).toLocaleDateString()}</p>
            <p><strong>Eligibility:</strong></p>
            <ul>
              <li>10th Marks: {company.eligibility.tenthMarks}%</li>
              <li>12th Marks: {company.eligibility.twelfthMarks}%</li>
              <li>CGPA: {company.eligibility.cgpaAggregate}</li>
              <li>Active Backlog: {company.eligibility.activeBacklog === 'yes' ? 'Yes' : 'No'}</li>
            </ul>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button
                    onClick={() => handleSendNotificationClick(company)}
                    style={{ width: 'auto', padding: '8px 15px', backgroundColor: '#28a745' }}
                >
                    Send Notification
                </button>
                <button
                    onClick={() => handleDeleteCompany(company._id)}
                    style={{ width: 'auto', padding: '8px 15px', backgroundColor: '#dc3545' }}
                >
                    Delete Company
                </button>
            </div>
          </div>
        ))
      ) : (
        <p>No companies added yet.</p>
      )}

      {showSendNotificationForm && selectedCompanyForNotification && (
        <div className="form-container" style={{ marginTop: '30px' }}>
          <h3>Send Notification for {selectedCompanyForNotification.name}</h3>
          <p>Eligible Students Count: {notificationData.eligibleStudents.length}</p>
          <form onSubmit={handleSendNotification}>
            <div className="form-group">
              <label htmlFor="notificationMessage">Message:</label>
              <textarea
                id="notificationMessage"
                name="message"
                value={notificationData.message}
                onChange={handleNotificationMessageChange}
                rows="4"
                required
                style={{ width: 'calc(100% - 20px)', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              ></textarea>
            </div>
            <button type="submit">Send Notification</button>
            <button
              type="button"
              onClick={() => setShowSendNotificationForm(false)}
              style={{ width: 'auto', padding: '10px 20px', marginTop: '10px', backgroundColor: '#6c757d', marginLeft: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <h3 style={{ marginTop: '40px' }}>Registered Students</h3>
      {students.length > 0 ? (
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Branch</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Div</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>10th</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>12th</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>CGPA</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Backlog</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Gender</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id}>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.name || 'N/A (Signup Only)'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.branch || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.division || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.tenthMarks || '0'}%</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.twelfthMarks || '0'}%</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.cgpaAggregate || '0'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.activeBacklog === 'yes' ? 'Yes' : 'No'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>{student.gender || 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>
                    <button
                        onClick={() => handleDeleteStudent(student._id, student.name || student.email)}
                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', width: 'auto' }}
                    >
                        Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <p>No students registered yet.</p>
      )}
    </div>
  );
}

export default AdminDashboard;