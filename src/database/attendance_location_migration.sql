-- Migration Script: Add Location Fields to Attendance Table
-- Run this SQL to add swipe_in_location and swipe_out_location columns

USE crewnet;

-- Add swipe_in_location column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS swipe_in_location VARCHAR(255) NULL AFTER swipe_in_time;

-- Add swipe_out_location column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS swipe_out_location VARCHAR(255) NULL AFTER swipe_out_time;

-- Add index on location for faster queries (optional)
ALTER TABLE attendance 
ADD INDEX IF NOT EXISTS idx_swipe_in_location (swipe_in_location);

-- Verify the columns are added
DESCRIBE attendance;

