/**
 * Authentication Routes — User Registration, Login, Profile
 * 
 * Works in two modes:
 *   1. MongoDB connected  → persists users via Mongoose User model
 *   2. No MongoDB         → uses a secure in-memory store (dev/demo mode)
 * 
 * @module server/routes/auth
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ============================================
// In-Memory User Store (fallback when no DB)
// ============================================
const inMemoryUsers = [];

/**
 * Helper — check if MongoDB is currently connected
 */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Helper — generate a unique ID for in-memory users
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// ============================================
// ROUTES
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mobileNumber, businessName, gstNumber } = req.body;

    // --- Validation ---
    if (!name || !email || !password || !role || !mobileNumber) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'All required fields must be provided (name, email, password, role, mobileNumber)' }
      });
    }

    // Validate role
    const validRoles = ['exporter', 'transporter', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid role. Must be one of: ${validRoles.join(', ')}` }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid email address' }
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long' }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    let userData;

    if (isDbConnected()) {
      // ---------- MongoDB Mode ----------
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: 'Email already registered' }
        });
      }

      const user = await User.create({
        name, email, passwordHash, role, mobileNumber, businessName, gstNumber
      });

      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName || null,
        gstNumber: user.gstNumber || null,
        createdAt: user.createdAt
      };
    } else {
      // ---------- In-Memory Mode ----------
      const existingUser = inMemoryUsers.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: 'Email already registered' }
        });
      }

      const newUser = {
        id: generateId(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        mobileNumber,
        businessName: businessName || null,
        gstNumber: gstNumber || null,
        createdAt: new Date()
      };
      inMemoryUsers.push(newUser);

      userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        mobileNumber: newUser.mobileNumber,
        businessName: newUser.businessName,
        gstNumber: newUser.gstNumber,
        createdAt: newUser.createdAt
      };
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userData.id, role: userData.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: { user: userData, token },
      message: 'Registration successful',
      mode: isDbConnected() ? 'database' : 'in-memory'
    });
  } catch (error) {
    console.error('Registration error:', error.message);
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

    let userData;

    if (isDbConnected()) {
      // ---------- MongoDB Mode ----------
      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
        });
      }

      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName || null,
        gstNumber: user.gstNumber || null,
        createdAt: user.createdAt
      };
    } else {
      // ---------- In-Memory Mode ----------
      const user = inMemoryUsers.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Invalid credentials' }
        });
      }

      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
        createdAt: user.createdAt
      };
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userData.id, role: userData.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { user: userData, token },
      message: 'Login successful',
      mode: isDbConnected() ? 'database' : 'in-memory'
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires valid JWT)
 */
router.get('/profile', protect, async (req, res) => {
  try {
    let userData;

    if (isDbConnected()) {
      // ---------- MongoDB Mode ----------
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName || null,
        gstNumber: user.gstNumber || null,
        createdAt: user.createdAt
      };
    } else {
      // ---------- In-Memory Mode ----------
      const user = inMemoryUsers.find(u => u.id === req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }
      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
        createdAt: user.createdAt
      };
    }

    res.json({
      success: true,
      data: { user: userData },
      mode: isDbConnected() ? 'database' : 'in-memory'
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private (requires valid JWT)
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, mobileNumber, businessName, gstNumber } = req.body;
    let userData;

    if (isDbConnected()) {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      if (name) user.name = name;
      if (mobileNumber) user.mobileNumber = mobileNumber;
      if (businessName !== undefined) user.businessName = businessName;
      if (gstNumber !== undefined) user.gstNumber = gstNumber;
      await user.save();

      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName || null,
        gstNumber: user.gstNumber || null,
        createdAt: user.createdAt
      };
    } else {
      const userIdx = inMemoryUsers.findIndex(u => u.id === req.user.userId);
      if (userIdx === -1) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      const user = inMemoryUsers[userIdx];
      if (name) user.name = name;
      if (mobileNumber) user.mobileNumber = mobileNumber;
      if (businessName !== undefined) user.businessName = businessName;
      if (gstNumber !== undefined) user.gstNumber = gstNumber;

      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
        createdAt: user.createdAt
      };
    }

    res.json({
      success: true,
      data: { user: userData },
      message: 'Profile updated successfully',
      mode: isDbConnected() ? 'database' : 'in-memory'
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires valid JWT)
 */
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required' }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'New password must be at least 6 characters long' }
      });
    }

    if (isDbConnected()) {
      const user = await User.findById(req.user.userId).select('+passwordHash');
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Current password is incorrect' }
        });
      }

      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();
    } else {
      const user = inMemoryUsers.find(u => u.id === req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Current password is incorrect' }
        });
      }

      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
      mode: isDbConnected() ? 'database' : 'in-memory'
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

module.exports = router;
