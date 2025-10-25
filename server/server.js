require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// NOTE: Assuming your folder name on GitHub is correctly capitalized as 'Routes'
const studentRoutes = require('./Routes/studentRoutes'); 
const adminRoutes = require('./Routes/adminRoutes');
const companyRoutes = require('./Routes/companyRoutes');
const Notification = require('./models/Notification'); 
const Admin = require('./models/Admin'); 

const app = express();
// VVV CRITICAL FIX: Tell Express to trust the proxy (Render) VVV
app.set('trust proxy', 1); 
// ^^^ CRITICAL FIX ^^^

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
        password: process.env.ADMIN_PASSWORD,
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