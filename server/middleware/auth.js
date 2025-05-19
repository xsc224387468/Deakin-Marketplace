const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

module.exports = async function (req, res, next) {
  console.log('Auth middleware - Request headers:', req.headers);
  console.log('Auth middleware - Request path:', req.path);
  console.log('Auth middleware - Request method:', req.method);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth middleware - No token or invalid format');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Auth middleware - Token received:', token.substring(0, 10) + '...');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Token decoded:', decoded);
    req.user = { 
      id: decoded.userId.toString(),
      userId: decoded.userId.toString()
    };
    next();
  } catch (err) {
    console.error('Auth middleware - Token verification failed:', err);
    console.error('Auth middleware - Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 