# Database Deployment Guide
## Energy Mobile Dashboard PostgreSQL Setup

## Prerequisites
- PostgreSQL 13+ installed
- Administrative access to PostgreSQL server
- Sufficient disk space (50GB+ recommended for production)

## Quick Deployment

### Option 1: Single Command Setup
```bash
# Create database and run all scripts
createdb energy_mobile_dashboard
psql -d energy_mobile_dashboard -f database/setup-database.sql
psql -d energy_mobile_dashboard -f database/energy_mobile_dashboard.sql
psql -d energy_mobile_dashboard -f database/environment-config.sql
```

### Option 2: Step-by-Step Setup

1. **Create Database**
   ```bash
   createdb energy_mobile_dashboard
   ```

2. **Connect to Database**
   ```bash
   psql -d energy_mobile_dashboard
   ```

3. **Run Setup Scripts** (in PostgreSQL shell)
   ```sql
   \i database/setup-database.sql
   \i database/energy_mobile_dashboard.sql
   \i database/environment-config.sql
   ```

4. **Verify Installation**
   ```sql
   \dt  -- List tables
   \du  -- List users
   SELECT count(*) FROM users;  -- Should return 5 sample users
   ```

## Production Deployment

### 1. Security Configuration
```sql
-- Change default passwords
ALTER USER app_user WITH PASSWORD 'your_secure_production_password';
ALTER USER app_admin WITH PASSWORD 'your_admin_production_password';

-- Update sample user passwords
UPDATE users SET password_hash = crypt('new_password', gen_salt('bf')) 
WHERE email IN ('admin@energymobile.com', 'dispatcher@energymobile.com');
```

### 2. Environment Variables
Create these environment variables in your app:
```env
DATABASE_URL=postgresql://app_user:password@localhost:5432/energy_mobile_dashboard
DATABASE_ADMIN_URL=postgresql://app_admin:password@localhost:5432/energy_mobile_dashboard
POSTGRES_DB=energy_mobile_dashboard
POSTGRES_USER=app_user
POSTGRES_PASSWORD=your_secure_password
```

### 3. Backup Setup
```bash
# Daily backup script
pg_dump energy_mobile_dashboard > backup_$(date +%Y%m%d).sql
```

## Testing the Database

### 1. Test Sample Data
```sql
-- Check users
SELECT role, count(*) FROM users GROUP BY role;

-- Check jobs
SELECT status, count(*) FROM jobs GROUP BY status;

-- Check drivers
SELECT availability, count(*) FROM drivers GROUP BY availability;
```

### 2. Test API Queries
```sql
-- Login test
SELECT id, email, role, first_name, last_name 
FROM users 
WHERE email = 'admin@energymobile.com';

-- Job lookup test
SELECT j.job_number, j.status, u.first_name || ' ' || u.last_name as customer_name
FROM jobs j
JOIN customers c ON j.customer_id = c.id
JOIN users u ON c.user_id = u.id;
```

## Connection Strings

### Development
```
postgresql://app_user:password@localhost:5432/energy_mobile_dashboard
```

### Production (with SSL)
```
postgresql://app_user:password@your-db-host:5432/energy_mobile_dashboard?sslmode=require
```

## Default Login Credentials

⚠️ **Change these passwords before production deployment!**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@energymobile.com | admin123 |
| Dispatcher | dispatcher@energymobile.com | dispatcher123 |
| Customer | customer@example.com | customer123 |
| Driver 1 | driver1@energymobile.com | driver123 |
| Driver 2 | driver2@energymobile.com | driver123 |

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   sudo -u postgres psql
   ```

2. **Database Already Exists**
   ```sql
   DROP DATABASE IF EXISTS energy_mobile_dashboard;
   CREATE DATABASE energy_mobile_dashboard;
   ```

3. **Missing Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

4. **Check Installation**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

## Next Steps

1. **Backend Integration**: Use the queries in `sample-queries.sql` for your API endpoints
2. **Mobile App Configuration**: Update database connection strings in your React Native app
3. **Testing**: Run the test queries to ensure everything works
4. **Production**: Follow security guidelines and change default passwords
5. **Monitoring**: Set up database monitoring and backup schedules

For detailed documentation, see `database/README.md`.
