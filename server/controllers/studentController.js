const Student = require('../models/Student');
const Company = require('../models/Company');
const Application = require('../models/Application');
const generateToken = require('../utils/generateToken');

const registerStudent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const studentExists = await Student.findOne({ email });
    if (studentExists) { return res.status(400).json({ message: 'Student with this email already exists' }); }
    const student = await Student.create({ email, password });
    if (student) {
      res.status(201).json({ message: 'Student account created successfully. Please login.', _id: student._id, email: student.email, token: generateToken(student._id, 'student') });
    } else { res.status(400).json({ message: 'Invalid student data' }); }
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error during registration' }); }
};

const authStudent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (student && (await student.matchPassword(password))) {
      res.json({ message: 'Login successful', _id: student._id, email: student.email, token: generateToken(student._id, 'student') });
    } else { res.status(401).json({ message: 'Invalid email or password' }); }
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error during login' }); }
};

const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    if (student) { res.json(student); } else { res.status(404).json({ message: 'Student profile not found' }); }
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error while fetching profile' }); }
};

const createOrUpdateStudentProfile = async (req, res) => {
    const studentId = req.user._id;
    const { name, className, division, branch, gender, mobileNumber, tenthMarks, twelfthMarks, cgpaAggregate, activeBacklog, resumeUrl } = req.body;
    try {
      let student = await Student.findById(studentId);
      if (!student) { return res.status(404).json({ message: 'Student not found.' }); }
      
      // Update fields
      student.name = name || student.name;
      student.className = className || student.className;
      student.division = division || student.division;
      student.branch = branch || student.branch;
      student.gender = gender || student.gender;
      student.mobileNumber = mobileNumber || student.mobileNumber;
      student.tenthMarks = tenthMarks !== undefined ? tenthMarks : student.tenthMarks;
      student.twelfthMarks = twelfthMarks !== undefined ? twelfthMarks : student.twelfthMarks;
      student.cgpaAggregate = cgpaAggregate !== undefined ? cgpaAggregate : student.cgpaAggregate;
      student.activeBacklog = activeBacklog || student.activeBacklog;
      student.resumeUrl = resumeUrl || student.resumeUrl;
      
      const updatedStudent = await student.save();
      res.json({ message: 'Student profile updated successfully', student: updatedStudent });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error while updating profile' }); }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).select('-password'); 
    res.json(students);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error while fetching students' }); }
};

const getEligibleCompanies = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student || !student.name) { return res.status(404).json({ message: 'Student profile incomplete. Please complete registration.' }); }
    const companies = await Company.find({}); 
    const eligibleCompanies = companies.filter(company => {
      const { eligibility } = company;
      return (
        student.tenthMarks >= eligibility.tenthMarks &&
        student.twelfthMarks >= eligibility.twelfthMarks &&
        student.cgpaAggregate >= eligibility.cgpaAggregate &&
        (eligibility.activeBacklog === 'no' ? student.activeBacklog === 'no' : true)
      );
    });
    res.json(eligibleCompanies);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error while fetching eligible companies' }); }
};

const getStudentNotifications = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('notifications');
    if (student) { res.json(student.notifications.sort((a, b) => b.date - a.date)); } else { res.status(404).json({ message: 'Student not found' }); }
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error while fetching notifications' }); }
};

const deleteStudent = async (req, res) => {
  try {
    if (req.role !== 'admin') { return res.status(403).json({ message: 'Not authorized to delete student entries' }); }
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student) { res.json({ message: 'Student removed successfully' }); } else { res.status(404).json({ message: 'Student not found' }); }
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error while deleting student' }); }
};

// --- Application Logic (FIXED: Added population) ---
const applyToCompany = async (req, res) => {
    const studentId = req.user._id;
    const { companyId } = req.params;
    try {
        const existingApplication = await Application.findOne({ studentId, companyId });
        if (existingApplication) { return res.status(400).json({ message: 'You have already applied to this company.' }); }
        
        const application = new Application({ studentId, companyId });
        await application.save();
        
        // VVV CRITICAL FIX: Populate company data before sending response VVV
        await application.populate('companyId', 'name visitingDate');
        // ^^^ CRITICAL FIX ^^^

        res.status(201).json({ message: 'Application submitted successfully!', application });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Server error during application submission.' });
    }
};

const getStudentApplications = async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user._id })
            .populate('companyId', 'name visitingDate')
            .sort({ dateApplied: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Server error while fetching applications.' });
    }
};


module.exports = {
  registerStudent, authStudent, getStudentProfile, createOrUpdateStudentProfile, 
  getAllStudents, getEligibleCompanies, getStudentNotifications, deleteStudent,
  applyToCompany, getStudentApplications,
};