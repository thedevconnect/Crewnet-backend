-- Employee Onboarding - Database Schema
-- Run this SQL in your MySQL database

USE crewnet;

-- Drop existing employees table if you want fresh start (CAUTION: This will delete all data)
-- DROP TABLE IF EXISTS employee_audit_log;
-- DROP TABLE IF EXISTS employees;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
    
    -- Personal Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    date_of_birth DATE NOT NULL,
    
    -- Contact Details
    email VARCHAR(200) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    
    -- Job Details
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    employment_type ENUM('Full Time', 'Intern') NOT NULL,
    joining_date DATE NOT NULL,
    
    -- System Access
    role ENUM('HRADMIN', 'ESS') NOT NULL,
    username VARCHAR(200) UNIQUE NOT NULL,
    first_login BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    
    INDEX idx_employee_code (employee_code),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_mobile_number (mobile_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create employee_audit_log table (Optional - for tracking changes)
CREATE TABLE IF NOT EXISTS employee_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_values JSON,
    new_values JSON,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

