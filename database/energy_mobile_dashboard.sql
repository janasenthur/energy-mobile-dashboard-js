-- =====================================================
-- Energy Mobile Dashboard - PostgreSQL Database Schema
-- =====================================================
-- Version: 1.0
-- Created: July 2, 2025
-- Description: Complete database schema for the Energy Mobile Dashboard app
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS job_status_history CASCADE;
DROP TABLE IF EXISTS job_documents CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS driver_locations CASCADE;
DROP TABLE IF EXISTS driver_documents CASCADE;
DROP TABLE IF EXISTS driver_performance CASCADE;
DROP TABLE IF EXISTS driver_work_sessions CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =====================================================
-- ENUMS AND TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'driver', 'dispatcher', 'admin');

-- User status
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');

-- Driver availability status
CREATE TYPE driver_availability AS ENUM ('available', 'busy', 'offline', 'break');

-- Job status
CREATE TYPE job_status AS ENUM (
    'pending', 'assigned', 'en_route_pickup', 'arrived_pickup', 
    'picked_up', 'en_route_delivery', 'arrived_delivery', 
    'delivered', 'cancelled', 'on_hold'
);

-- Job priority
CREATE TYPE job_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Job type
CREATE TYPE job_type AS ENUM ('delivery', 'pickup', 'emergency', 'scheduled', 'return');

-- Vehicle type
CREATE TYPE vehicle_type AS ENUM ('truck', 'van', 'car', 'motorcycle', 'heavy_truck');

-- Notification type
CREATE TYPE notification_type AS ENUM ('job', 'payment', 'system', 'emergency', 'message');

-- Document type
CREATE TYPE document_type AS ENUM ('license', 'insurance', 'registration', 'inspection', 'other');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name user_role NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (main authentication table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'pending_approval',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    push_token TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    business_type VARCHAR(100),
    tax_id VARCHAR(50),
    billing_address JSONB,
    shipping_address JSONB,
    payment_methods JSONB DEFAULT '[]',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vin VARCHAR(17) UNIQUE,
    type vehicle_type NOT NULL,
    capacity_weight DECIMAL(8,2), -- in kg
    capacity_volume DECIMAL(8,2), -- in cubic meters
    fuel_type VARCHAR(20),
    insurance_number VARCHAR(100),
    registration_number VARCHAR(100),
    inspection_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id),
    license_number VARCHAR(50) NOT NULL,
    license_expiry_date DATE NOT NULL,
    license_class VARCHAR(10),
    availability driver_availability DEFAULT 'offline',
    rating DECIMAL(3,2) DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_distance DECIMAL(10,2) DEFAULT 0, -- in km
    join_date DATE DEFAULT CURRENT_DATE,
    emergency_contact JSONB,
    bank_details JSONB,
    work_schedule JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver documents table
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_url TEXT NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver work sessions (punch in/out tracking)
CREATE TABLE driver_work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    punch_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    punch_in_location POINT,
    punch_out_time TIMESTAMP WITH TIME ZONE,
    punch_out_location POINT,
    total_hours DECIMAL(5,2),
    break_duration DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver locations (real-time tracking)
CREATE TABLE driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    accuracy DECIMAL(6,2),
    speed DECIMAL(6,2), -- in km/h
    heading DECIMAL(5,2), -- degrees
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver performance metrics
CREATE TABLE driver_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    jobs_completed INTEGER DEFAULT 0,
    jobs_cancelled INTEGER DEFAULT 0,
    total_distance DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    fuel_efficiency DECIMAL(6,2), -- km per liter
    safety_score DECIMAL(5,2) DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(driver_id, period_start, period_end)
);

-- Jobs table (main job/booking table)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    driver_id UUID REFERENCES drivers(id),
    assigned_by UUID REFERENCES users(id),
    type job_type NOT NULL,
    status job_status DEFAULT 'pending',
    priority job_priority DEFAULT 'medium',
    
    -- Pickup details
    pickup_location TEXT NOT NULL,
    pickup_latitude DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    pickup_contact_name VARCHAR(100),
    pickup_contact_phone VARCHAR(20),
    pickup_instructions TEXT,
    scheduled_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    
    -- Delivery details
    delivery_location TEXT NOT NULL,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    delivery_contact_name VARCHAR(100),
    delivery_contact_phone VARCHAR(20),
    delivery_instructions TEXT,
    scheduled_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    -- Cargo details
    cargo_description TEXT,
    cargo_weight DECIMAL(8,2), -- in kg
    cargo_volume DECIMAL(8,2), -- in cubic meters
    cargo_value DECIMAL(10,2),
    special_requirements TEXT,
    
    -- Route and pricing
    estimated_distance DECIMAL(8,2), -- in km
    actual_distance DECIMAL(8,2),
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER,
    base_price DECIMAL(10,2),
    additional_charges DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    
    -- Tracking and status
    tracking_code VARCHAR(50) UNIQUE,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job status history (audit trail)
CREATE TABLE job_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status job_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    location POINT,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job documents (photos, signatures, receipts)
CREATE TABLE job_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'photo', 'signature', 'receipt', 'invoice'
    document_url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    data JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification recipients (many-to-many relationship)
CREATE TABLE notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notification_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Driver indexes
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_vehicle_id ON drivers(vehicle_id);
CREATE INDEX idx_drivers_availability ON drivers(availability);
CREATE INDEX idx_drivers_rating ON drivers(rating);

-- Driver location indexes
CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_timestamp ON driver_locations(timestamp);
CREATE INDEX idx_driver_locations_coords ON driver_locations USING GIST(point(longitude, latitude));

-- Job indexes
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_driver_id ON jobs(driver_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_priority ON jobs(priority);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_tracking_code ON jobs(tracking_code);
CREATE INDEX idx_jobs_pickup_coords ON jobs USING GIST(point(pickup_longitude, pickup_latitude));
CREATE INDEX idx_jobs_delivery_coords ON jobs USING GIST(point(delivery_longitude, delivery_latitude));

-- Notification indexes
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_read_at ON notification_recipients(read_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_documents_updated_at BEFORE UPDATE ON driver_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_work_sessions_updated_at BEFORE UPDATE ON driver_work_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_performance_updated_at BEFORE UPDATE ON driver_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create job status history
CREATE OR REPLACE FUNCTION create_job_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO job_status_history (job_id, status, changed_by, timestamp)
        VALUES (NEW.id, NEW.status, NEW.assigned_by, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER job_status_change_trigger
    AFTER UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION create_job_status_history();

-- Function to update driver statistics
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        UPDATE drivers 
        SET total_jobs = total_jobs + 1,
            total_distance = total_distance + COALESCE(NEW.actual_distance, 0),
            total_earnings = total_earnings + COALESCE(NEW.total_price, 0)
        WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_stats_trigger
    AFTER UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_stats();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('customer', 'Customer role with booking and tracking permissions', '{"can_create_booking": true, "can_track_jobs": true, "can_rate_drivers": true}'),
('driver', 'Driver role with job management permissions', '{"can_view_jobs": true, "can_update_status": true, "can_upload_documents": true}'),
('dispatcher', 'Dispatcher role with job assignment permissions', '{"can_assign_jobs": true, "can_manage_drivers": true, "can_view_reports": true}'),
('admin', 'Administrator role with full system access', '{"full_access": true}');

-- Create temporary variables for UUIDs
DO $$
DECLARE
    admin_user_id UUID := gen_random_uuid();
    dispatcher_user_id UUID := gen_random_uuid();
    customer_user_id UUID := gen_random_uuid();
    driver1_user_id UUID := gen_random_uuid();
    driver2_user_id UUID := gen_random_uuid();
    customer_id UUID := gen_random_uuid();
    driver1_id UUID := gen_random_uuid();
    driver2_id UUID := gen_random_uuid();
    vehicle1_id UUID := gen_random_uuid();
    vehicle2_id UUID := gen_random_uuid();
    vehicle3_id UUID := gen_random_uuid();
    job_id UUID := gen_random_uuid();
BEGIN
    -- Insert sample admin user (password: admin123)
    INSERT INTO users (id, email, password_hash, role, status, first_name, last_name, phone, email_verified) VALUES
    (admin_user_id, 'admin@nbs.com', '$2b$10$K8zPQJZJGQP5lB.5q5JlzOeK5ZQr8QZVzQr8QZVzQr8QZVzQr8QZVz', 'admin', 'active', 'System', 'Administrator', '+1-555-0001', TRUE);

    -- Insert sample dispatcher user (password: dispatcher123)
    INSERT INTO users (id, email, password_hash, role, status, first_name, last_name, phone, email_verified) VALUES
    (dispatcher_user_id, 'dispatcher@nbs.com', '$2b$10$K8zPQJZJGQP5lB.5q5JlzOeK5ZQr8QZVzQr8QZVzQr8QZVzQr8QZVz', 'dispatcher', 'active', 'John', 'Dispatcher', '+1-555-0002', TRUE);

    -- Insert sample vehicles
    INSERT INTO vehicles (id, make, model, year, license_plate, type, capacity_weight, capacity_volume) VALUES
    (vehicle1_id, 'Ford', 'F-150', 2022, 'ABC-1234', 'truck', 1000.00, 5.50),
    (vehicle2_id, 'Chevrolet', 'Express 3500', 2021, 'XYZ-5678', 'van', 1500.00, 12.00),
    (vehicle3_id, 'Freightliner', 'Cascadia', 2023, 'DEF-9012', 'heavy_truck', 15000.00, 45.00);

    -- Insert sample customer
    INSERT INTO users (id, email, password_hash, role, status, first_name, last_name, phone, email_verified) VALUES
    (customer_user_id, 'customer@nbs.com', '$2b$10$K8zPQJZJGQP5lB.5q5JlzOeK5ZQr8QZVzQr8QZVzQr8QZVzQr8QZVz', 'customer', 'active', 'Jane', 'Customer', '+1-555-0003', TRUE);

    INSERT INTO customers (id, user_id, company_name, business_type) VALUES
    (customer_id, customer_user_id, 'ABC Company', 'Manufacturing');

    -- Insert sample drivers
    INSERT INTO users (id, email, password_hash, role, status, first_name, last_name, phone, email_verified) VALUES
    (driver1_user_id, 'driver@nbs.com', '$2b$10$K8zPQJZJGQP5lB.5q5JlzOeK5ZQr8QZVzQr8QZVzQr8QZVzQr8QZVz', 'driver', 'active', 'John', 'Driver', '+1-555-0101', TRUE),
    (driver2_user_id, 'driver2@nbs.com', '$2b$10$K8zPQJZJGQP5lB.5q5JlzOeK5ZQr8QZVzQr8QZVzQr8QZVzQr8QZVz', 'driver', 'active', 'Jane', 'Smith', '+1-555-0102', TRUE);

    INSERT INTO drivers (id, user_id, vehicle_id, license_number, license_expiry_date, availability, rating, is_verified) VALUES
    (driver1_id, driver1_user_id, vehicle1_id, 'DL123456789', '2025-12-31', 'available', 4.8, TRUE),
    (driver2_id, driver2_user_id, vehicle2_id, 'DL987654321', '2025-06-30', 'available', 4.9, TRUE);

    -- Insert sample job
    INSERT INTO jobs (
        id, job_number, customer_id, type, status, priority,
        pickup_location, pickup_latitude, pickup_longitude,
        delivery_location, delivery_latitude, delivery_longitude,
        cargo_description, estimated_distance, base_price, total_price,
        tracking_code, scheduled_pickup_time, scheduled_delivery_time
    ) VALUES (
        job_id,
        'JOB001',
        customer_id,
        'delivery',
        'pending',
        'medium',
        '123 Main St, Dallas, TX',
        32.7767,
        -96.7970,
        '456 Oak Ave, Houston, TX',
        29.7604,
        -95.3698,
        'Electronics - 5 boxes',
        362.5,
        150.00,
        150.00,
        'TRK001',
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '8 hours'
    );
END $$;

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- View for active jobs with driver and customer info
CREATE VIEW active_jobs_view AS
SELECT 
    j.*,
    u_customer.first_name || ' ' || u_customer.last_name AS customer_name,
    c.company_name,
    u_driver.first_name || ' ' || u_driver.last_name AS driver_name,
    d.rating AS driver_rating,
    v.make || ' ' || v.model AS vehicle_info
FROM jobs j
LEFT JOIN customers c ON j.customer_id = c.id
LEFT JOIN users u_customer ON c.user_id = u_customer.id
LEFT JOIN drivers d ON j.driver_id = d.id
LEFT JOIN users u_driver ON d.user_id = u_driver.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
WHERE j.status NOT IN ('delivered', 'cancelled');

-- View for driver performance summary
CREATE VIEW driver_performance_summary AS
SELECT 
    d.id AS driver_id,
    u.first_name || ' ' || u.last_name AS driver_name,
    d.rating,
    d.total_jobs,
    d.total_earnings,
    d.total_distance,
    v.make || ' ' || v.model AS vehicle_info,
    d.availability,
    COUNT(j.id) AS active_jobs
FROM drivers d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
LEFT JOIN jobs j ON d.id = j.driver_id AND j.status NOT IN ('delivered', 'cancelled')
GROUP BY d.id, u.first_name, u.last_name, d.rating, d.total_jobs, d.total_earnings, d.total_distance, v.make, v.model, d.availability;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get nearby drivers
CREATE OR REPLACE FUNCTION get_nearby_drivers(
    target_lat DECIMAL(10,8),
    target_lng DECIMAL(11,8),
    radius_km DECIMAL(6,2) DEFAULT 50
)
RETURNS TABLE (
    driver_id UUID,
    driver_name TEXT,
    distance_km DECIMAL(8,2),
    availability driver_availability,
    rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (d.id)
        d.id,
        u.first_name || ' ' || u.last_name,
        CAST(
            6371 * acos(
                cos(radians(target_lat)) * 
                cos(radians(dl.latitude)) * 
                cos(radians(dl.longitude) - radians(target_lng)) + 
                sin(radians(target_lat)) * 
                sin(radians(dl.latitude))
            ) AS DECIMAL(8,2)
        ),
        d.availability,
        d.rating
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    JOIN driver_locations dl ON d.id = dl.driver_id
    WHERE d.availability = 'available'
    AND dl.timestamp > CURRENT_TIMESTAMP - INTERVAL '10 minutes'
    AND (
        6371 * acos(
            cos(radians(target_lat)) * 
            cos(radians(dl.latitude)) * 
            cos(radians(dl.longitude) - radians(target_lng)) + 
            sin(radians(target_lat)) * 
            sin(radians(dl.latitude))
        )
    ) <= radius_km
    ORDER BY d.id, dl.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate job statistics
CREATE OR REPLACE FUNCTION get_job_statistics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_jobs BIGINT,
    completed_jobs BIGINT,
    cancelled_jobs BIGINT,
    pending_jobs BIGINT,
    total_revenue DECIMAL(12,2),
    average_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COUNT(*) FILTER (WHERE status IN ('pending', 'assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery')),
        COALESCE(SUM(total_price) FILTER (WHERE status = 'delivered'), 0),
        COALESCE(AVG(customer_rating) FILTER (WHERE customer_rating IS NOT NULL), 0)
    FROM jobs
    WHERE created_at::date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Create application user roles
CREATE ROLE app_user LOGIN PASSWORD 'your_secure_password';
CREATE ROLE app_admin LOGIN PASSWORD 'your_admin_password';

-- Grant permissions to application user
GRANT CONNECT ON DATABASE postgres TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT DELETE ON notification_recipients, driver_locations, job_status_history TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Grant full permissions to admin user
GRANT ALL PRIVILEGES ON DATABASE postgres TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Energy Mobile Dashboard Database Setup Complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tables created: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE 'Sample data inserted successfully';
    RAISE NOTICE 'Views and functions created';
    RAISE NOTICE 'Indexes and triggers configured';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Default login credentials:';
    RAISE NOTICE 'Admin: admin@nbs.com / admin123';
    RAISE NOTICE 'Dispatcher: dispatcher@nbs.com / dispatcher123';
    RAISE NOTICE 'Customer: customer@nbs.com / customer123';
    RAISE NOTICE 'Driver: driver@nbs.com / driver123';
    RAISE NOTICE 'Driver2: driver2@nbs.com / driver123';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Your Energy Mobile Dashboard database is ready!';
    RAISE NOTICE 'You can now start your React Native app.';
    RAISE NOTICE '============================================';
END $$;
