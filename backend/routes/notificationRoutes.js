const express = require('express');
const { query, transaction } = require('../config/database');
const { notificationValidation, validate } = require('../utils/validation');
const { 
  formatSuccessResponse, 
  formatPaginatedResponse,
  parsePagination,
  parseSorting
} = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get notifications for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, offset } = parsePagination(req.query);
    const { type, read_status } = req.query;

    // Build filters
    const whereConditions = ['nr.user_id = $1'];
    const values = [userId];
    let paramCount = 2;

    if (type) {
      whereConditions.push(`n.type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }

    if (read_status === 'read') {
      whereConditions.push('nr.read_at IS NOT NULL');
    } else if (read_status === 'unread') {
      whereConditions.push('nr.read_at IS NULL');
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM notifications n
      JOIN notification_recipients nr ON n.id = nr.notification_id
      ${whereClause}
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get notifications
    values.push(limit, offset);
    const notificationsQuery = `
      SELECT 
        n.*,
        nr.read_at,
        nr.delivered_at,
        nr.clicked_at
      FROM notifications n
      JOIN notification_recipients nr ON n.id = nr.notification_id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(notificationsQuery, values);
    const notifications = result.rows;

    const response = formatPaginatedResponse(notifications, page, limit, total);

    res.json(response);

  } catch (error) {
    next(error);
  }
});

// Get unread notifications count
router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT COUNT(*) as count
       FROM notifications n
       JOIN notification_recipients nr ON n.id = nr.notification_id
       WHERE nr.user_id = $1 AND nr.read_at IS NULL`,
      [userId]
    );

    const count = parseInt(result.rows[0].count);

    res.json(formatSuccessResponse({ unread_count: count }, 'Unread count retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.post('/read', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        error: 'notification_id is required'
      });
    }

    // Check if notification belongs to user
    const notificationResult = await query(
      'SELECT id FROM notification_recipients WHERE notification_id = $1 AND user_id = $2',
      [notification_id, userId]
    );

    if (notificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Mark as read
    await query(
      `UPDATE notification_recipients 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE notification_id = $1 AND user_id = $2`,
      [notification_id, userId]
    );

    res.json(formatSuccessResponse(null, 'Notification marked as read'));

  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.post('/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `UPDATE notification_recipients 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND read_at IS NULL
       RETURNING notification_id`,
      [userId]
    );

    const markedCount = result.rows.length;

    logger.info(`User ${userId} marked ${markedCount} notifications as read`);

    res.json(formatSuccessResponse(
      { marked_count: markedCount }, 
      'All notifications marked as read'
    ));

  } catch (error) {
    next(error);
  }
});

// Mark notification as clicked
router.post('/clicked', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        error: 'notification_id is required'
      });
    }

    // Update clicked status and mark as read if not already
    await query(
      `UPDATE notification_recipients 
       SET clicked_at = CURRENT_TIMESTAMP,
           read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE notification_id = $1 AND user_id = $2`,
      [notification_id, userId]
    );

    res.json(formatSuccessResponse(null, 'Notification marked as clicked'));

  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Check if notification belongs to user
    const notificationResult = await query(
      'SELECT id FROM notification_recipients WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (notificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Delete notification recipient record (soft delete)
    await query(
      'DELETE FROM notification_recipients WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    res.json(formatSuccessResponse(null, 'Notification deleted successfully'));

  } catch (error) {
    next(error);
  }
});

// Get notification settings for current user
router.get('/settings', authenticate, async (req, res, next) => {
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
router.put('/settings', authenticate, validate(notificationValidation.updateSettings), async (req, res, next) => {
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

// Create notification (admin/dispatcher only)
router.post('/create', authenticate, authorize('dispatcher', 'admin'), validate(notificationValidation.create), async (req, res, next) => {
  try {
    const { title, message, type, data, priority, user_ids, scheduled_at } = req.body;
    const createdBy = req.user.id;

    // Use transaction to create notification and recipients
    const result = await transaction(async (client) => {
      // Create notification
      const notificationResult = await client.query(
        `INSERT INTO notifications (title, message, type, data, priority, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, message, type, JSON.stringify(data || {}), priority || 1, scheduled_at]
      );

      const notification = notificationResult.rows[0];

      // Create recipients
      const recipientValues = user_ids.map((userId, index) => {
        const paramIndex = index * 2;
        return `($${paramIndex + 1}, $${paramIndex + 2})`;
      }).join(', ');

      const recipientParams = user_ids.flatMap(userId => [notification.id, userId]);

      await client.query(
        `INSERT INTO notification_recipients (notification_id, user_id) VALUES ${recipientValues}`,
        recipientParams
      );

      return notification;
    });

    logger.info(`Notification created: "${title}" for ${user_ids.length} users by ${req.user.email}`);

    // TODO: Send push notifications, emails, SMS based on user preferences
    // await sendPushNotifications(user_ids, { title, message, data });

    res.status(201).json(formatSuccessResponse(result, 'Notification created successfully'));

  } catch (error) {
    next(error);
  }
});

// Send notification to all users of a role
router.post('/broadcast', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { title, message, type, data, priority, roles, status_filter } = req.body;

    if (!title || !message || !type || !roles || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        error: 'title, message, type, and roles array are required'
      });
    }

    // Get users by roles
    let userQuery = 'SELECT id FROM users WHERE role = ANY($1)';
    const values = [roles];

    if (status_filter) {
      userQuery += ' AND status = $2';
      values.push(status_filter);
    }

    const usersResult = await query(userQuery, values);
    const userIds = usersResult.rows.map(row => row.id);

    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No users found with specified criteria'
      });
    }

    // Use transaction to create notification and recipients
    const result = await transaction(async (client) => {
      // Create notification
      const notificationResult = await client.query(
        `INSERT INTO notifications (title, message, type, data, priority)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, message, type, JSON.stringify(data || {}), priority || 1]
      );

      const notification = notificationResult.rows[0];

      // Create recipients in batches
      const batchSize = 100;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const recipientValues = batch.map((userId, index) => {
          const paramIndex = index * 2;
          return `($${paramIndex + 1}, $${paramIndex + 2})`;
        }).join(', ');

        const recipientParams = batch.flatMap(userId => [notification.id, userId]);

        await client.query(
          `INSERT INTO notification_recipients (notification_id, user_id) VALUES ${recipientValues}`,
          recipientParams
        );
      }

      return { notification, recipient_count: userIds.length };
    });

    logger.info(`Broadcast notification sent: "${title}" to ${result.recipient_count} users (roles: ${roles.join(', ')}) by ${req.user.email}`);

    res.status(201).json(formatSuccessResponse(result, 'Broadcast notification sent successfully'));

  } catch (error) {
    next(error);
  }
});

// Get notification analytics (admin only)
router.get('/analytics', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    // Default to last 30 days if no date range provided
    const dateFilter = start_date && end_date 
      ? 'WHERE n.created_at BETWEEN $1 AND $2'
      : 'WHERE n.created_at >= CURRENT_DATE - INTERVAL \'30 days\'';

    const values = start_date && end_date ? [start_date, end_date] : [];

    // Get notification stats
    const statsQuery = `
      SELECT 
        COUNT(n.id) as total_notifications,
        COUNT(DISTINCT nr.user_id) as total_recipients,
        COUNT(CASE WHEN nr.delivered_at IS NOT NULL THEN 1 END) as delivered_count,
        COUNT(CASE WHEN nr.read_at IS NOT NULL THEN 1 END) as read_count,
        COUNT(CASE WHEN nr.clicked_at IS NOT NULL THEN 1 END) as clicked_count,
        ROUND(
          COUNT(CASE WHEN nr.read_at IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN nr.delivered_at IS NOT NULL THEN 1 END), 0), 2
        ) as read_rate,
        ROUND(
          COUNT(CASE WHEN nr.clicked_at IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN nr.read_at IS NOT NULL THEN 1 END), 0), 2
        ) as click_rate
      FROM notifications n
      LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
      ${dateFilter}
    `;

    const statsResult = await query(statsQuery, values);

    // Get notifications by type
    const typeStatsQuery = `
      SELECT 
        n.type,
        COUNT(n.id) as count,
        COUNT(CASE WHEN nr.read_at IS NOT NULL THEN 1 END) as read_count
      FROM notifications n
      LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
      ${dateFilter}
      GROUP BY n.type
      ORDER BY count DESC
    `;

    const typeStatsResult = await query(typeStatsQuery, values);

    // Get daily notification stats
    const dailyStatsQuery = `
      SELECT 
        DATE(n.created_at) as date,
        COUNT(n.id) as notifications_sent,
        COUNT(CASE WHEN nr.read_at IS NOT NULL THEN 1 END) as notifications_read
      FROM notifications n
      LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
      ${dateFilter}
      GROUP BY DATE(n.created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const dailyStatsResult = await query(dailyStatsQuery, values);

    const analytics = {
      summary: statsResult.rows[0],
      by_type: typeStatsResult.rows,
      daily_stats: dailyStatsResult.rows,
      generated_at: new Date().toISOString()
    };

    res.json(formatSuccessResponse(analytics, 'Notification analytics retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Cleanup old notifications (admin only)
router.delete('/cleanup', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { days_old = 90 } = req.query;

    // Delete old notification recipients first (due to foreign key constraint)
    const recipientsResult = await query(
      `DELETE FROM notification_recipients 
       WHERE notification_id IN (
         SELECT id FROM notifications 
         WHERE created_at < CURRENT_DATE - INTERVAL '${parseInt(days_old)} days'
       )`,
    );

    // Delete old notifications
    const notificationsResult = await query(
      `DELETE FROM notifications 
       WHERE created_at < CURRENT_DATE - INTERVAL '${parseInt(days_old)} days'
       RETURNING id`,
    );

    const deletedCount = notificationsResult.rows.length;

    logger.info(`Cleaned up ${deletedCount} old notifications (older than ${days_old} days) by ${req.user.email}`);

    res.json(formatSuccessResponse(
      { deleted_count: deletedCount }, 
      `Cleaned up ${deletedCount} old notifications`
    ));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
