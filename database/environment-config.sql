-- =====================================================
-- Environment-Specific Database Configurations
-- =====================================================

-- =====================================================
-- DEVELOPMENT ENVIRONMENT
-- =====================================================

-- Development database configuration
-- Use this for local development and testing

-- Create development database
-- CREATE DATABASE energy_mobile_dev;

-- Development-specific settings
-- SET shared_preload_libraries = 'pg_stat_statements';
-- SET log_statement = 'all';
-- SET log_duration = on;

-- Insert development test data
DO $$
BEGIN
    -- Only insert if we're in development (check for dev-specific indicator)
    IF EXISTS (SELECT 1 FROM pg_database WHERE datname LIKE '%dev%' OR datname LIKE '%test%') THEN
        
        -- Insert additional test users
        INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone, email_verified) VALUES
        ('test.customer1@example.com', '$2b$10$test', 'customer', 'active', 'Test', 'Customer1', '+1-555-1001', TRUE),
        ('test.customer2@example.com', '$2b$10$test', 'customer', 'active', 'Test', 'Customer2', '+1-555-1002', TRUE),
        ('test.driver1@example.com', '$2b$10$test', 'driver', 'active', 'Test', 'Driver1', '+1-555-2001', TRUE),
        ('test.driver2@example.com', '$2b$10$test', 'driver', 'active', 'Test', 'Driver2', '+1-555-2002', TRUE),
        ('test.dispatcher@example.com', '$2b$10$test', 'dispatcher', 'active', 'Test', 'Dispatcher', '+1-555-3001', TRUE)
        ON CONFLICT (email) DO NOTHING;
        
        -- Insert test vehicles
        INSERT INTO vehicles (make, model, year, license_plate, type, capacity_weight, capacity_volume) VALUES
        ('Toyota', 'Hiace', 2020, 'TEST-001', 'van', 800.00, 8.00),
        ('Isuzu', 'NQR', 2021, 'TEST-002', 'truck', 3000.00, 15.00),
        ('Ford', 'Transit', 2022, 'TEST-003', 'van', 1200.00, 10.00)
        ON CONFLICT (license_plate) DO NOTHING;
        
        RAISE NOTICE 'Development test data inserted';
    END IF;
END $$;

-- =====================================================
-- STAGING ENVIRONMENT
-- =====================================================

-- Staging database configuration
-- Use this for pre-production testing

-- Staging-specific settings (less verbose logging)
-- SET log_statement = 'ddl';
-- SET log_duration = off;
-- SET shared_preload_libraries = 'pg_stat_statements';

-- Staging data sanitization function
CREATE OR REPLACE FUNCTION sanitize_staging_data()
RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Anonymize customer data in staging
    UPDATE users SET 
        email = 'staging_user_' || id::text || '@example.com',
        phone = '+1-555-' || LPAD((RANDOM() * 10000)::INTEGER::TEXT, 4, '0')
    WHERE role IN ('customer', 'driver') 
    AND email NOT LIKE 'staging_%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Anonymize customer company data
    UPDATE customers SET 
        company_name = 'Test Company ' || id::text,
        tax_id = 'TEST-' || SUBSTRING(id::text, 1, 8)
    WHERE company_name NOT LIKE 'Test Company%';
    
    RETURN 'Sanitized ' || updated_count || ' user records for staging environment';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PRODUCTION ENVIRONMENT
-- =====================================================

-- Production database configuration
-- Use this for live production environment

-- Production-specific settings (minimal logging)
-- SET log_statement = 'none';
-- SET log_duration = off;
-- SET shared_preload_libraries = 'pg_stat_statements, auto_explain';

-- Production monitoring and alerting functions
CREATE OR REPLACE FUNCTION check_production_health()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check for long-running transactions
    RETURN QUERY
    SELECT 
        'Long Running Transactions' AS check_name,
        CASE 
            WHEN COUNT(*) > 5 THEN 'CRITICAL'
            WHEN COUNT(*) > 2 THEN 'WARNING'
            ELSE 'OK'
        END AS status,
        'Found ' || COUNT(*) || ' transactions running longer than 5 minutes' AS details
    FROM pg_stat_activity 
    WHERE state = 'active' 
    AND query_start < CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    AND query NOT LIKE '%pg_stat_activity%';
    
    -- Check for table bloat
    RETURN QUERY
    SELECT 
        'Database Size' AS check_name,
        CASE 
            WHEN pg_database_size(current_database()) > 10 * 1024 * 1024 * 1024 THEN 'WARNING'
            ELSE 'OK'
        END AS status,
        'Database size: ' || pg_size_pretty(pg_database_size(current_database())) AS details;
    
    -- Check for failed jobs in last hour
    RETURN QUERY
    SELECT 
        'Failed Jobs' AS check_name,
        CASE 
            WHEN COUNT(*) > 10 THEN 'CRITICAL'
            WHEN COUNT(*) > 5 THEN 'WARNING'
            ELSE 'OK'
        END AS status,
        'Found ' || COUNT(*) || ' cancelled jobs in last hour' AS details
    FROM jobs 
    WHERE status = 'cancelled' 
    AND updated_at > CURRENT_TIMESTAMP - INTERVAL '1 hour';
    
    -- Check for unprocessed notifications
    RETURN QUERY
    SELECT 
        'Notification Queue' AS check_name,
        CASE 
            WHEN COUNT(*) > 1000 THEN 'CRITICAL'
            WHEN COUNT(*) > 500 THEN 'WARNING'
            ELSE 'OK'
        END AS status,
        'Found ' || COUNT(*) || ' unsent notifications' AS details
    FROM notifications 
    WHERE sent_at IS NULL 
    AND scheduled_at <= CURRENT_TIMESTAMP;
    
END;
$$ LANGUAGE plpgsql;

-- Production backup verification
CREATE OR REPLACE FUNCTION verify_backup_integrity()
RETURNS TEXT AS $$
DECLARE
    table_count INTEGER;
    expected_tables INTEGER := 15; -- Update this based on actual table count
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    IF table_count < expected_tables THEN
        RETURN 'CRITICAL: Missing tables in backup. Expected ' || expected_tables || ', found ' || table_count;
    END IF;
    
    -- Check for recent data
    IF NOT EXISTS (SELECT 1 FROM jobs WHERE created_at > CURRENT_DATE - INTERVAL '1 day') THEN
        RETURN 'WARNING: No recent job data found in backup';
    END IF;
    
    RETURN 'OK: Backup integrity verified';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE TUNING CONFIGURATIONS
-- =====================================================

-- Recommended PostgreSQL settings for production
/*
# postgresql.conf recommendations for Energy Mobile Dashboard

# Memory settings
shared_buffers = 256MB                    # 25% of total RAM
effective_cache_size = 1GB               # 75% of total RAM
work_mem = 4MB                           # For sorting and joins
maintenance_work_mem = 64MB              # For VACUUM, CREATE INDEX

# Connection settings
max_connections = 100                    # Adjust based on app requirements
superuser_reserved_connections = 3

# Write-ahead logging
wal_level = replica                      # For streaming replication
max_wal_size = 1GB
min_wal_size = 80MB
checkpoint_completion_target = 0.9

# Query planner
random_page_cost = 1.1                   # SSD storage
effective_io_concurrency = 200          # SSD storage

# Logging
log_destination = 'csvlog'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000       # Log queries > 1 second
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Auto vacuum
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
*/

-- Create indexes for optimal performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at_status 
ON jobs(created_at, status) WHERE status IN ('pending', 'assigned');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_driver_locations_driver_timestamp 
ON driver_locations(driver_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notification_recipients(user_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- SECURITY CONFIGURATIONS
-- =====================================================

-- Create read-only user for reporting
CREATE ROLE readonly_user LOGIN PASSWORD 'secure_readonly_password';
GRANT CONNECT ON DATABASE postgres TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Create backup user
CREATE ROLE backup_user LOGIN PASSWORD 'secure_backup_password';
GRANT CONNECT ON DATABASE postgres TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Row-level security for customer data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers to only see their own data
CREATE POLICY customer_isolation ON customers
    FOR ALL TO app_user
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Create policy for jobs - customers can only see their jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY job_customer_isolation ON jobs
    FOR ALL TO app_user
    USING (
        customer_id IN (
            SELECT id FROM customers 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
        OR 
        driver_id IN (
            SELECT id FROM drivers 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
        OR
        current_setting('app.current_user_role') IN ('admin', 'dispatcher')
    );

-- Function to set current user context (call this after authentication)
CREATE OR REPLACE FUNCTION set_user_context(user_id UUID, user_role TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, true);
    PERFORM set_config('app.current_user_role', user_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MONITORING AND ALERTING
-- =====================================================

-- Function to send alerts (placeholder - integrate with your alerting system)
CREATE OR REPLACE FUNCTION send_database_alert(alert_level TEXT, message TEXT)
RETURNS VOID AS $$
BEGIN
    -- Log the alert
    RAISE NOTICE 'ALERT [%]: %', alert_level, message;
    
    -- Insert into alerts table (create if needed)
    INSERT INTO database_alerts (level, message, created_at) 
    VALUES (alert_level, message, CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING;
    
    -- Here you would integrate with your actual alerting system
    -- Examples: send to Slack, email, PagerDuty, etc.
    
END;
$$ LANGUAGE plpgsql;

-- Create alerts table
CREATE TABLE IF NOT EXISTS database_alerts (
    id SERIAL PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EXAMPLE ENVIRONMENT USAGE
-- =====================================================

/*
-- Set up development environment
SELECT 'Development environment configured';

-- Set up staging environment  
SELECT sanitize_staging_data();

-- Check production health
SELECT * FROM check_production_health();

-- Verify backup integrity
SELECT verify_backup_integrity();

-- Set user context for row-level security
SELECT set_user_context('user-uuid-here', 'customer');
*/
