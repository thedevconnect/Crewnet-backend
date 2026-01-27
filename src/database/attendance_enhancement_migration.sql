-- ============================================
-- ATTENDANCE TABLE ENHANCEMENT MIGRATION
-- Adds IP address, device info, late entry, early exit flags
-- ============================================

USE crewnet;

-- Add IP address column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) NULL COMMENT 'IPv4 or IPv6 address' AFTER swipe_out_location;

-- Add device info column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS device_info TEXT NULL COMMENT 'Device/browser information' AFTER ip_address;

-- Add user agent column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS user_agent TEXT NULL COMMENT 'Full user agent string' AFTER device_info;

-- Add late entry flag
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS late_entry BOOLEAN DEFAULT FALSE COMMENT 'True if swipe-in after expected time' AFTER user_agent;

-- Add early exit flag
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS early_exit BOOLEAN DEFAULT FALSE COMMENT 'True if swipe-out before expected time' AFTER late_entry;

-- Add indexes for performance
ALTER TABLE attendance 
ADD INDEX IF NOT EXISTS idx_late_entry (late_entry);

ALTER TABLE attendance 
ADD INDEX IF NOT EXISTS idx_early_exit (early_exit);

ALTER TABLE attendance 
ADD INDEX IF NOT EXISTS idx_ip_address (ip_address);

ALTER TABLE attendance 
ADD INDEX IF NOT EXISTS idx_emp_date (emp_id, attendance_date);

-- Verify changes
DESCRIBE attendance;
