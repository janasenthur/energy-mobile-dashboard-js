const express = require('express');
const { query } = require('../config/database');
const { formatSuccessResponse, calculateDistance } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Update location (for drivers)
router.post('/location', authenticate, authorize('driver'), async (req, res, next) => {
  try {
    const { latitude, longitude, altitude, accuracy, speed, heading, job_id } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

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

    // If job_id is provided, update job location in status history
    if (job_id) {
      // Verify driver is assigned to this job
      const jobResult = await query('SELECT id FROM jobs WHERE id = $1 AND driver_id = $2', [job_id, driverId]);
      
      if (jobResult.rows.length > 0) {
        await query(
          `INSERT INTO job_status_history (job_id, status, changed_by, location, notes)
           SELECT $1, status, $2, POINT($3, $4), 'Location update'
           FROM jobs WHERE id = $1`,
          [job_id, userId, longitude, latitude]
        );
      }
    }

    // Clean up old location records (keep only last 7 days)
    await query(
      `DELETE FROM driver_locations 
       WHERE driver_id = $1 AND timestamp < CURRENT_TIMESTAMP - INTERVAL '7 days'`,
      [driverId]
    );

    res.json(formatSuccessResponse(null, 'Location updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Get route for a job
router.get('/route/:jobId', authenticate, async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Get job details
    const jobResult = await query(
      `SELECT 
        j.*,
        c.user_id as customer_user_id,
        d.user_id as driver_user_id
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       LEFT JOIN drivers d ON j.driver_id = d.id
       WHERE j.id = $1`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const job = jobResult.rows[0];

    // Check access permissions
    if (userRole === 'customer' && job.customer_user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    } else if (userRole === 'driver' && job.driver_user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Build route data
    const route = {
      job_id: jobId,
      pickup: {
        location: job.pickup_location,
        latitude: job.pickup_latitude,
        longitude: job.pickup_longitude,
        contact_name: job.pickup_contact_name,
        contact_phone: job.pickup_contact_phone,
        instructions: job.pickup_instructions,
        scheduled_time: job.scheduled_pickup_time,
        actual_time: job.actual_pickup_time
      },
      delivery: {
        location: job.delivery_location,
        latitude: job.delivery_latitude,
        longitude: job.delivery_longitude,
        contact_name: job.delivery_contact_name,
        contact_phone: job.delivery_contact_phone,
        instructions: job.delivery_instructions,
        scheduled_time: job.scheduled_delivery_time,
        actual_time: job.actual_delivery_time
      },
      estimated_distance: job.estimated_distance,
      actual_distance: job.actual_distance,
      estimated_duration: job.estimated_duration,
      actual_duration: job.actual_duration,
      status: job.status
    };

    // Get driver's current location if job is active
    if (job.driver_id && ['assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery'].includes(job.status)) {
      const locationResult = await query(
        `SELECT latitude, longitude, speed, heading, timestamp
         FROM driver_locations 
         WHERE driver_id = $1 
         AND timestamp > CURRENT_TIMESTAMP - INTERVAL '10 minutes'
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [job.driver_id]
      );

      if (locationResult.rows.length > 0) {
        route.driver_location = locationResult.rows[0];
      }
    }

    // Get route history (location updates for this job)
    const historyResult = await query(
      `SELECT 
        ST_X(location) as longitude,
        ST_Y(location) as latitude,
        timestamp,
        status,
        notes
       FROM job_status_history
       WHERE job_id = $1 AND location IS NOT NULL
       ORDER BY timestamp ASC`,
      [jobId]
    );

    route.location_history = historyResult.rows;

    res.json(formatSuccessResponse(route, 'Route data retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Get real-time tracking for a job (for customers)
router.get('/track/:trackingCode', async (req, res, next) => {
  try {
    const trackingCode = req.params.trackingCode;

    // Get job by tracking code
    const jobResult = await query(
      `SELECT 
        j.id, j.job_number, j.status, j.type, j.priority,
        j.pickup_location, j.delivery_location,
        j.scheduled_pickup_time, j.scheduled_delivery_time,
        j.actual_pickup_time, j.actual_delivery_time,
        j.estimated_distance, j.estimated_duration,
        d.id as driver_id,
        du.first_name as driver_first_name,
        du.last_name as driver_last_name,
        du.phone as driver_phone
       FROM jobs j
       LEFT JOIN drivers d ON j.driver_id = d.id
       LEFT JOIN users du ON d.user_id = du.id
       WHERE j.tracking_code = $1`,
      [trackingCode]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tracking code not found' });
    }

    const job = jobResult.rows[0];

    // Get status history
    const historyResult = await query(
      `SELECT status, timestamp, notes
       FROM job_status_history
       WHERE job_id = $1
       ORDER BY timestamp DESC`,
      [job.id]
    );

    // Get current driver location if available
    let driverLocation = null;
    if (job.driver_id) {
      const locationResult = await query(
        `SELECT latitude, longitude, timestamp
         FROM driver_locations 
         WHERE driver_id = $1 
         AND timestamp > CURRENT_TIMESTAMP - INTERVAL '10 minutes'
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [job.driver_id]
      );

      if (locationResult.rows.length > 0) {
        driverLocation = locationResult.rows[0];
      }
    }

    const tracking = {
      job_number: job.job_number,
      status: job.status,
      type: job.type,
      priority: job.priority,
      pickup_location: job.pickup_location,
      delivery_location: job.delivery_location,
      scheduled_pickup_time: job.scheduled_pickup_time,
      scheduled_delivery_time: job.scheduled_delivery_time,
      actual_pickup_time: job.actual_pickup_time,
      actual_delivery_time: job.actual_delivery_time,
      estimated_distance: job.estimated_distance,
      estimated_duration: job.estimated_duration,
      driver: job.driver_id ? {
        name: `${job.driver_first_name} ${job.driver_last_name}`,
        phone: job.driver_phone
      } : null,
      current_location: driverLocation,
      status_history: historyResult.rows,
      last_updated: new Date().toISOString()
    };

    res.json(formatSuccessResponse(tracking, 'Tracking information retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Optimize route (basic implementation)
router.post('/optimize-route', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const { jobs, start_location } = req.body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Jobs array is required'
      });
    }

    // Get job details
    const jobIds = jobs.map(job => job.id || job);
    const jobsResult = await query(
      `SELECT id, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude,
              pickup_location, delivery_location, priority
       FROM jobs 
       WHERE id = ANY($1) AND status = 'pending'`,
      [jobIds]
    );

    if (jobsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid jobs found for optimization'
      });
    }

    const validJobs = jobsResult.rows;

    // Simple route optimization using nearest neighbor algorithm
    const optimizedRoute = [];
    const remainingJobs = [...validJobs];
    let currentLocation = start_location || { latitude: 0, longitude: 0 };

    while (remainingJobs.length > 0) {
      let nearestJobIndex = 0;
      let shortestDistance = Infinity;

      // Find nearest pickup location
      for (let i = 0; i < remainingJobs.length; i++) {
        const job = remainingJobs[i];
        if (job.pickup_latitude && job.pickup_longitude) {
          const distance = calculateDistance(
            currentLocation.latitude, currentLocation.longitude,
            job.pickup_latitude, job.pickup_longitude
          );

          // Give priority to high-priority jobs
          const adjustedDistance = job.priority === 'urgent' ? distance * 0.5 : 
                                  job.priority === 'high' ? distance * 0.7 : distance;

          if (adjustedDistance < shortestDistance) {
            shortestDistance = adjustedDistance;
            nearestJobIndex = i;
          }
        }
      }

      const selectedJob = remainingJobs.splice(nearestJobIndex, 1)[0];
      
      // Add pickup waypoint
      optimizedRoute.push({
        job_id: selectedJob.id,
        type: 'pickup',
        location: selectedJob.pickup_location,
        latitude: selectedJob.pickup_latitude,
        longitude: selectedJob.pickup_longitude,
        order: optimizedRoute.length + 1
      });

      // Add delivery waypoint
      optimizedRoute.push({
        job_id: selectedJob.id,
        type: 'delivery',
        location: selectedJob.delivery_location,
        latitude: selectedJob.delivery_latitude,
        longitude: selectedJob.delivery_longitude,
        order: optimizedRoute.length + 1
      });

      // Update current location for next iteration
      if (selectedJob.delivery_latitude && selectedJob.delivery_longitude) {
        currentLocation = {
          latitude: selectedJob.delivery_latitude,
          longitude: selectedJob.delivery_longitude
        };
      }
    }

    // Calculate total distance
    let totalDistance = 0;
    let previousLocation = start_location || { latitude: 0, longitude: 0 };

    for (const waypoint of optimizedRoute) {
      if (waypoint.latitude && waypoint.longitude) {
        const distance = calculateDistance(
          previousLocation.latitude, previousLocation.longitude,
          waypoint.latitude, waypoint.longitude
        );
        totalDistance += distance;
        previousLocation = { latitude: waypoint.latitude, longitude: waypoint.longitude };
      }
    }

    const optimization = {
      total_jobs: validJobs.length,
      total_waypoints: optimizedRoute.length,
      total_distance: Math.round(totalDistance * 100) / 100,
      estimated_duration: Math.ceil(totalDistance / 50 * 60), // Assuming 50 km/h average speed
      optimized_route: optimizedRoute,
      optimization_method: 'nearest_neighbor',
      created_at: new Date().toISOString()
    };

    logger.info(`Route optimized for ${validJobs.length} jobs, total distance: ${totalDistance}km`);

    res.json(formatSuccessResponse(optimization, 'Route optimized successfully'));

  } catch (error) {
    next(error);
  }
});

// Get driver location history
router.get('/driver/:driverId/history', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const driverId = req.params.driverId;
    const { start_date, end_date, limit = 100 } = req.query;

    // Build query with date filters
    let query_text = `
      SELECT latitude, longitude, speed, heading, timestamp
      FROM driver_locations 
      WHERE driver_id = $1
    `;
    const values = [driverId];
    let paramCount = 2;

    if (start_date) {
      query_text += ` AND timestamp >= $${paramCount}`;
      values.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query_text += ` AND timestamp <= $${paramCount}`;
      values.push(end_date);
      paramCount++;
    }

    query_text += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
    values.push(parseInt(limit));

    const result = await query(query_text, values);

    res.json(formatSuccessResponse(result.rows, 'Driver location history retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Get all active drivers locations (for dispatch dashboard)
router.get('/drivers/active', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        d.id,
        d.availability,
        u.first_name,
        u.last_name,
        u.phone,
        dl.latitude,
        dl.longitude,
        dl.speed,
        dl.heading,
        dl.timestamp,
        COUNT(j.id) as active_jobs
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT latitude, longitude, speed, heading, timestamp
         FROM driver_locations 
         WHERE driver_id = d.id 
         ORDER BY timestamp DESC 
         LIMIT 1
       ) dl ON true
       LEFT JOIN jobs j ON d.id = j.driver_id 
         AND j.status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery')
       WHERE d.availability IN ('available', 'busy')
       AND u.status = 'active'
       AND dl.timestamp > CURRENT_TIMESTAMP - INTERVAL '30 minutes'
       GROUP BY d.id, d.availability, u.first_name, u.last_name, u.phone, 
                dl.latitude, dl.longitude, dl.speed, dl.heading, dl.timestamp
       ORDER BY dl.timestamp DESC`
    );

    res.json(formatSuccessResponse(result.rows, 'Active drivers locations retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
