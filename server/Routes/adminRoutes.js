const express = require('express');
const { authAdmin, sendNotificationToStudents } = require('../controllers/adminController');
const Application = require('../models/Application'); // Import Application model
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authAdmin);
router.post('/send-notification', protect(['admin']), sendNotificationToStudents);

// CRITICAL FIX: Endpoint to Fetch ALL applications for Admin Dashboard
router.get('/applications/all', protect(['admin']), async (req, res) => {
    try {
        // Fetch applications, populating necessary names for the dashboard table
        const applications = await Application.find({})
            .populate('studentId', 'name email mobileNumber branch') 
            // VVV FIX: Include visitingDate for complete data VVV
            .populate('companyId', 'name visitingDate'); 

        res.json(applications);
    } catch (error) {
        console.error('CRASH ERROR FETCHING ADMIN APPLICATIONS:', error);
        res.status(500).json({ message: 'Failed to fetch all application data from server. Check console for details.' });
    }
});

module.exports = router;