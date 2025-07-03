# PostgreSQL Database Documentation
## Energy Mobile Dashboard Application

### Overview
This documentation covers the complete PostgreSQL database schema for the Energy Mobile Dashboard application, including setup, configuration, maintenance, and usage guidelines.

### Database Schema Version: 1.0
**Created:** July 2, 2025  
**Last Updated:** July 2, 2025  
**PostgreSQL Version:** 13+ (recommended)

---

## Database Files
- **`energy_mobile_dashboard.sql`** - Main database schema with tables, triggers, and sample data
- **`setup-database.sql`** - Initial setup script with extensions and validation
- **`environment-config.sql`** - Environment-specific configurations (dev/staging/prod)
- **`migrations.sql`** - Future schema changes and migrations
- **`maintenance.sql`** - Backup, cleanup, and maintenance scripts
- **`sample-queries.sql`** - Pre-built API queries for backend integration
- **`validate-setup.sql`** - Validation script to test database setup
- **`DEPLOYMENT.md`** - Complete deployment guide
- **`README.md`** - This documentation file

## Table of Contents
1. [Quick Setup](#quick-setup)
2. [Database Schema](#database-schema)
3. [Environment Configuration](#environment-configuration)
4. [Security](#security)
5. [Performance Optimization](#performance-optimization)
6. [Backup and Recovery](#backup-and-recovery)
7. [Maintenance](#maintenance)
8. [API Integration](#api-integration)
9. [Troubleshooting](#troubleshooting)

---

## Quick Setup

### Option 1: One-Command Setup
```bash
# Complete database setup
createdb energy_mobile_dashboard
psql -d energy_mobile_dashboard -f database/setup-database.sql
psql -d energy_mobile_dashboard -f database/energy_mobile_dashboard.sql
psql -d energy_mobile_dashboard -f database/validate-setup.sql
```

### Option 2: Step-by-Step
See detailed instructions in **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Prerequisites
- PostgreSQL 13+ installed and running
- Database administrator access
- Sufficient disk space (recommended: 50GB+ for production)

### Verification
```bash
# Run validation script
psql -d energy_mobile_dashboard -f database/validate-setup.sql
```

### Default Login Credentials
- **Admin:** admin@energymobile.com / admin123
- **Dispatcher:** dispatcher@energymobile.com / dispatcher123
- **Customer:** customer@example.com / customer123
- **Driver1:** driver1@energymobile.com / driver123
- **Driver2:** driver2@energymobile.com / driver123

---

## Database Schema

### Core Tables

#### Users Table
Primary authentication and user management table.
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role,  -- 'customer', 'driver', 'dispatcher', 'admin'
    status user_status,  -- 'active', 'inactive', 'suspended', 'pending_approval'
    first_name, last_name VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    preferences JSONB,
    created_at, updated_at TIMESTAMP WITH TIME ZONE
)
```

#### Jobs Table
Central job/booking management table.
```sql
jobs (
    id UUID PRIMARY KEY,
    job_number VARCHAR(50) UNIQUE,
    customer_id UUID REFERENCES customers(id),
    driver_id UUID REFERENCES drivers(id),
    type job_type,  -- 'delivery', 'pickup', 'emergency', 'scheduled', 'return'
    status job_status,  -- 'pending', 'assigned', 'en_route_pickup', etc.
    priority job_priority,  -- 'low', 'medium', 'high', 'urgent'
    
    -- Location data
    pickup_location TEXT,
    pickup_latitude, pickup_longitude DECIMAL,
    delivery_location TEXT,
    delivery_latitude, delivery_longitude DECIMAL,
    
    -- Cargo and pricing
    cargo_description TEXT,
    cargo_weight, cargo_volume DECIMAL,
    base_price, total_price DECIMAL,
    
    -- Timing
    scheduled_pickup_time, actual_pickup_time TIMESTAMP WITH TIME ZONE,
    scheduled_delivery_time, actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    created_at, updated_at TIMESTAMP WITH TIME ZONE
)
```

#### Drivers Table
Driver-specific information and performance tracking.
```sql
drivers (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    license_number VARCHAR(50),
    license_expiry_date DATE,
    availability driver_availability,  -- 'available', 'busy', 'offline', 'break'
    rating DECIMAL(3,2),
    total_jobs INTEGER,
    total_earnings DECIMAL(10,2),
    total_distance DECIMAL(10,2),
    is_verified BOOLEAN,
    created_at, updated_at TIMESTAMP WITH TIME ZONE
)
```

### Supporting Tables

#### Driver Locations
Real-time GPS tracking data.
```sql
driver_locations (
    id UUID PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id),
    latitude, longitude DECIMAL,
    accuracy, speed, heading DECIMAL,
    timestamp TIMESTAMP WITH TIME ZONE
)
```

#### Notifications
Push and local notification management.
```sql
notifications (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    type notification_type,  -- 'job', 'payment', 'system', 'emergency', 'message'
    data JSONB,
    priority INTEGER,
    scheduled_at, sent_at TIMESTAMP WITH TIME ZONE
)
```

### Data Types and Enums

```sql
-- Custom enum types
user_role: 'customer', 'driver', 'dispatcher', 'admin'
user_status: 'active', 'inactive', 'suspended', 'pending_approval'
driver_availability: 'available', 'busy', 'offline', 'break'
job_status: 'pending', 'assigned', 'en_route_pickup', 'arrived_pickup', 
           'picked_up', 'en_route_delivery', 'arrived_delivery', 
           'delivered', 'cancelled', 'on_hold'
job_priority: 'low', 'medium', 'high', 'urgent'
job_type: 'delivery', 'pickup', 'emergency', 'scheduled', 'return'
vehicle_type: 'truck', 'van', 'car', 'motorcycle', 'heavy_truck'
notification_type: 'job', 'payment', 'system', 'emergency', 'message'
```

---

## Environment Configuration

### Development Environment
```sql
-- Enable verbose logging
SET log_statement = 'all';
SET log_duration = on;

-- Insert test data
-- (Automatically included in environment-config.sql)
```

### Staging Environment
```sql
-- Moderate logging
SET log_statement = 'ddl';

-- Sanitize data
SELECT sanitize_staging_data();
```

### Production Environment
```sql
-- Minimal logging for performance
SET log_statement = 'none';

-- Enable monitoring
SELECT * FROM check_production_health();
```

---

## Security

### User Roles and Permissions

#### Application Users
- **app_user**: Standard application database user
- **app_admin**: Administrative database user
- **readonly_user**: Read-only access for reporting
- **backup_user**: Backup operations only

#### Row-Level Security
```sql
-- Customers can only access their own data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_isolation ON customers ...

-- Jobs are filtered by user role and ownership
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_customer_isolation ON jobs ...
```

#### Setting User Context
```sql
-- Call after user authentication
SELECT set_user_context('user-uuid', 'customer');
```

### Password Security
- All passwords stored as bcrypt hashes
- Minimum password complexity enforced at application level
- Session management via JWT tokens

---

## Performance Optimization

### Key Indexes
```sql
-- Location-based queries
CREATE INDEX idx_driver_locations_coords ON driver_locations USING GIST(point(longitude, latitude));

-- Time-based queries  
CREATE INDEX idx_jobs_created_at_status ON jobs(created_at, status);

-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_tracking_code ON jobs(tracking_code);
```

### Recommended PostgreSQL Settings
```conf
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connections
max_connections = 100

# WAL
wal_level = replica
max_wal_size = 1GB

# Vacuum
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
```

### Query Optimization Tips
1. Use appropriate indexes for location queries (GIST)
2. Limit location history retention (30 days recommended)
3. Archive old jobs (1+ years) to separate table
4. Monitor slow queries with pg_stat_statements

---

## Backup and Recovery

### Backup Strategy

#### Daily Full Backups
```bash
pg_dump -h localhost -U postgres -d energy_mobile_dashboard > daily_backup_$(date +%Y%m%d).sql
```

#### Incremental Backups
```sql
-- Use built-in function
SELECT create_incremental_backup('2025-07-01 00:00:00'::timestamp);
```

#### Point-in-Time Recovery
Enable WAL archiving for PITR capability:
```conf
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

### Recovery Procedures

#### Full Database Restore
```bash
dropdb energy_mobile_dashboard
createdb energy_mobile_dashboard
psql -d energy_mobile_dashboard < backup_file.sql
```

#### Selective Table Restore
```bash
pg_restore -h localhost -U postgres -d energy_mobile_dashboard -t jobs backup_file.dump
```

---

## Maintenance

### Automated Maintenance Scripts

#### Daily Maintenance
```sql
SELECT daily_maintenance();
-- Cleans old location data, updates statistics
```

#### Weekly Maintenance  
```sql
SELECT weekly_maintenance();
-- Cleans notifications, runs VACUUM ANALYZE
```

#### Monthly Maintenance
```sql
SELECT monthly_maintenance();
-- Archives old jobs, reindexes tables
```

### Manual Maintenance Tasks

#### Clean Old Data
```sql
-- Location data (keep 30 days)
SELECT cleanup_old_locations();

-- Notifications (keep 90 days)
SELECT cleanup_old_notifications();

-- Archive jobs (move 1+ year old)
SELECT archive_old_jobs();
```

#### Database Health Checks
```sql
-- Table sizes
SELECT * FROM get_database_size_info();

-- Slow queries (requires pg_stat_statements)
SELECT * FROM get_slow_queries();

-- Production health check
SELECT * FROM check_production_health();
```

---

## API Integration

### Connection Configuration
Update your application's database configuration:

```javascript
// src/config/database.js
const config = {
  development: {
    host: 'localhost',
    port: 5432,
    database: 'energy_mobile_dashboard_dev',
    username: 'app_user',
    password: 'your_secure_password',
    dialect: 'postgres',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    ssl: true,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};
```

### Common Query Patterns

#### Get Active Jobs for Driver
```sql
SELECT j.*, c.company_name 
FROM jobs j
JOIN customers c ON j.customer_id = c.id
WHERE j.driver_id = $1 
AND j.status NOT IN ('delivered', 'cancelled')
ORDER BY j.scheduled_pickup_time;
```

#### Find Nearby Available Drivers
```sql
SELECT * FROM get_nearby_drivers(32.7767, -96.7970, 50);
```

#### Update Job Status with Location
```sql
UPDATE jobs 
SET status = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2;

INSERT INTO job_status_history (job_id, status, location, timestamp)
VALUES ($2, $1, POINT($3, $4), CURRENT_TIMESTAMP);
```

---

## Troubleshooting

### Common Issues

#### Connection Problems
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection limits
SHOW max_connections;

-- Kill problematic connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';
```

#### Performance Issues
```sql
-- Check for long-running queries
SELECT query, state, query_start 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < CURRENT_TIMESTAMP - INTERVAL '5 minutes';

-- Check for table bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Data Integrity Issues
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM jobs WHERE customer_id NOT IN (SELECT id FROM customers);
SELECT COUNT(*) FROM drivers WHERE user_id NOT IN (SELECT id FROM users);

-- Verify foreign key constraints
SELECT conname, conrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f' AND NOT convalidated;
```

### Error Messages

#### "too many connections"
- Increase max_connections in postgresql.conf
- Implement connection pooling in application
- Check for connection leaks

#### "out of shared memory"
- Increase shared_buffers
- Check for memory leaks in long-running transactions

#### "permission denied"
- Verify user roles and permissions
- Check row-level security policies
- Ensure user context is set correctly

### Performance Monitoring

#### Enable pg_stat_statements
```sql
-- Add to postgresql.conf
shared_preload_libraries = 'pg_stat_statements'

-- Create extension
CREATE EXTENSION pg_stat_statements;

-- Query slow statements
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Monitor Index Usage
```sql
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0;  -- Unused indexes
```

---

## Contact and Support

For database-related issues:
1. Check this documentation first
2. Review PostgreSQL logs: `/var/log/postgresql/`
3. Run health check functions: `SELECT * FROM check_production_health();`
4. Contact database administrator

**Remember to regularly backup your database and test recovery procedures!**
