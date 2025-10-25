const express = require('express');
const { addCompany, getCompanies, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect(['admin']), addCompany) // Only admin can add companies
  .get(protect(['admin', 'student']), getCompanies); // Both can view companies (students will see filtered list via studentController)

router.delete('/:id', protect(['admin']), deleteCompany);

module.exports = router;