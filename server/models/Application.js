const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  dateApplied: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Placed'],
    default: 'Applied',
  },
  interviewDate: {
    type: Date,
  },
  interviewLink: {
    type: String,
  },
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;