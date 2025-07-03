const express = require('express');
const { query, transaction } = require('../config/database');
const { driverValidation, validate } = require('../utils/validation');
const { 
  formatSuccessResponse, 
  formatPaginatedResponse,
  parsePagination,
  parseSorting
} = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get all drivers (admin/dispatcher only)
router.get('/', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sortBy, sortOrder } = parseSorting(req.query, ['created_at', 'rating', 'total_jobs']);
    const { availability, is_verified } = req.query;

    // Build filters
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    if (availability) {
      whereConditions.push(`d.availability = $${paramCount}`);
      values.push(availability);
      paramCount++;
    }

    if (is_verified !== undefined) {
      whereConditions.push(`d.is_verified = $${paramCount}`);
      values.push(is_verified === 'true');
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM drivers d ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get drivers with user details
    values.push(limit, offset);
    const driversQuery = `
      SELECT 
        d.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.status as user_status,
        u.created_at as user_created_at,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.license_plate,
        v.type as vehicle_type,
        COALESCE(active_jobs.count, 0) as active_jobs_count
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN (
        SELECT driver_id, COUNT(*) as count
        FROM jobs 
        WHERE status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery')
        GROUP BY driver_id
      ) active_jobs ON d.id = active_jobs.driver_id
      ${whereClause}
      ORDER BY d.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(driversQuery, values);
    const drivers = result.rows;

    const response = formatPaginatedResponse(drivers, page, limit, total);

    res.json(response);

  } catch (error) {
    next(error);
  }
});

// Get available drivers for assignment
router.get('/available', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query; // radius in km

    let driversQuery = `
      SELECT 
        d.*,
        u.first_name,
        u.last_name,
        u.phone,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.type as vehicle_type,
        v.capacity_weight,
        v.capacity_volume
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.availability = 'available' 
      AND d.is_verified = true
      AND u.status = 'active'
    `;

    const values = [];

    // If location provided, filter by proximity
    if (latitude && longitude) {
      driversQuery += `
        AND EXISTS (
          SELECT 1 FROM driver_locations dl 
          WHERE dl.driver_id = d.id 
          AND dl.timestamp > CURRENT_TIMESTAMP - INTERVAL '1 hour'
          AND (
            6371 * acos(
              cos(radians($1)) * cos(radians(dl.latitude)) * 
              cos(radians(dl.longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(dl.latitude))
            )
          ) <= $3
        )
      `;
      values.push(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
    }

    driversQuery += ` ORDER BY d.rating DESC, d.total_jobs DESC`;

    const result = await query(driversQuery, values);

    res.json(formatSuccessResponse(result.rows, 'Available drivers retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Get single driver details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Check access permissions
    if (userRole === 'driver') {
      const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverResult.rows.length === 0 || driverId !== driverResult.rows[0].id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Get driver details
    const driverQuery = `
      SELECT 
        d.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.status as user_status,
        u.profile_image_url,
        u.created_at as user_created_at,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.year as vehicle_year,
        v.license_plate,
        v.type as vehicle_type,
        v.capacity_weight,
        v.capacity_volume
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.id = $1
    `;

    const result = await query(driverQuery, [driverId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const driver = result.rows[0];

    // Get driver documents
    const documentsQuery = `
      SELECT document_type, document_url, expiry_date, is_verified
      FROM driver_documents 
      WHERE driver_id = $1
      ORDER BY document_type
    `;
    const documentsResult = await query(documentsQuery, [driverId]);
    driver.documents = documentsResult.rows;

    // Get recent performance metrics
    const performanceQuery = `
      SELECT * FROM driver_performance 
      WHERE driver_id = $1 
      ORDER BY period_end DESC 
      LIMIT 1
    `;
    const performanceResult = await query(performanceQuery, [driverId]);
    driver.recent_performance = performanceResult.rows[0] || null;

    // Get current location (if exists and recent)
    const locationQuery = `
      SELECT latitude, longitude, timestamp
      FROM driver_locations 
      WHERE driver_id = $1 
      AND timestamp > CURRENT_TIMESTAMP - INTERVAL '1 hour'
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    const locationResult = await query(locationQuery, [driverId]);
    driver.current_location = locationResult.rows[0] || null;

    res.json(formatSuccessResponse(driver, 'Driver details retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Register driver (complete driver profile after user registration)
router.post('/register', authenticate, authorize('driver', 'admin'), validate(driverValidation.register), async (req, res, next) => {
  try {
    const { user_id, license_number, license_expiry_date, license_class, emergency_contact, bank_details, work_schedule } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // If user is driver role, they can only register themselves
    if (userRole === 'driver' && user_id !== userId) {
      return res.status(403).json({ success: false, error: 'You can only register your own driver profile' });
    }

    // Check if user exists and has driver role
    const userResult = await query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (userResult.rows[0].role !== 'driver') {
      return res.status(400).json({ success: false, error: 'User must have driver role' });
    }

    // Check if driver profile already exists
    const existingDriver = await query('SELECT id FROM drivers WHERE user_id = $1', [user_id]);
    if (existingDriver.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Driver profile already exists' });
    }

    // Create driver profile
    const result = await query(
      `INSERT INTO drivers (
        user_id, license_number, license_expiry_date, license_class,
        emergency_contact, bank_details, work_schedule, availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        user_id, license_number, license_expiry_date, license_class,
        JSON.stringify(emergency_contact || {}),
        JSON.stringify(bank_details || {}),
        JSON.stringify(work_schedule || {}),
        'offline'
      ]
    );

    const driver = result.rows[0];

    logger.info(`Driver profile created for user: ${user_id}`);

    res.status(201).json(formatSuccessResponse(driver, 'Driver profile created successfully'));

  } catch (error) {
    next(error);
  }
});

// Update driver
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const updates = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Check access permissions
    if (userRole === 'driver') {
      const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverResult.rows.length === 0 || driverId !== driverResult.rows[0].id) {
        return res.status(403).json({ success: false, error: 'You can only update your own profile' });
      }
    }

    // Check if driver exists
    const existingDriver = await query('SELECT * FROM drivers WHERE id = $1', [driverId]);
    if (existingDriver.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['license_number', 'license_expiry_date', 'license_class', 'emergency_contact', 'bank_details', 'work_schedule'];
    
    // Drivers can only update certain fields
    if (userRole === 'driver') {
      const driverAllowedFields = ['emergency_contact', 'bank_details', 'work_schedule'];
      allowedFields = allowedFields.filter(field => driverAllowedFields.includes(field));
    }

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (['emergency_contact', 'bank_details', 'work_schedule'].includes(key)) {
          updateFields.push(`${key} = $${paramCount}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(driverId);

    const updateQuery = `
      UPDATE drivers 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const updatedDriver = result.rows[0];

    logger.info(`Driver ${driverId} updated by user ${req.user.email}`);

    res.json(formatSuccessResponse(updatedDriver, 'Driver updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Update driver location
router.post('/location', authenticate, authorize('driver'), validate(driverValidation.updateLocation), async (req, res, next) => {
  try {
    const { latitude, longitude, altitude, accuracy, speed, heading } = req.body;
    const userId = req.user.id;

    // Get driver ID
    const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver profile not found' });
    }

    const driverId = driverResult.rows[0].id;

    // Insert location record
    await query(
      `INSERT INTO driver_locations (driver_id, latitude, longitude, altitude, accuracy, speed, heading, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [driverId, latitude, longitude, altitude, accuracy, speed, heading]
    );

    // Clean up old location records (keep only last 24 hours)
    await query(
      `DELETE FROM driver_locations 
       WHERE driver_id = $1 AND timestamp < CURRENT_TIMESTAMP - INTERVAL '24 hours'`,
      [driverId]
    );

    res.json(formatSuccessResponse(null, 'Location updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Update driver availability
router.put('/availability', authenticate, authorize('driver'), validate(driverValidation.updateAvailability), async (req, res, next) => {
  try {
    const { availability } = req.body;
    const userId = req.user.id;

    // Get driver ID
    const driverResult = await query('SELECT id, availability as current_availability FROM drivers WHERE user_id = $1', [userId]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver profile not found' });
    }

    const { id: driverId, current_availability } = driverResult.rows[0];

    // Check if driver has active jobs when trying to go offline
    if (availability === 'offline' && current_availability !== 'offline') {
      const activeJobsResult = await query(
        `SELECT COUNT(*) as count FROM jobs 
         WHERE driver_id = $1 AND status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery')`,
        [driverId]
      );

      if (parseInt(activeJobsResult.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot go offline while having active jobs'
        });
      }
    }

    // Update availability
    await query(
      'UPDATE drivers SET availability = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [availability, driverId]
    );

    logger.info(`Driver ${driverId} availability updated to ${availability}`);

    res.json(formatSuccessResponse({ availability }, 'Availability updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Get driver reports/analytics
router.get('/:id/reports', authenticate, async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.id;
    const { period = 'month' } = req.query; // month, week, year

    // Check access permissions
    if (userRole === 'driver') {
      const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverResult.rows.length === 0 || driverId !== driverResult.rows[0].id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Define date range based on period
    let dateInterval;
    switch (period) {
      case 'week':
        dateInterval = '7 days';
        break;
      case 'year':
        dateInterval = '1 year';
        break;
      default:
        dateInterval = '30 days';
    }

    // Get performance metrics
    const performanceQuery = `
      SELECT 
        COUNT(j.id) as total_jobs,
        COUNT(CASE WHEN j.status = 'delivered' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN j.status = 'cancelled' THEN 1 END) as cancelled_jobs,
        COALESCE(SUM(j.total_price), 0) as total_earnings,
        COALESCE(SUM(j.actual_distance), 0) as total_distance,
        COALESCE(AVG(j.customer_rating), 0) as average_rating,
        COALESCE(AVG(
          CASE 
            WHEN j.actual_delivery_time IS NOT NULL AND j.scheduled_delivery_time IS NOT NULL
            THEN EXTRACT(EPOCH FROM (j.actual_delivery_time - j.scheduled_delivery_time)) / 60
          END
        ), 0) as avg_delay_minutes
      FROM jobs j
      WHERE j.driver_id = $1 
      AND j.created_at >= CURRENT_DATE - INTERVAL '${dateInterval}'
    `;

    const performanceResult = await query(performanceQuery, [driverId]);
    const performance = performanceResult.rows[0];

    // Get daily statistics for charts
    const dailyStatsQuery = `
      SELECT 
        DATE(j.created_at) as date,
        COUNT(j.id) as jobs_count,
        COALESCE(SUM(j.total_price), 0) as daily_earnings,
        COALESCE(SUM(j.actual_distance), 0) as daily_distance
      FROM jobs j
      WHERE j.driver_id = $1 
      AND j.created_at >= CURRENT_DATE - INTERVAL '${dateInterval}'
      GROUP BY DATE(j.created_at)
      ORDER BY date DESC
    `;

    const dailyStatsResult = await query(dailyStatsQuery, [driverId]);

    // Get work sessions
    const workSessionsQuery = `
      SELECT 
        DATE(punch_in_time) as date,
        COUNT(*) as sessions_count,
        COALESCE(SUM(total_hours), 0) as total_hours,
        COALESCE(AVG(total_hours), 0) as avg_hours_per_session
      FROM driver_work_sessions
      WHERE driver_id = $1 
      AND punch_in_time >= CURRENT_DATE - INTERVAL '${dateInterval}'
      GROUP BY DATE(punch_in_time)
      ORDER BY date DESC
    `;

    const workSessionsResult = await query(workSessionsQuery, [driverId]);

    const report = {
      period,
      performance,
      daily_stats: dailyStatsResult.rows,
      work_sessions: workSessionsResult.rows,
      generated_at: new Date().toISOString()
    };

    res.json(formatSuccessResponse(report, 'Driver reports retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Punch in/out for work sessions
router.post('/punch', authenticate, authorize('driver'), async (req, res, next) => {
  try {
    const { action, location } = req.body; // action: 'in' or 'out'
    const userId = req.user.id;

    if (!['in', 'out'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be "in" or "out"' });
    }

    // Get driver ID
    const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver profile not found' });
    }

    const driverId = driverResult.rows[0].id;

    if (action === 'in') {
      // Check if already punched in
      const activeSession = await query(
        'SELECT id FROM driver_work_sessions WHERE driver_id = $1 AND punch_out_time IS NULL',
        [driverId]
      );

      if (activeSession.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Already punched in' });
      }

      // Create new work session
      const result = await query(
        `INSERT INTO driver_work_sessions (driver_id, punch_in_time, punch_in_location)
         VALUES ($1, CURRENT_TIMESTAMP, $2)
         RETURNING *`,
        [driverId, location ? `POINT(${location.longitude}, ${location.latitude})` : null]
      );

      logger.info(`Driver ${driverId} punched in`);

      res.json(formatSuccessResponse(result.rows[0], 'Punched in successfully'));

    } else {
      // Punch out
      const activeSession = await query(
        'SELECT id, punch_in_time FROM driver_work_sessions WHERE driver_id = $1 AND punch_out_time IS NULL',
        [driverId]
      );

      if (activeSession.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No active work session found' });
      }

      const sessionId = activeSession.rows[0].id;
      const punchInTime = new Date(activeSession.rows[0].punch_in_time);
      const totalHours = (Date.now() - punchInTime.getTime()) / (1000 * 60 * 60);

      const result = await query(
        `UPDATE driver_work_sessions 
         SET punch_out_time = CURRENT_TIMESTAMP, 
             punch_out_location = $1,
             total_hours = $2
         WHERE id = $3
         RETURNING *`,
        [
          location ? `POINT(${location.longitude}, ${location.latitude})` : null,
          totalHours,
          sessionId
        ]
      );

      logger.info(`Driver ${driverId} punched out (${totalHours.toFixed(2)} hours)`);

      res.json(formatSuccessResponse(result.rows[0], 'Punched out successfully'));
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;
