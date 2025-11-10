const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received with body:', {
      ...req.body,
      password: req.body.password ? '[HIDDEN]' : undefined,
      confirmPassword: req.body.confirmPassword ? '[HIDDEN]' : undefined
    });

    // Extract and normalize fields
    const name = req.body.fullName || req.body.name;
    const { email, password, confirmPassword, phone } = req.body;

    console.log('Processing registration for:', { name, email, phone: phone || 'Not provided' });

    console.log('Parsed fields:', { name, email, hasPassword: !!password, hasConfirmPassword: !!confirmPassword });

    if (!name || !email || !password || !confirmPassword) {
      console.log('Missing required fields');
      return res.status(400).json({
        message: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Enhanced password validation
    if (password !== confirmPassword) {
      console.log('Password mismatch error');
      return res.status(400).json({
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      });
    }

    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // Additional strength checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (strengthScore < 2 && password.length < 8) {
      return res.status(400).json({
        message: 'Password is too weak. Please include uppercase letters, lowercase letters, numbers, or special characters',
        code: 'WEAK_PASSWORD',
        suggestions: [
          'Use at least 8 characters',
          'Include uppercase letters (A-Z)',
          'Include lowercase letters (a-z)',
          'Include numbers (0-9)',
          'Include special characters (!@#$%^&*)'
        ]
      });
    }

    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        message: 'Phone number is required',
        code: 'PHONE_REQUIRED'
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: 'Phone number must be exactly 10 digits',
        code: 'INVALID_PHONE'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({
        message: 'Account already exists with this email. Please sign in.',
        code: 'USER_EXISTS'
      });
    }

    console.log('Creating new user with email:', email);

    // Create user with hashed password
    user = new User({
      name,
      email,
      password: password,
      phone: phone,
      balance: 10000 // Initial balance of ₹10,000
    });

    // Save user to database
    try {
      const savedUser = await user.save();
      console.log('User saved successfully:', savedUser._id);

      // Create JWT token
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Send response
      res.status(201).json({
        token,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          balance: savedUser.balance,
          phone: savedUser.phone
        }
      });
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      res.status(500).json({
        message: 'Error creating account',
        code: 'DB_ERROR',
        error: saveError.message
      });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('=== LOGIN REQUEST ===');
  console.log('Email:', email);
  console.log('Password length:', password?.length || 0);
  console.log('Request body keys:', Object.keys(req.body));

  try {
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    if (user) {
      console.log('User details:', {
        id: user._id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Would you like to sign up?',
        code: 'USER_NOT_FOUND'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    console.log('Stored password hash length:', user.password?.length || 0);

    if (!isMatch) {
      console.log('Password mismatch - Login failed');
      return res.status(401).json({
        message: 'Incorrect password. Please try again.',
        code: 'INVALID_PASSWORD'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
  try {
    console.log('Fetching current user data for:', req.user._id);

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      id: user._id, // Include both for compatibility
      name: user.name,
      email: user.email,
      balance: user.balance,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
