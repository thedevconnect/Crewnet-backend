-- Employee Management System - Employees Table
-- Run this SQL script in your MySQL database

USE crewnet;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(50) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  joiningDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT INTO employees (name, email, phone, department, status, joiningDate) VALUES
('John Doe', 'john.doe@example.com', '1234567890', 'Engineering', 'Active', '2024-01-15'),
('Jane Smith', 'jane.smith@example.com', '9876543210', 'Marketing', 'Active', '2024-02-20'),
('Bob Johnson', 'bob.johnson@example.com', '5555555555', 'Sales', 'Inactive', '2023-12-10');

