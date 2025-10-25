const Company = require('../models/Company');

// @desc    Add a new company
// @route   POST /api/companies
// @access  Private (Admin)
const addCompany = async (req, res) => {
  const { name, visitingDate, eligibility } = req.body;

  try {
    const companyExists = await Company.findOne({ name });
    if (companyExists) {
      return res.status(400).json({ message: 'Company with this name already exists' });
    }

    const company = await Company.create({
      name,
      visitingDate,
      eligibility,
    });

    res.status(201).json({ message: 'Company added successfully', company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while adding company' });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Admin/Student) - Students get filtered list
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching companies' });
  }
};
const deleteCompany = async (req, res) => {
  try {
    // Check if the requester is an Admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete company entries' });
    }

    const company = await Company.findByIdAndDelete(req.params.id);

    if (company) {
      res.json({ message: 'Company removed successfully' });
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting company' });
  }
};

module.exports = {
  addCompany,
  getCompanies,
  deleteCompany,
};