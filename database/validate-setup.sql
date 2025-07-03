-- =====================================================
-- Database Validation Script
-- =====================================================
-- Run this script to validate that the database setup was successful

DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    job_count INTEGER;
    driver_count INTEGER;
    vehicle_count INTEGER;
BEGIN
    -- Check if all main tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'customers', 'drivers', 'vehicles', 'jobs', 'notifications');
    
    -- Count sample data
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO job_count FROM jobs;
    SELECT COUNT(*) INTO driver_count FROM drivers;
    SELECT COUNT(*) INTO vehicle_count FROM vehicles;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATABASE VALIDATION RESULTS';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Main tables found: %/6', table_count;
    RAISE NOTICE 'Sample users: %', user_count;
    RAISE NOTICE 'Sample jobs: %', job_count;
    RAISE NOTICE 'Sample drivers: %', driver_count;
    RAISE NOTICE 'Sample vehicles: %', vehicle_count;
    RAISE NOTICE '============================================';
    
    IF table_count = 6 AND user_count >= 5 THEN
        RAISE NOTICE 'DATABASE SETUP: ✅ SUCCESS';
        RAISE NOTICE 'All required tables and sample data present';
    ELSE
        RAISE NOTICE 'DATABASE SETUP: ❌ INCOMPLETE';
        RAISE NOTICE 'Please check the setup scripts and re-run';
    END IF;
    
    RAISE NOTICE '============================================';
END $$;

-- Test sample queries
\echo '\n=== TESTING SAMPLE QUERIES ==='

-- Test user authentication
\echo '\n1. Testing user login query:'
SELECT id, email, role, first_name, last_name, status
FROM users 
WHERE email = 'admin@energymobile.com' 
AND status = 'active'
LIMIT 1;

-- Test job listing
\echo '\n2. Testing job listing query:'
SELECT j.job_number, j.status, j.type, j.priority,
       u.first_name || ' ' || u.last_name AS customer_name
FROM jobs j
JOIN customers c ON j.customer_id = c.id
JOIN users u ON c.user_id = u.id
LIMIT 3;

-- Test driver availability
\echo '\n3. Testing driver availability query:'
SELECT d.id, u.first_name || ' ' || u.last_name AS driver_name,
       d.availability, v.make || ' ' || v.model AS vehicle
FROM drivers d
JOIN users u ON d.user_id = u.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
WHERE d.availability = 'available'
LIMIT 3;

-- Test location tracking
\echo '\n4. Testing location tracking:'
SELECT 'Location tracking table ready' AS status,
       COUNT(*) AS location_records
FROM driver_locations;

-- Test notification system
\echo '\n5. Testing notification system:'
SELECT 'Notification system ready' AS status,
       COUNT(*) AS notification_records
FROM notifications;

\echo '\n=== VALIDATION COMPLETE ==='
\echo 'If all queries returned data successfully, your database is ready!'
\echo 'Next: Update your mobile app configuration with database connection details.'
