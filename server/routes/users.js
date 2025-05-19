const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage });
const auth = require('../middleware/auth');

// Validate Deakin email format
const isValidDeakinEmail = (email) => {
  const deakinEmailRegex = /^[a-zA-Z0-9._%+-]+@deakin\.edu\.au$/;
  return deakinEmailRegex.test(email);
};

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new user (Register)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        
        // Validate Deakin email format
        if (!isValidDeakinEmail(email)) {
            return res.status(400).json({ message: 'Please use a valid Deakin email address (@deakin.edu.au)' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({
            email,
            password,
            name,
            phone
        });
        const newUser = await user.save();
        const token = jwt.sign(
            { userId: newUser._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful for user:', email);
        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Ensure consistent user ID format
        const userResponse = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            profileImage: user.profileImage
        };

        console.log('Sending response with token and user data');
        res.json({
            token,
            user: userResponse
        });
    } catch (err) {
        console.error('Login error:', err);
        console.error('Error details:', {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get user by Deakin ID
router.get('/:deakinId', async (req, res) => {
    try {
        const user = await User.findOne({ deakinId: req.params.deakinId })
            .select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 修改用户信息（用户名、头像）
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.name) user.name = req.body.name;
    if (req.file) user.profileImage = '/uploads/' + req.file.filename;
    await user.save();
    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 修改密码
router.post('/change-password', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await user.comparePassword(oldPassword))) {
      return res.status(400).json({ message: 'Old password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 