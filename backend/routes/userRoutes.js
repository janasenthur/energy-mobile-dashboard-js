const express = require('express');
const { query } = require('../config/database');
const { userValidation, validate } = require('../utils/validation');
const { formatSuccessResponse, sanitizeUser, comparePassword } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get detailed user info with role-specific data
    const userQuery = `
      SELECT 
        u.*,
        CASE 
          WHEN u.role = 'customer' THEN 
            json_build_object(
              'company_name', c.company_name,
              'business_type', c.business_type,
              'total_spent', c.total_spent,
              'rating', c.rating
            )
          WHEN u.role = 'driver' THEN 
            json_build_object(
              'license_number', d.license_number,
              'license_expiry_date', d.license_expiry_date,
              'availability', d.availability,
              'rating', d.rating,
              'total_jobs', d.total_jobs,
              'total_earnings', d.total_earnings,
              'is_verified', d.is_verified
            )
          ELSE NULL 
        END as role_data
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id AND u.role = 'customer'
      LEFT JOIN drivers d ON u.id = d.user_id AND u.role = 'driver'
      WHERE u.id = $1
    `;

    const result = await query(userQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = sanitizeUser(result.rows[0]);

    res.json(formatSuccessResponse(user, 'Profile retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/update-profile', authenticate, validate(userValidation.updateProfile), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone, preferences } = req.body;

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }

    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (preferences !== undefined) {
      updateFields.push(`preferences = COALESCE(preferences, '{}') || $${paramCount}::jsonb`);
      values.push(JSON.stringify(preferences));
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, role, first_name, last_name, phone, preferences, updated_at
    `;

    const result = await query(updateQuery, values);
    const updatedUser = sanitizeUser(result.rows[0]);

    logger.info(`User profile updated: ${req.user.email}`);

    res.json(formatSuccessResponse(updatedUser, 'Profile updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Get user notifications settings
router.get('/notification-settings', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT preferences->>'notification_settings' as settings FROM users WHERE id = $1`,
      [userId]
    );

    const settings = result.rows[0]?.settings ? JSON.parse(result.rows[0].settings) : {
      job_notifications: true,
      payment_notifications: true,
      system_notifications: true,
      emergency_notifications: true,
      message_notifications: true,
      push_enabled: true,
      email_enabled: false,
      sms_enabled: false
    };

    res.json(formatSuccessResponse(settings, 'Notification settings retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Update notification settings
router.put('/notification-settings', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

    await query(
      `UPDATE users 
       SET preferences = COALESCE(preferences, '{}') || jsonb_build_object('notification_settings', $1::jsonb)
       WHERE id = $2`,
      [JSON.stringify(settings), userId]
    );

    logger.info(`Notification settings updated for user: ${req.user.email}`);

    res.json(formatSuccessResponse(settings, 'Notification settings updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Update push token
router.post('/push-token', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { push_token } = req.body;

    if (!push_token) {
      return res.status(400).json({
        success: false,
        error: 'Push token is required'
      });
    }

    await query(
      'UPDATE users SET push_token = $1 WHERE id = $2',
      [push_token, userId]
    );

    logger.info(`Push token updated for user: ${req.user.email}`);

    res.json(formatSuccessResponse(null, 'Push token updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Get user statistics (role-specific)
router.get('/statistics', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let statistics = {};

    if (userRole === 'customer') {
      const result = await query(
        `SELECT 
           COUNT(j.id) as total_jobs,
           COUNT(CASE WHEN j.status = 'delivered' THEN 1 END) as completed_jobs,
           COUNT(CASE WHEN j.status = 'pending' THEN 1 END) as pending_jobs,
           COALESCE(SUM(j.total_price), 0) as total_spent,
           COALESCE(AVG(j.customer_rating), 0) as average_rating
         FROM customers c
         LEFT JOIN jobs j ON c.id = j.customer_id
         WHERE c.user_id = $1`,
        [userId]
      );

      statistics = result.rows[0];

    } else if (userRole === 'driver') {
      const result = await query(
        `SELECT 
           d.total_jobs,
           d.total_earnings,
           d.total_distance,
           d.rating,
           COUNT(CASE WHEN j.status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery') THEN 1 END) as active_jobs,
           COUNT(CASE WHEN j.status = 'delivered' AND j.actual_delivery_time >= CURRENT_DATE THEN 1 END) as jobs_today
         FROM drivers d
         LEFT JOIN jobs j ON d.id = j.driver_id
         WHERE d.user_id = $1
         GROUP BY d.id`,
        [userId]
      );

      statistics = result.rows[0] || {
        total_jobs: 0,
        total_earnings: 0,
        total_distance: 0,
        rating: 0,
        active_jobs: 0,
        jobs_today: 0
      };

    } else if (userRole === 'dispatcher' || userRole === 'admin') {
      const result = await query(
        `SELECT 
           COUNT(j.id) as total_jobs,
           COUNT(CASE WHEN j.status = 'pending' THEN 1 END) as pending_jobs,
           COUNT(CASE WHEN j.status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery') THEN 1 END) as active_jobs,
           COUNT(CASE WHEN j.status = 'delivered' THEN 1 END) as completed_jobs,
           COUNT(DISTINCT d.id) as total_drivers,
           COUNT(CASE WHEN d.availability = 'available' THEN 1 END) as available_drivers
         FROM jobs j
         FULL OUTER JOIN drivers d ON true
         WHERE j.created_at >= CURRENT_DATE - INTERVAL '30 days' OR j.id IS NULL`
      );

      statistics = result.rows[0];
    }

    res.json(formatSuccessResponse(statistics, 'Statistics retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password confirmation required'
      });
    }

    // Verify password
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect password'
      });
    }

    // Soft delete user (mark as inactive instead of actual deletion)
    await query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['inactive', userId]
    );

    logger.info(`User account deleted: ${req.user.email}`);

    res.json(formatSuccessResponse(null, 'Account deleted successfully'));

  } catch (error) {
    next(error);
  }
});

// Admin only: Get all users
router.get('/all', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const offset = (page - 1) * limit;

    // Build filters
    const filters = [];
    const values = [];
    let paramCount = 1;

    if (role) {
      filters.push(`u.role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (status) {
      filters.push(`u.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get users
    values.push(parseInt(limit), offset);
    const usersQuery = `
      SELECT 
        u.id, u.email, u.role, u.status, u.first_name, u.last_name, 
        u.phone, u.last_login, u.created_at,
        CASE 
          WHEN u.role = 'customer' THEN c.company_name
          WHEN u.role = 'driver' THEN d.license_number
          ELSE NULL 
        END as role_info
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id AND u.role = 'customer'
      LEFT JOIN drivers d ON u.id = d.user_id AND u.role = 'driver'
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(usersQuery, values);

    const response = {
      users: result.rows,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_records: total,
        total_pages: Math.ceil(total / limit)
      }
    };

    res.json(formatSuccessResponse(response, 'Users retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
