-- Calendar Module - Database Tables Migration
-- Run this SQL script in your MySQL database to create required tables for calendar functionality
-- This migration creates holidays and updates leaves table if needed

USE crewnet;

-- ============================================
-- 1. HOLIDAYS TABLE
-- ============================================
-- Create holidays table if it doesn't exist
CREATE TABLE IF NOT EXISTS holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  holiday_name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_holiday_date (holiday_date),
  INDEX idx_year_month (YEAR(holiday_date), MONTH(holiday_date)),
  UNIQUE KEY unique_holiday_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. LEAVES TABLE - Add employee_id and status columns if missing
-- ============================================
-- Check and add employee_id column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'leaves';
SET @columnname = 'employee_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add status column if it doesn't exist
SET @columnname = 'status';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) DEFAULT ''pending'' AFTER leave_type')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key constraint for employee_id if it doesn't exist
-- Note: This will only work if the employees table exists
SET @fk_name = 'fk_leaves_employee_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fk_name)
      AND (constraint_type = 'FOREIGN KEY')
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fk_name, ' FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index on employee_id if it doesn't exist
SET @indexname = 'idx_leaves_employee_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (employee_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 3. SAMPLE DATA (Optional - Comment out if not needed)
-- ============================================

-- Sample holidays for 2026
-- INSERT INTO holidays (holiday_name, holiday_date) VALUES
-- ('New Year', '2026-01-01'),
-- ('Republic Day', '2026-01-26'),
-- ('Independence Day', '2026-08-15'),
-- ('Gandhi Jayanti', '2026-10-02'),
-- ('Christmas', '2026-12-25')
-- ON DUPLICATE KEY UPDATE holiday_name = VALUES(holiday_name);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify holidays table structure
DESCRIBE holidays;

-- Verify leaves table structure
DESCRIBE leaves;

-- Check if employee_id column exists in leaves table
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'crewnet'
  AND TABLE_NAME = 'leaves'
  AND COLUMN_NAME IN ('employee_id', 'status', 'from_date', 'to_date', 'leave_type');

