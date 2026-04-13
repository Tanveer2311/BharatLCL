/**
 * Authentication Routes — User Registration, Login, Profile
 * 
 * @module server/routes/auth
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mobileNumber, businessName, gstNumber } = req.body;

    // Validation
    if (!name || !email || !password || !role || !mobileNumber) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'All required fields must be provided' }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: { message: 'Email already registered' } });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ name, email, passwordHash, role, mobileNumber, businessName, gstNumber });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name, email, role, businessName }, token },
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    // Find user and verify password
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, businessName: user.businessName }, token },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

module.exports = router;
