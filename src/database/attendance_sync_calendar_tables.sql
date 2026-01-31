-- ============================================
-- Attendance Sync Calendar - Table Schema
-- Run this in your MySQL database (e.g. crewnet)
-- ============================================
-- 1) attendance_punch: raw IN/OUT punches
-- 2) employee_attendance_daily: final daily record (synced from punches)
-- ============================================

USE crewnet;

-- ------------------------------------------------------
-- 1. attendance_punch (raw punch records)
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_punch (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  punch_time DATETIME NOT NULL,
  punch_type ENUM('IN', 'OUT') NOT NULL,
  attendance_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp_date (employee_id, attendance_date),
  INDEX idx_attendance_date (attendance_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------
-- 2. employee_attendance_daily (final daily record)
-- Unique per (employee_id, attendance_date) for UPSERT
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_attendance_daily (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  attendance_date DATE NOT NULL,
  day_name VARCHAR(20) NOT NULL,
  in_time TIME NULL,
  out_time TIME NULL,
  in_out_display VARCHAR(100) NULL,
  day_status VARCHAR(20) NOT NULL DEFAULT 'A',
  status_color VARCHAR(20) NULL,
  working_minutes INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_emp_date (employee_id, attendance_date),
  INDEX idx_emp_date (employee_id, attendance_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
