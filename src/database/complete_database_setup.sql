-- ============================================
-- COMPLETE DATABASE SETUP FOR CREWNET
-- Run this SQL script to create all tables
-- ============================================

CREATE DATABASE IF NOT EXISTS crewnet;
USE crewnet;

-- ============================================
-- 1. EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  employment_type ENUM('Full Time', 'Intern') NOT NULL,
  joining_date DATE NOT NULL,
  role ENUM('HRADMIN', 'ESS') NOT NULL,
  username VARCHAR(200) UNIQUE NOT NULL,
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  INDEX idx_employee_code (employee_code),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_mobile_number (mobile_number),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50),
  emp_id INT,
  role ENUM('HRADMIN', 'ESS') DEFAULT 'ESS',
  first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_employee_code (employee_code),
  INDEX idx_emp_id (emp_id),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  swipe_in_time DATETIME,
  swipe_out_time DATETIME,
  swipe_in_location VARCHAR(255) NULL,
  swipe_out_location VARCHAR(255) NULL,
  status ENUM('IN', 'OUT') DEFAULT 'IN',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emp_id (emp_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_status (status),
  INDEX idx_swipe_in_location (swipe_in_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. HOLIDAYS TABLE
-- ============================================
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
-- 5. LEAVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_from_date (from_date),
  INDEX idx_to_date (to_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. EMPLOYEE AUDIT LOG TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  employee_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSON,
  new_values JSON,
  changed_by BIGINT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. ATTENDANCE LOGS TABLE (Optional - for detailed logging)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  attendance_date DATE NOT NULL,
  swipe_time DATETIME,
  location VARCHAR(255),
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp_id (emp_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. EMPLOYEE LEAVES TABLE (Alternative/Additional leaves tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  days_count DECIMAL(5,2),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_from_date (from_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. HOLIDAYS MASTER TABLE (Master list of holidays)
-- ============================================
CREATE TABLE IF NOT EXISTS holidays_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  holiday_name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_type VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_holiday_date (holiday_date),
  INDEX idx_holiday_type (holiday_type),
  UNIQUE KEY unique_holiday_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. LEAVE TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leave_type_name VARCHAR(100) NOT NULL,
  leave_code VARCHAR(50) UNIQUE NOT NULL,
  max_days INT,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leave_code (leave_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_code (role_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. USER ROLES TABLE (Many-to-Many relationship)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. MENUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_name VARCHAR(100) NOT NULL,
  menu_code VARCHAR(50) UNIQUE NOT NULL,
  menu_url VARCHAR(255),
  icon VARCHAR(100),
  display_order INT DEFAULT 0,
  parent_menu_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_menu_id) REFERENCES menus(id) ON DELETE SET NULL,
  INDEX idx_menu_code (menu_code),
  INDEX idx_parent_menu_id (parent_menu_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. SUB MENUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sub_menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sub_menu_name VARCHAR(100) NOT NULL,
  sub_menu_code VARCHAR(50) UNIQUE NOT NULL,
  menu_id INT NOT NULL,
  sub_menu_url VARCHAR(255),
  icon VARCHAR(100),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  INDEX idx_sub_menu_code (sub_menu_code),
  INDEX idx_menu_id (menu_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. ROLE MENU MAPPING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_menu_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  menu_id INT,
  sub_menu_id INT,
  can_view BOOLEAN DEFAULT TRUE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE,
  INDEX idx_role_id (role_id),
  INDEX idx_menu_id (menu_id),
  INDEX idx_sub_menu_id (sub_menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. USER LOGIN SESSION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_login_session (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_token (session_token),
  INDEX idx_is_active (is_active),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA (Optional)
-- ============================================

-- Insert default roles
INSERT IGNORE INTO roles (role_name, role_code, description) VALUES
('HR Admin', 'HRADMIN', 'Human Resources Administrator'),
('Employee Self Service', 'ESS', 'Employee Self Service User');

-- Insert default leave types
INSERT IGNORE INTO leave_types (leave_type_name, leave_code, max_days) VALUES
('Casual Leave', 'CL', 12),
('Sick Leave', 'SL', 10),
('Earned Leave', 'EL', 15),
('Compensatory Off', 'CO', 5);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Database setup completed successfully!' as message;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'crewnet' ORDER BY TABLE_NAME;

