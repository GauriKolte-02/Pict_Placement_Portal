const Admin = require('../models/Admin');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        message: 'Admin login successful',
        _id: admin._id,
        email: admin.email,
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// @desc    Send notification to eligible students
// @route   POST /api/admin/send-notification
// @access  Private (Admin)
const sendNotificationToStudents = async (req, res) => {
  const { companyName, message, eligibleStudents } = req.body; // eligibleStudents is an array of student IDs

  if (!companyName || !message || !eligibleStudents || eligibleStudents.length === 0) {
    return res.status(400).json({ message: 'Please provide company name, message, and eligible students.' });
  }

  try {
    const notification = {
      companyName,
      message,
      date: new Date(),
    };

    // Update notifications array for each eligible student
    const updateResult = await Student.updateMany(
      { _id: { $in: eligibleStudents } },
      { $push: { notifications: notification } }
    );

    res.status(200).json({
      message: `Notification sent to ${updateResult.modifiedCount} eligible students successfully.`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while sending notification' });
  }
};


module.exports = {
  authAdmin,
  sendNotificationToStudents,
};