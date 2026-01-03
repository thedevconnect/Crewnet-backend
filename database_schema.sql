-- Database Schema for CrewNet Backend
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS crewnet;
USE crewnet;

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_joining DATE NOT NULL,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_employee_code (employee_code),
  INDEX idx_date_of_joining (date_of_joining)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ESS', 'HRADMIN') NOT NULL DEFAULT 'ESS',
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_employee_id (employee_id),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

