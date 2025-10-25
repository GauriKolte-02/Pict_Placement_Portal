const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = (roles = []) => async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'student') {
        req.user = await Student.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else {
        return res.status(401).json({ message: 'Not authorized, invalid role' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Not authorized, insufficient role' });
      }

      req.role = decoded.role; // Attach role to request
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };