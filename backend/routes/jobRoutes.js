const express = require('express');
const { query, transaction } = require('../config/database');
const { jobValidation, validate } = require('../utils/validation');
const { 
  formatSuccessResponse, 
  formatPaginatedResponse,
  parseFilters,
  parsePagination,
  parseSorting,
  generateJobNumber,
  generateTrackingCode,
  calculateDistance,
  estimateDeliveryTime
} = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get jobs (with filters and pagination)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const { page, limit, offset } = parsePagination(req.query);
    const filters = parseFilters(req.query);
    const { sortBy, sortOrder } = parseSorting(req.query, ['created_at', 'scheduled_pickup_time', 'priority', 'status']);

    // Build WHERE clause based on user role and filters
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    // Role-based access control
    if (userRole === 'customer') {
      const customerResult = await query('SELECT id FROM customers WHERE user_id = $1', [userId]);
      if (customerResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Customer profile not found' });
      }
      whereConditions.push(`j.customer_id = $${paramCount}`);
      values.push(customerResult.rows[0].id);
      paramCount++;
    } else if (userRole === 'driver') {
      const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Driver profile not found' });
      }
      whereConditions.push(`j.driver_id = $${paramCount}`);
      values.push(driverResult.rows[0].id);
      paramCount++;
    }
    // Dispatchers and admins can see all jobs

    // Apply filters
    if (filters.status) {
      whereConditions.push(`j.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.type) {
      whereConditions.push(`j.type = $${paramCount}`);
      values.push(filters.type);
      paramCount++;
    }

    if (filters.priority) {
      whereConditions.push(`j.priority = $${paramCount}`);
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.customer_id) {
      whereConditions.push(`j.customer_id = $${paramCount}`);
      values.push(filters.customer_id);
      paramCount++;
    }

    if (filters.driver_id) {
      whereConditions.push(`j.driver_id = $${paramCount}`);
      values.push(filters.driver_id);
      paramCount++;
    }

    if (filters.date_from) {
      whereConditions.push(`j.created_at >= $${paramCount}`);
      values.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      whereConditions.push(`j.created_at <= $${paramCount}`);
      values.push(filters.date_to);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM jobs j
      ${whereClause}
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get jobs with related data
    values.push(limit, offset);
    const jobsQuery = `
      SELECT 
        j.*,
        c.user_id as customer_user_id,
        cu.first_name as customer_first_name,
        cu.last_name as customer_last_name,
        cu.email as customer_email,
        cu.phone as customer_phone,
        c.company_name as customer_company,
        d.user_id as driver_user_id,
        du.first_name as driver_first_name,
        du.last_name as driver_last_name,
        du.email as driver_email,
        du.phone as driver_phone,
        d.license_number as driver_license,
        d.rating as driver_rating
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN users cu ON c.user_id = cu.id
      LEFT JOIN drivers d ON j.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      ${whereClause}
      ORDER BY j.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(jobsQuery, values);
    const jobs = result.rows;

    const response = formatPaginatedResponse(jobs, page, limit, total);

    res.json(response);

  } catch (error) {
    next(error);
  }
});

// Get single job
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Get job with full details
    const jobQuery = `
      SELECT 
        j.*,
        c.user_id as customer_user_id,
        cu.first_name as customer_first_name,
        cu.last_name as customer_last_name,
        cu.email as customer_email,
        cu.phone as customer_phone,
        c.company_name as customer_company,
        d.user_id as driver_user_id,
        du.first_name as driver_first_name,
        du.last_name as driver_last_name,
        du.email as driver_email,
        du.phone as driver_phone,
        d.license_number as driver_license,
        d.rating as driver_rating,
        d.availability as driver_availability
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN users cu ON c.user_id = cu.id
      LEFT JOIN drivers d ON j.driver_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE j.id = $1
    `;

    const result = await query(jobQuery, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const job = result.rows[0];

    // Check access permissions
    if (userRole === 'customer') {
      const customerResult = await query('SELECT id FROM customers WHERE user_id = $1', [userId]);
      if (customerResult.rows.length === 0 || job.customer_id !== customerResult.rows[0].id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    } else if (userRole === 'driver') {
      const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverResult.rows.length === 0 || job.driver_id !== driverResult.rows[0].id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    // Get job status history
    const historyQuery = `
      SELECT 
        jsh.*,
        u.first_name,
        u.last_name,
        u.role
      FROM job_status_history jsh
      LEFT JOIN users u ON jsh.changed_by = u.id
      WHERE jsh.job_id = $1
      ORDER BY jsh.timestamp DESC
    `;

    const historyResult = await query(historyQuery, [jobId]);
    job.status_history = historyResult.rows;

    // Get job documents
    const documentsQuery = `
      SELECT 
        jd.*,
        u.first_name,
        u.last_name
      FROM job_documents jd
      LEFT JOIN users u ON jd.uploaded_by = u.id
      WHERE jd.job_id = $1
      ORDER BY jd.created_at DESC
    `;

    const documentsResult = await query(documentsQuery, [jobId]);
    job.documents = documentsResult.rows;

    res.json(formatSuccessResponse(job, 'Job retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Create job
router.post('/create', authenticate, authorize('customer', 'dispatcher', 'admin'), validate(jobValidation.create), async (req, res, next) => {
  try {
    const jobData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // If customer is creating job, set customer_id to their own
    if (userRole === 'customer') {
      const customerResult = await query('SELECT id FROM customers WHERE user_id = $1', [userId]);
      if (customerResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Customer profile not found' });
      }
      jobData.customer_id = customerResult.rows[0].id;
    }

    // Generate job number and tracking code
    const jobNumber = generateJobNumber();
    const trackingCode = generateTrackingCode();

    // Calculate distance and estimated time if coordinates are provided
    let estimatedDistance = null;
    let estimatedDuration = null;
    let totalPrice = jobData.base_price || 0;

    if (jobData.pickup_latitude && jobData.pickup_longitude && 
        jobData.delivery_latitude && jobData.delivery_longitude) {
      estimatedDistance = calculateDistance(
        jobData.pickup_latitude, jobData.pickup_longitude,
        jobData.delivery_latitude, jobData.delivery_longitude
      );
      estimatedDuration = estimateDeliveryTime(estimatedDistance);
      
      // Calculate price based on distance if base_price not provided
      if (!jobData.base_price) {
        totalPrice = Math.max(50, estimatedDistance * 5); // $5 per km, minimum $50
      }
    }

    const result = await query(
      `INSERT INTO jobs (
        job_number, customer_id, type, priority, status,
        pickup_location, pickup_latitude, pickup_longitude,
        pickup_contact_name, pickup_contact_phone, pickup_instructions,
        scheduled_pickup_time,
        delivery_location, delivery_latitude, delivery_longitude,
        delivery_contact_name, delivery_contact_phone, delivery_instructions,
        scheduled_delivery_time,
        cargo_description, cargo_weight, cargo_volume, cargo_value,
        special_requirements, estimated_distance, estimated_duration,
        base_price, total_price, tracking_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      ) RETURNING *`,
      [
        jobNumber, jobData.customer_id, jobData.type, jobData.priority || 'medium', 'pending',
        jobData.pickup_location, jobData.pickup_latitude, jobData.pickup_longitude,
        jobData.pickup_contact_name, jobData.pickup_contact_phone, jobData.pickup_instructions,
        jobData.scheduled_pickup_time,
        jobData.delivery_location, jobData.delivery_latitude, jobData.delivery_longitude,
        jobData.delivery_contact_name, jobData.delivery_contact_phone, jobData.delivery_instructions,
        jobData.scheduled_delivery_time,
        jobData.cargo_description, jobData.cargo_weight, jobData.cargo_volume, jobData.cargo_value,
        jobData.special_requirements, estimatedDistance, estimatedDuration,
        jobData.base_price, totalPrice, trackingCode
      ]
    );

    const job = result.rows[0];

    // Add initial status history entry
    await query(
      `INSERT INTO job_status_history (job_id, status, changed_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [job.id, 'pending', userId, 'Job created']
    );

    logger.info(`Job created: ${jobNumber} by user ${req.user.email}`);

    res.status(201).json(formatSuccessResponse(job, 'Job created successfully'));

  } catch (error) {
    next(error);
  }
});

// Update job
router.put('/:id', authenticate, authorize('dispatcher', 'admin'), validate(jobValidation.update), async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const updates = req.body;
    const userId = req.user.id;

    // Check if job exists
    const existingJob = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (existingJob.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'type', 'priority', 'status', 'pickup_location', 'pickup_latitude', 'pickup_longitude',
      'pickup_contact_name', 'pickup_contact_phone', 'pickup_instructions', 'scheduled_pickup_time',
      'delivery_location', 'delivery_latitude', 'delivery_longitude', 'delivery_contact_name',
      'delivery_contact_phone', 'delivery_instructions', 'scheduled_delivery_time',
      'cargo_description', 'cargo_weight', 'cargo_volume', 'cargo_value', 'special_requirements',
      'base_price', 'additional_charges', 'completion_notes', 'customer_rating', 'customer_feedback'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    // Recalculate total price if base_price or additional_charges changed
    if (updates.base_price !== undefined || updates.additional_charges !== undefined) {
      const basePrice = updates.base_price !== undefined ? updates.base_price : existingJob.rows[0].base_price;
      const additionalCharges = updates.additional_charges !== undefined ? updates.additional_charges : existingJob.rows[0].additional_charges;
      const totalPrice = basePrice + additionalCharges;
      
      updateFields.push(`total_price = $${paramCount}`);
      values.push(totalPrice);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(jobId);

    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const updatedJob = result.rows[0];

    // Add status history if status changed
    if (updates.status && updates.status !== existingJob.rows[0].status) {
      await query(
        `INSERT INTO job_status_history (job_id, status, changed_by, notes)
         VALUES ($1, $2, $3, $4)`,
        [jobId, updates.status, userId, updates.notes || `Status changed to ${updates.status}`]
      );
    }

    logger.info(`Job updated: ${updatedJob.job_number} by user ${req.user.email}`);

    res.json(formatSuccessResponse(updatedJob, 'Job updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Assign job to driver
router.post('/:id/assign', authenticate, authorize('dispatcher', 'admin'), validate(jobValidation.assign), async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { driver_id } = req.body;
    const userId = req.user.id;

    // Check if job exists and is assignable
    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const job = jobResult.rows[0];
    if (job.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Job is not available for assignment' });
    }

    // Check if driver exists and is available
    const driverResult = await query(
      'SELECT id, availability FROM drivers WHERE id = $1',
      [driver_id]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const driver = driverResult.rows[0];
    if (driver.availability !== 'available') {
      return res.status(400).json({ success: false, error: 'Driver is not available' });
    }

    // Use transaction to assign job and update driver status
    const result = await transaction(async (client) => {
      // Assign job
      const assignResult = await client.query(
        `UPDATE jobs 
         SET driver_id = $1, status = 'assigned', assigned_by = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [driver_id, userId, jobId]
      );

      // Update driver availability
      await client.query(
        'UPDATE drivers SET availability = $1 WHERE id = $2',
        ['busy', driver_id]
      );

      // Add status history
      await client.query(
        `INSERT INTO job_status_history (job_id, status, changed_by, notes)
         VALUES ($1, $2, $3, $4)`,
        [jobId, 'assigned', userId, `Job assigned to driver ${driver_id}`]
      );

      return assignResult.rows[0];
    });

    logger.info(`Job ${job.job_number} assigned to driver ${driver_id} by user ${req.user.email}`);

    res.json(formatSuccessResponse(result, 'Job assigned successfully'));

  } catch (error) {
    next(error);
  }
});

// Update job status (drivers can update certain statuses)
router.put('/:id/status', authenticate, validate(jobValidation.updateStatus), async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { status, location, notes } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Check if job exists
    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const job = jobResult.rows[0];

    // Check permissions
    if (userRole === 'driver') {
      const driverResult = await query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
      if (driverResult.rows.length === 0 || job.driver_id !== driverResult.rows[0].id) {
        return res.status(403).json({ success: false, error: 'You can only update your own assigned jobs' });
      }

      // Drivers can only update certain statuses
      const allowedStatuses = ['en_route_pickup', 'arrived_pickup', 'picked_up', 'en_route_delivery', 'arrived_delivery', 'delivered'];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ success: false, error: 'You cannot set this status' });
      }
    }

    // Update job status
    let updateQuery = 'UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP';
    let values = [status];
    let paramCount = 2;

    // Update specific timestamp fields based on status
    if (status === 'picked_up') {
      updateQuery += `, actual_pickup_time = CURRENT_TIMESTAMP`;
    } else if (status === 'delivered') {
      updateQuery += `, actual_delivery_time = CURRENT_TIMESTAMP`;
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(jobId);

    const result = await query(updateQuery, values);
    const updatedJob = result.rows[0];

    // Add status history
    await query(
      `INSERT INTO job_status_history (job_id, status, changed_by, location, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [jobId, status, userId, location ? `POINT(${location.longitude}, ${location.latitude})` : null, notes]
    );

    // If job is delivered, update driver availability
    if (status === 'delivered' && userRole === 'driver') {
      await query(
        'UPDATE drivers SET availability = $1 WHERE user_id = $2',
        ['available', userId]
      );
    }

    logger.info(`Job ${job.job_number} status updated to ${status} by user ${req.user.email}`);

    res.json(formatSuccessResponse(updatedJob, 'Job status updated successfully'));

  } catch (error) {
    next(error);
  }
});

// Delete job
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const jobId = req.params.id;

    // Check if job exists
    const jobResult = await query('SELECT job_number FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const jobNumber = jobResult.rows[0].job_number;

    // Soft delete by updating status
    await query(
      'UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', jobId]
    );

    logger.info(`Job ${jobNumber} deleted by user ${req.user.email}`);

    res.json(formatSuccessResponse(null, 'Job deleted successfully'));

  } catch (error) {
    next(error);
  }
});

module.exports = router;
