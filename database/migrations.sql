-- =====================================================
-- Database Migration Scripts
-- =====================================================
-- Version: 1.0 to 1.1
-- Description: Sample migration for adding new features
-- =====================================================

-- Migration: Add vehicle maintenance tracking
-- Date: 2025-07-02
-- Version: 1.1

BEGIN;

-- Add new enum values
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'electric_truck';
ALTER TYPE job_type ADD VALUE IF NOT EXISTS 'maintenance';

-- Add maintenance table
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL, -- 'oil_change', 'inspection', 'repair', etc.
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    cost DECIMAL(8,2),
    notes TEXT,
    performed_by VARCHAR(100),
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add maintenance reminder preferences to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS maintenance_alert_km INTEGER DEFAULT 10000;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_maintenance_km INTEGER DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_km INTEGER DEFAULT 0;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle_id ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_scheduled_date ON vehicle_maintenance(scheduled_date);

-- Add trigger for maintenance table
CREATE TRIGGER update_vehicle_maintenance_updated_at BEFORE UPDATE ON vehicle_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample maintenance records
INSERT INTO vehicle_maintenance (vehicle_id, maintenance_type, scheduled_date, cost, notes) 
SELECT 
    id, 
    'inspection', 
    CURRENT_DATE + INTERVAL '30 days',
    150.00,
    'Annual safety inspection'
FROM vehicles 
WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_maintenance vm WHERE vm.vehicle_id = vehicles.id
);

COMMIT;

-- =====================================================
-- Migration: Add payment tracking
-- Date: 2025-07-02
-- Version: 1.2
-- =====================================================

BEGIN;

-- Create payment status enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment method enum
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'cash', 'corporate_account');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    late_fee DECIMAL(8,2) DEFAULT 0,
    discount DECIMAL(8,2) DEFAULT 0,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add payment reference to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Add trigger
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
