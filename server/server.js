require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyRoutes = require('./routes/companyRoutes');
const Notification = require('./models/Notification'); // For admin to student notifications
const Admin = require('./models/Admin'); // For initial admin creation

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Create default admin if not exists
    createDefaultAdmin();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Function to create a default admin
async function createDefaultAdmin() {
  try {
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      const newAdmin = new Admin({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // Password will be hashed by the pre-save hook
      });
      await newAdmin.save();
      console.log('Default admin created:', newAdmin.email);
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}


// Routes
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companyRoutes);


app.get('/', (req, res) => {
  res.send('Placement Management System API is running!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});