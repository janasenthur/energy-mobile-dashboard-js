const express = require('express');
const { query } = require('../config/database');
const { formatSuccessResponse } = require('../utils/helpers');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Generate business analytics report
router.post('/generate', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const { reportType, filters = {} } = req.body;
    const userRole = req.user.role;

    if (!reportType) {
      return res.status(400).json({
        success: false,
        error: 'reportType is required'
      });
    }

    const { start_date, end_date, customer_id, driver_id } = filters;

    // Default date range (last 30 days)
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = end_date || new Date().toISOString();

    let report = {};

    switch (reportType) {
      case 'revenue':
        report = await generateRevenueReport(startDate, endDate, filters);
        break;
      case 'operations':
        report = await generateOperationsReport(startDate, endDate, filters);
        break;
      case 'driver_performance':
        report = await generateDriverPerformanceReport(startDate, endDate, filters);
        break;
      case 'customer_analysis':
        report = await generateCustomerAnalysisReport(startDate, endDate, filters);
        break;
      case 'vehicle_utilization':
        report = await generateVehicleUtilizationReport(startDate, endDate, filters);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type'
        });
    }

    report.meta = {
      report_type: reportType,
      generated_at: new Date().toISOString(),
      generated_by: req.user.email,
      date_range: { start_date: startDate, end_date: endDate },
      filters
    };

    logger.info(`Report generated: ${reportType} by ${req.user.email}`);

    res.json(formatSuccessResponse(report, 'Report generated successfully'));

  } catch (error) {
    next(error);
  }
});

// Get pre-defined dashboard metrics
router.get('/dashboard', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Define date range based on period
    let dateInterval;
    switch (period) {
      case 'week':
        dateInterval = '7 days';
        break;
      case 'quarter':
        dateInterval = '90 days';
        break;
      case 'year':
        dateInterval = '365 days';
        break;
      default:
        dateInterval = '30 days';
    }

    // Get key metrics
    const metricsQuery = `
      SELECT 
        COUNT(j.id) as total_jobs,
        COUNT(CASE WHEN j.status = 'delivered' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN j.status = 'pending' THEN 1 END) as pending_jobs,
        COUNT(CASE WHEN j.status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery') THEN 1 END) as active_jobs,
        COUNT(CASE WHEN j.status = 'cancelled' THEN 1 END) as cancelled_jobs,
        COALESCE(SUM(j.total_price), 0) as total_revenue,
        COALESCE(AVG(j.total_price), 0) as avg_job_value,
        COALESCE(SUM(j.actual_distance), 0) as total_distance,
        COALESCE(AVG(j.customer_rating), 0) as avg_customer_rating,
        COUNT(DISTINCT j.customer_id) as active_customers,
        COUNT(DISTINCT j.driver_id) as active_drivers
      FROM jobs j
      WHERE j.created_at >= CURRENT_DATE - INTERVAL '${dateInterval}'
    `;

    const metricsResult = await query(metricsQuery);
    const metrics = metricsResult.rows[0];

    // Get driver availability
    const driversQuery = `
      SELECT 
        COUNT(*) as total_drivers,
        COUNT(CASE WHEN availability = 'available' THEN 1 END) as available_drivers,
        COUNT(CASE WHEN availability = 'busy' THEN 1 END) as busy_drivers,
        COUNT(CASE WHEN availability = 'offline' THEN 1 END) as offline_drivers
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE u.status = 'active'
    `;

    const driversResult = await query(driversQuery);
    const driverStats = driversResult.rows[0];

    // Get daily job trends
    const trendsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as jobs_count,
        COALESCE(SUM(total_price), 0) as daily_revenue,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_count
      FROM jobs
      WHERE created_at >= CURRENT_DATE - INTERVAL '${dateInterval}'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const trendsResult = await query(trendsQuery);

    // Get top performing drivers
    const topDriversQuery = `
      SELECT 
        d.id,
        u.first_name,
        u.last_name,
        COUNT(j.id) as jobs_completed,
        COALESCE(SUM(j.total_price), 0) as total_earnings,
        COALESCE(AVG(j.customer_rating), 0) as avg_rating
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN jobs j ON d.id = j.driver_id 
        AND j.status = 'delivered' 
        AND j.created_at >= CURRENT_DATE - INTERVAL '${dateInterval}'
      WHERE u.status = 'active'
      GROUP BY d.id, u.first_name, u.last_name
      HAVING COUNT(j.id) > 0
      ORDER BY jobs_completed DESC, avg_rating DESC
      LIMIT 10
    `;

    const topDriversResult = await query(topDriversQuery);

    // Get top customers
    const topCustomersQuery = `
      SELECT 
        c.id,
        u.first_name,
        u.last_name,
        c.company_name,
        COUNT(j.id) as jobs_count,
        COALESCE(SUM(j.total_price), 0) as total_spent
      FROM customers c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN jobs j ON c.id = j.customer_id 
        AND j.created_at >= CURRENT_DATE - INTERVAL '${dateInterval}'
      WHERE u.status = 'active'
      GROUP BY c.id, u.first_name, u.last_name, c.company_name
      HAVING COUNT(j.id) > 0
      ORDER BY total_spent DESC, jobs_count DESC
      LIMIT 10
    `;

    const topCustomersResult = await query(topCustomersQuery);

    const dashboard = {
      summary: metrics,
      driver_stats: driverStats,
      trends: trendsResult.rows,
      top_drivers: topDriversResult.rows,
      top_customers: topCustomersResult.rows,
      generated_at: new Date().toISOString()
    };

    res.json(formatSuccessResponse(dashboard, 'Dashboard metrics retrieved successfully'));

  } catch (error) {
    next(error);
  }
});

// Download report (placeholder - would generate PDF/Excel in production)
router.get('/download/:reportId', authenticate, authorize('dispatcher', 'admin'), async (req, res, next) => {
  try {
    const reportId = req.params.reportId;

    // In a real implementation, you would:
    // 1. Store report data in database with unique ID
    // 2. Generate PDF/Excel file
    // 3. Return file download

    res.json(formatSuccessResponse(
      { 
        download_url: `/api/reports/files/${reportId}.pdf`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }, 
      'Report download link generated'
    ));

  } catch (error) {
    next(error);
  }
});

// Helper functions for different report types

async function generateRevenueReport(startDate, endDate, filters) {
  const revenueQuery = `
    SELECT 
      DATE_TRUNC('day', j.created_at) as date,
      COUNT(j.id) as jobs_count,
      COALESCE(SUM(j.total_price), 0) as revenue,
      COALESCE(SUM(j.base_price), 0) as base_revenue,
      COALESCE(SUM(j.additional_charges), 0) as additional_revenue,
      COALESCE(AVG(j.total_price), 0) as avg_job_value
    FROM jobs j
    WHERE j.created_at BETWEEN $1 AND $2
    AND j.status = 'delivered'
    GROUP BY DATE_TRUNC('day', j.created_at)
    ORDER BY date DESC
  `;

  const result = await query(revenueQuery, [startDate, endDate]);

  const totalRevenue = result.rows.reduce((sum, row) => sum + parseFloat(row.revenue), 0);
  const totalJobs = result.rows.reduce((sum, row) => sum + parseInt(row.jobs_count), 0);

  return {
    summary: {
      total_revenue: totalRevenue,
      total_jobs: totalJobs,
      average_job_value: totalJobs > 0 ? totalRevenue / totalJobs : 0
    },
    daily_breakdown: result.rows
  };
}

async function generateOperationsReport(startDate, endDate, filters) {
  const operationsQuery = `
    SELECT 
      j.status,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
    FROM jobs j
    WHERE j.created_at BETWEEN $1 AND $2
    GROUP BY j.status
    ORDER BY count DESC
  `;

  const statusResult = await query(operationsQuery, [startDate, endDate]);

  const performanceQuery = `
    SELECT 
      COUNT(j.id) as total_jobs,
      COUNT(CASE WHEN j.actual_delivery_time <= j.scheduled_delivery_time THEN 1 END) as on_time_deliveries,
      COALESCE(AVG(
        CASE 
          WHEN j.actual_delivery_time IS NOT NULL AND j.scheduled_delivery_time IS NOT NULL
          THEN EXTRACT(EPOCH FROM (j.actual_delivery_time - j.scheduled_delivery_time)) / 60
        END
      ), 0) as avg_delay_minutes,
      COALESCE(AVG(j.customer_rating), 0) as avg_customer_rating
    FROM jobs j
    WHERE j.created_at BETWEEN $1 AND $2
    AND j.status = 'delivered'
  `;

  const performanceResult = await query(performanceQuery, [startDate, endDate]);

  return {
    job_status_breakdown: statusResult.rows,
    performance_metrics: performanceResult.rows[0]
  };
}

async function generateDriverPerformanceReport(startDate, endDate, filters) {
  const driverQuery = `
    SELECT 
      d.id,
      u.first_name,
      u.last_name,
      u.email,
      COUNT(j.id) as jobs_completed,
      COALESCE(SUM(j.total_price), 0) as total_earnings,
      COALESCE(SUM(j.actual_distance), 0) as total_distance,
      COALESCE(AVG(j.customer_rating), 0) as avg_rating,
      COUNT(CASE WHEN j.actual_delivery_time <= j.scheduled_delivery_time THEN 1 END) as on_time_deliveries,
      ROUND(
        COUNT(CASE WHEN j.actual_delivery_time <= j.scheduled_delivery_time THEN 1 END) * 100.0 / 
        NULLIF(COUNT(j.id), 0), 2
      ) as on_time_percentage
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN jobs j ON d.id = j.driver_id 
      AND j.status = 'delivered'
      AND j.created_at BETWEEN $1 AND $2
    WHERE u.status = 'active'
    ${filters.driver_id ? 'AND d.id = $3' : ''}
    GROUP BY d.id, u.first_name, u.last_name, u.email
    ORDER BY jobs_completed DESC, avg_rating DESC
  `;

  const queryParams = [startDate, endDate];
  if (filters.driver_id) {
    queryParams.push(filters.driver_id);
  }

  const result = await query(driverQuery, queryParams);

  return {
    drivers: result.rows
  };
}

async function generateCustomerAnalysisReport(startDate, endDate, filters) {
  const customerQuery = `
    SELECT 
      c.id,
      u.first_name,
      u.last_name,
      u.email,
      c.company_name,
      COUNT(j.id) as jobs_count,
      COALESCE(SUM(j.total_price), 0) as total_spent,
      COALESCE(AVG(j.total_price), 0) as avg_job_value,
      MAX(j.created_at) as last_job_date,
      COALESCE(AVG(j.customer_rating), 0) as avg_rating_given
    FROM customers c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN jobs j ON c.id = j.customer_id 
      AND j.created_at BETWEEN $1 AND $2
    WHERE u.status = 'active'
    ${filters.customer_id ? 'AND c.id = $3' : ''}
    GROUP BY c.id, u.first_name, u.last_name, u.email, c.company_name
    HAVING COUNT(j.id) > 0
    ORDER BY total_spent DESC, jobs_count DESC
  `;

  const queryParams = [startDate, endDate];
  if (filters.customer_id) {
    queryParams.push(filters.customer_id);
  }

  const result = await query(customerQuery, queryParams);

  return {
    customers: result.rows
  };
}

async function generateVehicleUtilizationReport(startDate, endDate, filters) {
  const vehicleQuery = `
    SELECT 
      v.id,
      v.make,
      v.model,
      v.license_plate,
      v.type,
      u.first_name as driver_first_name,
      u.last_name as driver_last_name,
      COUNT(j.id) as jobs_completed,
      COALESCE(SUM(j.actual_distance), 0) as total_distance,
      COALESCE(SUM(j.total_price), 0) as revenue_generated,
      COALESCE(AVG(j.customer_rating), 0) as avg_rating
    FROM vehicles v
    LEFT JOIN drivers d ON v.id = d.vehicle_id
    LEFT JOIN users u ON d.user_id = u.id
    LEFT JOIN jobs j ON d.id = j.driver_id 
      AND j.status = 'delivered'
      AND j.created_at BETWEEN $1 AND $2
    WHERE v.status = 'active'
    GROUP BY v.id, v.make, v.model, v.license_plate, v.type, u.first_name, u.last_name
    ORDER BY jobs_completed DESC, total_distance DESC
  `;

  const result = await query(vehicleQuery, [startDate, endDate]);

  return {
    vehicles: result.rows
  };
}

module.exports = router;
