-- Attendance Management System - Attendance Table
-- Run this SQL script in your MySQL database

USE crewnet;

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  swipe_in_time DATETIME,
  swipe_out_time DATETIME,
  status ENUM('IN', 'OUT') DEFAULT 'IN',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emp_id (emp_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_status (status),
  UNIQUE KEY unique_emp_date (emp_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

