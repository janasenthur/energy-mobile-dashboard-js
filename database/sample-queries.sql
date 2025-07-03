-- =====================================================
-- Sample SQL Queries for API Integration
-- =====================================================
-- This file contains common SQL queries used by the API endpoints

-- =====================================================
-- AUTHENTICATION QUERIES
-- =====================================================

-- User login verification
-- Query: auth/login
/*
SELECT u.id, u.email, u.role, u.status, u.first_name, u.last_name, u.phone, u.profile_image_url
FROM users u 
WHERE u.email = $1 AND u.password_hash = $2 AND u.status = 'active';
*/

-- Create new user
-- Query: auth/register
/*
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, status)
VALUES ($1, $2, $3, $4, $5, $6, 'pending_approval')
RETURNING id, email, role, first_name, last_name;
*/

-- Update last login
-- Query: auth/login (after successful authentication)
/*
UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1;
*/

-- =====================================================
-- JOB MANAGEMENT QUERIES
-- =====================================================

-- Get all jobs with filters
-- Query: GET /jobs
/*
SELECT j.*, 
       u_customer.first_name || ' ' || u_customer.last_name AS customer_name,
       c.company_name,
       u_driver.first_name || ' ' || u_driver.last_name AS driver_name,
       d.rating AS driver_rating
FROM jobs j
LEFT JOIN customers c ON j.customer_id = c.id
LEFT JOIN users u_customer ON c.user_id = u_customer.id
LEFT JOIN drivers d ON j.driver_id = d.id
LEFT JOIN users u_driver ON d.user_id = u_driver.id
WHERE ($1::job_status IS NULL OR j.status = $1)
AND ($2::job_priority IS NULL OR j.priority = $2)
AND ($3::UUID IS NULL OR j.customer_id = $3)
AND ($4::UUID IS NULL OR j.driver_id = $4)
ORDER BY j.created_at DESC
LIMIT $5 OFFSET $6;
*/

-- Create new job
-- Query: POST /jobs
/*
INSERT INTO jobs (
    job_number, customer_id, type, priority, 
    pickup_location, pickup_latitude, pickup_longitude,
    delivery_location, delivery_latitude, delivery_longitude,
    cargo_description, cargo_weight, estimated_distance,
    base_price, total_price, scheduled_pickup_time, scheduled_delivery_time
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
) RETURNING *;
*/

-- Assign job to driver
-- Query: POST /jobs/assign
/*
UPDATE jobs 
SET driver_id = $2, status = 'assigned', assigned_by = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND status = 'pending'
RETURNING *;
*/

-- Update job status
-- Query: PUT /jobs/:id/status
/*
UPDATE jobs 
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
*/

-- Get job details with full information
-- Query: GET /jobs/:id
/*
SELECT j.*,
       c.company_name, c.billing_address,
       u_customer.first_name AS customer_first_name, 
       u_customer.last_name AS customer_last_name,
       u_customer.phone AS customer_phone,
       d.license_number, d.rating AS driver_rating,
       u_driver.first_name AS driver_first_name,
       u_driver.last_name AS driver_last_name,
       u_driver.phone AS driver_phone,
       v.make, v.model, v.license_plate
FROM jobs j
LEFT JOIN customers c ON j.customer_id = c.id
LEFT JOIN users u_customer ON c.user_id = u_customer.id
LEFT JOIN drivers d ON j.driver_id = d.id
LEFT JOIN users u_driver ON d.user_id = u_driver.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
WHERE j.id = $1;
*/

-- =====================================================
-- DRIVER MANAGEMENT QUERIES
-- =====================================================

-- Get all drivers with availability
-- Query: GET /drivers
/*
SELECT d.*, 
       u.first_name, u.last_name, u.email, u.phone, u.profile_image_url,
       v.make, v.model, v.license_plate, v.type AS vehicle_type,
       COALESCE(dl.latitude, 0) AS current_latitude,
       COALESCE(dl.longitude, 0) AS current_longitude,
       COUNT(j.id) AS active_jobs
FROM drivers d
JOIN users u ON d.user_id = u.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
LEFT JOIN LATERAL (
    SELECT latitude, longitude 
    FROM driver_locations 
    WHERE driver_id = d.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) dl ON true
LEFT JOIN jobs j ON d.id = j.driver_id AND j.status NOT IN ('delivered', 'cancelled')
WHERE ($1::driver_availability IS NULL OR d.availability = $1)
AND ($2::BOOLEAN IS NULL OR d.is_verified = $2)
GROUP BY d.id, u.first_name, u.last_name, u.email, u.phone, u.profile_image_url,
         v.make, v.model, v.license_plate, v.type, dl.latitude, dl.longitude
ORDER BY d.rating DESC;
*/

-- Update driver location
-- Query: POST /drivers/location
/*
INSERT INTO driver_locations (driver_id, latitude, longitude, accuracy, speed, heading, timestamp)
VALUES ($1, $2, $3, $4, $5, $6, $7);
*/

-- Update driver availability
-- Query: PUT /drivers/:id/availability
/*
UPDATE drivers 
SET availability = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
*/

-- Driver punch in
-- Query: POST /drivers/:id/punch-in
/*
INSERT INTO driver_work_sessions (driver_id, punch_in_time, punch_in_location)
VALUES ($1, CURRENT_TIMESTAMP, POINT($2, $3))
RETURNING *;
*/

-- Driver punch out
-- Query: POST /drivers/:id/punch-out
/*
UPDATE driver_work_sessions 
SET punch_out_time = CURRENT_TIMESTAMP, 
    punch_out_location = POINT($2, $3),
    total_hours = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - punch_in_time)) / 3600
WHERE driver_id = $1 AND punch_out_time IS NULL
RETURNING *;
*/

-- Get driver performance metrics
-- Query: GET /drivers/:id/performance
/*
SELECT 
    COUNT(*) FILTER (WHERE status = 'delivered') AS completed_jobs,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_jobs,
    AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL) AS average_rating,
    SUM(actual_distance) AS total_distance,
    SUM(total_price) FILTER (WHERE status = 'delivered') AS total_earnings,
    AVG(
        CASE 
            WHEN actual_delivery_time IS NOT NULL AND scheduled_delivery_time IS NOT NULL 
            THEN CASE WHEN actual_delivery_time <= scheduled_delivery_time THEN 1.0 ELSE 0.0 END
        END
    ) * 100 AS on_time_delivery_rate
FROM jobs 
WHERE driver_id = $1 
AND created_at >= $2 
AND created_at <= $3;
*/

-- =====================================================
-- CUSTOMER QUERIES
-- =====================================================

-- Get customer jobs
-- Query: GET /customers/:id/jobs
/*
SELECT j.*, 
       u_driver.first_name || ' ' || u_driver.last_name AS driver_name,
       u_driver.phone AS driver_phone,
       d.rating AS driver_rating,
       v.make || ' ' || v.model AS vehicle_info
FROM jobs j
LEFT JOIN drivers d ON j.driver_id = d.id
LEFT JOIN users u_driver ON d.user_id = u_driver.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
WHERE j.customer_id = $1
ORDER BY j.created_at DESC
LIMIT $2 OFFSET $3;
*/

-- Create customer profile
-- Query: POST /customers
/*
INSERT INTO customers (user_id, company_name, business_type, billing_address, shipping_address)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
*/

-- =====================================================
-- NOTIFICATION QUERIES
-- =====================================================

-- Get user notifications
-- Query: GET /notifications
/*
SELECT n.*, nr.read_at, nr.delivered_at
FROM notifications n
JOIN notification_recipients nr ON n.id = nr.notification_id
WHERE nr.user_id = $1
ORDER BY n.created_at DESC
LIMIT $2 OFFSET $3;
*/

-- Mark notification as read
-- Query: PUT /notifications/:id/read
/*
UPDATE notification_recipients 
SET read_at = CURRENT_TIMESTAMP
WHERE notification_id = $1 AND user_id = $2
RETURNING *;
*/

-- Create notification
-- Query: POST /notifications
/*
WITH new_notification AS (
    INSERT INTO notifications (title, message, type, data, priority, scheduled_at)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))
    RETURNING id
)
INSERT INTO notification_recipients (notification_id, user_id)
SELECT new_notification.id, unnest($7::UUID[])
FROM new_notification
RETURNING *;
*/

-- =====================================================
-- REAL-TIME TRACKING QUERIES
-- =====================================================

-- Get job tracking information
-- Query: GET /tracking/:jobId
/*
SELECT j.id, j.status, j.tracking_code,
       j.pickup_location, j.pickup_latitude, j.pickup_longitude,
       j.delivery_location, j.delivery_latitude, j.delivery_longitude,
       j.estimated_arrival, j.scheduled_delivery_time,
       dl.latitude AS current_latitude, dl.longitude AS current_longitude,
       dl.timestamp AS last_update,
       u.first_name || ' ' || u.last_name AS driver_name,
       u.phone AS driver_phone
FROM jobs j
LEFT JOIN drivers d ON j.driver_id = d.id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN LATERAL (
    SELECT latitude, longitude, timestamp
    FROM driver_locations 
    WHERE driver_id = d.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) dl ON true
WHERE j.id = $1 OR j.tracking_code = $1;
*/

-- Get route information
-- Query: GET /tracking/route/:jobId
/*
SELECT 
    j.pickup_latitude, j.pickup_longitude,
    j.delivery_latitude, j.delivery_longitude,
    j.estimated_distance, j.estimated_duration,
    array_agg(
        json_build_object(
            'latitude', dl.latitude,
            'longitude', dl.longitude, 
            'timestamp', dl.timestamp
        ) ORDER BY dl.timestamp
    ) AS location_history
FROM jobs j
LEFT JOIN drivers d ON j.driver_id = d.id
LEFT JOIN driver_locations dl ON d.id = dl.driver_id 
    AND dl.timestamp >= j.actual_pickup_time
    AND dl.timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
WHERE j.id = $1
GROUP BY j.id, j.pickup_latitude, j.pickup_longitude, 
         j.delivery_latitude, j.delivery_longitude,
         j.estimated_distance, j.estimated_duration;
*/

-- =====================================================
-- REPORTING QUERIES
-- =====================================================

-- Daily statistics
-- Query: GET /reports/daily
/*
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS total_jobs,
    COUNT(*) FILTER (WHERE status = 'delivered') AS completed_jobs,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_jobs,
    SUM(total_price) FILTER (WHERE status = 'delivered') AS revenue
FROM jobs 
WHERE created_at >= $1 AND created_at <= $2
GROUP BY DATE(created_at)
ORDER BY date;
*/

-- Driver performance report
-- Query: GET /reports/drivers
/*
SELECT 
    d.id,
    u.first_name || ' ' || u.last_name AS driver_name,
    d.rating,
    COUNT(j.id) AS total_jobs,
    COUNT(j.id) FILTER (WHERE j.status = 'delivered') AS completed_jobs,
    SUM(j.actual_distance) AS total_distance,
    SUM(j.total_price) FILTER (WHERE j.status = 'delivered') AS total_earnings,
    AVG(j.customer_rating) FILTER (WHERE j.customer_rating IS NOT NULL) AS avg_customer_rating
FROM drivers d
JOIN users u ON d.user_id = u.id
LEFT JOIN jobs j ON d.id = j.driver_id 
    AND j.created_at >= $1 
    AND j.created_at <= $2
GROUP BY d.id, u.first_name, u.last_name, d.rating
ORDER BY completed_jobs DESC;
*/

-- Revenue report
-- Query: GET /reports/revenue
/*
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS total_jobs,
    SUM(total_price) FILTER (WHERE status = 'delivered') AS revenue,
    AVG(total_price) FILTER (WHERE status = 'delivered') AS avg_job_value
FROM jobs 
WHERE created_at >= $1 AND created_at <= $2
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
*/

-- =====================================================
-- SEARCH AND FILTER QUERIES
-- =====================================================

-- Search jobs by multiple criteria
-- Query: GET /search/jobs
/*
SELECT j.*, 
       c.company_name,
       u_customer.first_name || ' ' || u_customer.last_name AS customer_name
FROM jobs j
LEFT JOIN customers c ON j.customer_id = c.id
LEFT JOIN users u_customer ON c.user_id = u_customer.id
WHERE 
    ($1::TEXT IS NULL OR j.job_number ILIKE '%' || $1 || '%')
    AND ($2::TEXT IS NULL OR j.pickup_location ILIKE '%' || $2 || '%')
    AND ($3::TEXT IS NULL OR j.delivery_location ILIKE '%' || $3 || '%')
    AND ($4::TEXT IS NULL OR c.company_name ILIKE '%' || $4 || '%')
    AND ($5::job_status IS NULL OR j.status = $5)
    AND ($6::DATE IS NULL OR DATE(j.created_at) >= $6)
    AND ($7::DATE IS NULL OR DATE(j.created_at) <= $7)
ORDER BY j.created_at DESC
LIMIT $8 OFFSET $9;
*/

-- Search drivers by location and availability
-- Query: GET /search/drivers
/*
SELECT d.*, 
       u.first_name, u.last_name, u.phone,
       v.make, v.model, v.license_plate,
       dl.latitude, dl.longitude,
       (6371 * acos(cos(radians($1)) * cos(radians(dl.latitude)) 
        * cos(radians(dl.longitude) - radians($2)) + sin(radians($1)) 
        * sin(radians(dl.latitude)))) AS distance_km
FROM drivers d
JOIN users u ON d.user_id = u.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
JOIN LATERAL (
    SELECT latitude, longitude 
    FROM driver_locations 
    WHERE driver_id = d.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) dl ON true
WHERE d.availability = 'available'
AND d.is_verified = true
AND (6371 * acos(cos(radians($1)) * cos(radians(dl.latitude)) 
     * cos(radians(dl.longitude) - radians($2)) + sin(radians($1)) 
     * sin(radians(dl.latitude)))) <= $3
ORDER BY distance_km
LIMIT $4;
*/
