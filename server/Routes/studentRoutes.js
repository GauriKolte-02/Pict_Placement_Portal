const express = require('express');
const {
  registerStudent, authStudent, getStudentProfile, createOrUpdateStudentProfile, 
  getAllStudents, deleteStudent, getEligibleCompanies, getStudentNotifications,
  applyToCompany, getStudentApplications,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', authStudent);

router.route('/profile')
  .get(protect(['student']), getStudentProfile)
  .post(protect(['student']), createOrUpdateStudentProfile)
  .put(protect(['student']), createOrUpdateStudentProfile);

router.delete('/:id', protect(['admin']), deleteStudent);
router.get('/', protect(['admin']), getAllStudents); 
router.get('/eligible-companies', protect(['student']), getEligibleCompanies);
router.get('/notifications', protect(['student']), getStudentNotifications);

// Application Routes
router.post('/apply/:companyId', protect(['student']), applyToCompany); 
router.get('/applications', protect(['student']), getStudentApplications);

module.exports = router;