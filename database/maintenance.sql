-- =====================================================
-- Database Backup and Maintenance Scripts
-- =====================================================

-- =====================================================
-- BACKUP PROCEDURES
-- =====================================================

-- Full database backup function
CREATE OR REPLACE FUNCTION create_full_backup()
RETURNS TEXT AS $$
DECLARE
    backup_filename TEXT;
    backup_path TEXT := '/var/backups/energy_mobile/';
BEGIN
    backup_filename := 'energy_mobile_full_' || to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS') || '.sql';
    
    -- This would typically be executed via pg_dump externally
    -- pg_dump -h localhost -U postgres -d energy_mobile > /var/backups/energy_mobile/energy_mobile_full_YYYY_MM_DD_HH24_MI_SS.sql
    
    RETURN backup_path || backup_filename;
END;
$$ LANGUAGE plpgsql;

-- Incremental backup function (changes since last backup)
CREATE OR REPLACE FUNCTION create_incremental_backup(since_timestamp TIMESTAMP WITH TIME ZONE)
RETURNS TEXT AS $$
DECLARE
    backup_filename TEXT;
    record_count INTEGER := 0;
BEGIN
    backup_filename := 'energy_mobile_incremental_' || to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS') || '.sql';
    
    -- Count records that have changed since the given timestamp
    SELECT 
        (SELECT COUNT(*) FROM users WHERE updated_at > since_timestamp) +
        (SELECT COUNT(*) FROM jobs WHERE updated_at > since_timestamp) +
        (SELECT COUNT(*) FROM drivers WHERE updated_at > since_timestamp) +
        (SELECT COUNT(*) FROM driver_locations WHERE created_at > since_timestamp)
    INTO record_count;
    
    RAISE NOTICE 'Incremental backup would include % changed records since %', record_count, since_timestamp;
    
    RETURN backup_filename;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLEANUP PROCEDURES
-- =====================================================

-- Clean old location data (keep only last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM driver_locations 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old location records', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Clean old notifications (keep only last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old notification recipients first
    DELETE FROM notification_recipients 
    WHERE notification_id IN (
        SELECT id FROM notifications 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
    );
    
    -- Delete old notifications
    DELETE FROM notifications 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old notification records', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Archive completed jobs older than 1 year
CREATE OR REPLACE FUNCTION archive_old_jobs()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS jobs_archive (LIKE jobs INCLUDING ALL);
    
    -- Move old completed jobs to archive
    WITH archived_jobs AS (
        DELETE FROM jobs 
        WHERE status IN ('delivered', 'cancelled') 
        AND updated_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
        RETURNING *
    )
    INSERT INTO jobs_archive SELECT * FROM archived_jobs;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RAISE NOTICE 'Archived % old job records', archived_count;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MAINTENANCE PROCEDURES
-- =====================================================

-- Update database statistics
CREATE OR REPLACE FUNCTION update_database_statistics()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Analyze all tables to update statistics
    ANALYZE users;
    ANALYZE jobs;
    ANALYZE drivers;
    ANALYZE driver_locations;
    ANALYZE notifications;
    ANALYZE customers;
    ANALYZE vehicles;
    
    result := 'Database statistics updated for all main tables at ' || CURRENT_TIMESTAMP;
    
    RAISE NOTICE '%', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Reindex database tables
CREATE OR REPLACE FUNCTION reindex_database_tables()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Reindex main tables
    REINDEX TABLE users;
    REINDEX TABLE jobs;
    REINDEX TABLE drivers;
    REINDEX TABLE driver_locations;
    REINDEX TABLE notifications;
    
    result := 'Database tables reindexed at ' || CURRENT_TIMESTAMP;
    
    RAISE NOTICE '%', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Vacuum and analyze database
CREATE OR REPLACE FUNCTION vacuum_analyze_database()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Note: VACUUM FULL requires exclusive locks and should be run during maintenance windows
    -- Using regular VACUUM here which can run concurrently
    
    VACUUM ANALYZE users;
    VACUUM ANALYZE jobs;
    VACUUM ANALYZE drivers;
    VACUUM ANALYZE driver_locations;
    VACUUM ANALYZE notifications;
    VACUUM ANALYZE customers;
    VACUUM ANALYZE vehicles;
    
    result := 'Database vacuum and analyze completed at ' || CURRENT_TIMESTAMP;
    
    RAISE NOTICE '%', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MONITORING FUNCTIONS
-- =====================================================

-- Get database size information
CREATE OR REPLACE FUNCTION get_database_size_info()
RETURNS TABLE (
    table_name TEXT,
    size_mb NUMERIC,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename AS table_name,
        ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) AS size_mb,
        n_tup_ins - n_tup_del AS row_count
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Get slow query information
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time NUMERIC,
    avg_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LEFT(query, 100) || '...' AS query,
        calls,
        ROUND(total_time::NUMERIC, 2) AS total_time,
        ROUND((total_time / calls)::NUMERIC, 2) AS avg_time
    FROM pg_stat_statements 
    WHERE calls > 10
    ORDER BY total_time DESC
    LIMIT 10;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'pg_stat_statements extension not installed. Install it for query performance monitoring.';
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULED MAINTENANCE JOBS
-- =====================================================

-- Daily maintenance routine
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := 'Daily maintenance completed: ';
    locations_cleaned INTEGER;
    stats_result TEXT;
BEGIN
    -- Clean old location data
    SELECT cleanup_old_locations() INTO locations_cleaned;
    
    -- Update statistics
    SELECT update_database_statistics() INTO stats_result;
    
    result := result || locations_cleaned || ' locations cleaned, statistics updated';
    
    RAISE NOTICE '%', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Weekly maintenance routine
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := 'Weekly maintenance completed: ';
    notifications_cleaned INTEGER;
    vacuum_result TEXT;
BEGIN
    -- Clean old notifications
    SELECT cleanup_old_notifications() INTO notifications_cleaned;
    
    -- Vacuum and analyze
    SELECT vacuum_analyze_database() INTO vacuum_result;
    
    result := result || notifications_cleaned || ' notifications cleaned, vacuum completed';
    
    RAISE NOTICE '%', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Monthly maintenance routine
CREATE OR REPLACE FUNCTION monthly_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := 'Monthly maintenance completed: ';
    jobs_archived INTEGER;
    reindex_result TEXT;
BEGIN
    -- Archive old jobs
    SELECT archive_old_jobs() INTO jobs_archived;
    
    -- Reindex tables
    SELECT reindex_database_tables() INTO reindex_result;
    
    result := result || jobs_archived || ' jobs archived, reindexing completed';
    
    RAISE NOTICE '%', result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXAMPLE USAGE
-- =====================================================

/*
-- Run daily maintenance
SELECT daily_maintenance();

-- Run weekly maintenance
SELECT weekly_maintenance();

-- Run monthly maintenance
SELECT monthly_maintenance();

-- Check database size
SELECT * FROM get_database_size_info();

-- Check slow queries (requires pg_stat_statements)
SELECT * FROM get_slow_queries();

-- Manual cleanup operations
SELECT cleanup_old_locations();
SELECT cleanup_old_notifications();
SELECT archive_old_jobs();

-- Manual maintenance operations
SELECT update_database_statistics();
SELECT vacuum_analyze_database();
SELECT reindex_database_tables();
*/
