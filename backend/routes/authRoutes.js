const express = require('express');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');
const { authValidation, validate } = require('../utils/validation');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateRefreshToken,
  generateRandomToken,
  formatSuccessResponse,
  sanitizeUser
} = require('../utils/helpers');
const { authenticate } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Register user
router.post('/register', validate(authValidation.register), async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, role, first_name, last_name, phone, status, created_at`,
      [email, password_hash, role, first_name, last_name, phone, role === 'customer' ? 'active' : 'pending_approval']
    );

    const user = result.rows[0];

    // If customer, create customer record
    if (role === 'customer') {
      await query(
        'INSERT INTO customers (user_id) VALUES ($1)',
        [user.id]
      );
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info(`New user registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(user),
        token,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', validate(authValidation.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: `Account is ${user.status}. Please contact support.`
      });
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info(`User logged in: ${email}`);

    res.json(formatSuccessResponse({
      user: sanitizeUser(user),
      token,
      refreshToken
    }, 'Login successful'));

  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Get user
    const result = await query(
      'SELECT id, email, role, status FROM users WHERE id = $1 AND status = $2',
      [decoded.userId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const user = result.rows[0];

    // Generate new tokens
    const newToken = generateToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.json(formatSuccessResponse({
      token: newToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully'));

  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
    
    logger.info(`User logged out: ${req.user.email}`);

    res.json(formatSuccessResponse(null, 'Logout successful'));

  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', validate(authValidation.forgotPassword), async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const result = await query(
      'SELECT id, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json(formatSuccessResponse(null, 'If the email exists, a password reset link has been sent'));
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database (you might want to create a separate table for this)
    await query(
      `UPDATE users SET 
       preferences = COALESCE(preferences, '{}') || 
       jsonb_build_object('reset_token', $1, 'reset_token_expiry', $2)
       WHERE id = $3`,
      [resetToken, resetTokenExpiry.toISOString(), user.id]
    );

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(email, resetToken, user.first_name);

    logger.info(`Password reset requested for: ${email}`);

    res.json(formatSuccessResponse(null, 'If the email exists, a password reset link has been sent'));

  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', validate(authValidation.resetPassword), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const result = await query(
      `SELECT id, email FROM users 
       WHERE preferences->>'reset_token' = $1 
       AND (preferences->>'reset_token_expiry')::timestamp > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const user = result.rows[0];

    // Hash new password
    const password_hash = await hashPassword(password);

    // Update password and clear reset token
    await query(
      `UPDATE users SET 
       password_hash = $1,
       preferences = preferences - 'reset_token' - 'reset_token_expiry'
       WHERE id = $2`,
      [password_hash, user.id]
    );

    logger.info(`Password reset completed for: ${user.email}`);

    res.json(formatSuccessResponse(null, 'Password reset successful'));

  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticate, validate(authValidation.changePassword), async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await comparePassword(current_password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const new_password_hash = await hashPassword(new_password);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [new_password_hash, userId]
    );

    logger.info(`Password changed for user: ${req.user.email}`);

    res.json(formatSuccessResponse(null, 'Password changed successfully'));

  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    // Get detailed user info based on role
    let userQuery = `
      SELECT u.*, 
             CASE 
               WHEN u.role = 'customer' THEN c.company_name
               WHEN u.role = 'driver' THEN d.license_number
               ELSE NULL 
             END as role_specific_info
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id AND u.role = 'customer'
      LEFT JOIN drivers d ON u.id = d.user_id AND u.role = 'driver'
      WHERE u.id = $1
    `;

    const result = await query(userQuery, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = sanitizeUser(result.rows[0]);

    res.json(formatSuccessResponse(user, 'User profile retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
