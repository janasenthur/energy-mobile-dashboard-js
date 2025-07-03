#!/bin/bash
# =====================================================
# Energy Mobile Dashboard - Database Setup (Linux/Mac)
# =====================================================
# This script sets up the PostgreSQL database for the Energy Mobile Dashboard app

echo "============================================"
echo "Energy Mobile Dashboard - Database Setup"
echo "============================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first"
    exit 1
fi

echo "PostgreSQL found - proceeding with setup..."

# Set database name
DB_NAME="energy_mobile_dashboard"

echo ""
echo "Creating database: $DB_NAME"
createdb "$DB_NAME" 2>/dev/null || echo "WARNING: Database may already exist - continuing..."

echo ""
echo "Setting up database schema..."
if ! psql -d "$DB_NAME" -f database/setup-database.sql; then
    echo "ERROR: Setup script failed"
    exit 1
fi

echo ""
echo "Creating tables and inserting sample data..."
if ! psql -d "$DB_NAME" -f database/energy_mobile_dashboard.sql; then
    echo "ERROR: Main schema script failed"
    exit 1
fi

echo ""
echo "Configuring environment settings..."
psql -d "$DB_NAME" -f database/environment-config.sql || echo "WARNING: Environment config failed - continuing..."

echo ""
echo "Validating database setup..."
psql -d "$DB_NAME" -f database/validate-setup.sql || echo "WARNING: Validation script had issues - check manually"

echo ""
echo "============================================"
echo "Database setup completed!"
echo "============================================"
echo ""
echo "Database Name: $DB_NAME"
echo "Connection: postgresql://app_user:password@localhost:5432/$DB_NAME"
echo ""
echo "Default Login Credentials:"
echo "- Admin: admin@energymobile.com / admin123"
echo "- Dispatcher: dispatcher@energymobile.com / dispatcher123"
echo "- Customer: customer@example.com / customer123"
echo "- Driver 1: driver1@energymobile.com / driver123"
echo "- Driver 2: driver2@energymobile.com / driver123"
echo ""
echo "IMPORTANT: Change these passwords before production deployment!"
echo ""
echo "Next steps:"
echo "1. Update your mobile app configuration"
echo "2. Test the API connection"
echo "3. Change default passwords for production"
echo "============================================"
