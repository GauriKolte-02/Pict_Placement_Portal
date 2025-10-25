const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  visitingDate: {
    type: Date,
    required: true,
  },
  eligibility: {
    tenthMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    twelfthMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    cgpaAggregate: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    activeBacklog: {
      type: String,
      enum: ['yes', 'no'],
      required: true,
    },
  },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;