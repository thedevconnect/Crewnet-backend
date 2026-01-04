-- Migration Script: Allow Multiple Swipe In/Out Per Day
-- Run this SQL to remove UNIQUE constraint and allow multiple records per day

USE crewnet;

-- Remove UNIQUE constraint to allow multiple swipe in/out per day
ALTER TABLE attendance DROP INDEX IF EXISTS unique_emp_date;

-- Verify the constraint is removed
SHOW INDEXES FROM attendance WHERE Key_name = 'unique_emp_date';

-- Note: After running this, employees can have multiple swipe in/out records per day
-- Each swipe in creates a new record
-- Each swipe out updates the latest IN record without swipe_out_time

