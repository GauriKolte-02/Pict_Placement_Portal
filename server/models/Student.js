const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  className: { type: String, default: '' }, // SE, TE, BE
  division: { type: String, default: '' }, // 1-15
  branch: { type: String, enum: ['ENTC', 'IT', 'ECE', 'CE', 'AIDS', ''], default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  mobileNumber: { type: String, default: '' },
  tenthMarks: { type: Number, min: 0, max: 100, default: 0 },
  twelfthMarks: { type: Number, min: 0, max: 100, default: 0 },
  cgpaAggregate: { type: Number, min: 0, max: 10, default: 0 },
  activeBacklog: { type: String, enum: ['yes', 'no'], default: 'no' },
  resumeUrl: { type: String, default: '' },
  notifications: [{ companyName: String, message: String, date: { type: Date, default: Date.now } }],
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;