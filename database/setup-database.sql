-- =====================================================
-- Energy Mobile Dashboard - Database Setup Script
-- =====================================================
-- This script sets up the complete database for the Energy Mobile Dashboard app
-- Run this script as a PostgreSQL superuser or database administrator

-- Create the database (uncomment if running from outside the database)
-- CREATE DATABASE energy_mobile_dashboard;
-- \c energy_mobile_dashboard;

-- Check PostgreSQL version
SELECT version();

-- Create extensions needed for the application
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE; -- For geographic features

-- Display setup information
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Starting Energy Mobile Dashboard Setup...';
    RAISE NOTICE 'PostgreSQL Version: %', version();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Schema: %', current_schema();
    RAISE NOTICE '============================================';
END $$;

-- Import main schema (uncomment when running interactively)
-- \i energy_mobile_dashboard.sql

-- Import environment configuration
-- \i environment-config.sql

-- Success message
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update database connection strings in your app';
    RAISE NOTICE '2. Update passwords for production deployment';
    RAISE NOTICE '3. Configure backup schedules';
    RAISE NOTICE '4. Test API connectivity';
    RAISE NOTICE '============================================';
END $$;
