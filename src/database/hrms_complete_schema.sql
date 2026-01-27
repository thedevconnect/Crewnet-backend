-- ============================================
-- COMPLETE HRMS DATABASE SCHEMA
-- Production-ready schema for Attendance, Calendar, Dashboard, and RBAC
-- ============================================

USE crewnet;

-- ============================================
-- 1. EMPLOYEES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
  
  -- System Access (will be linked to roles table via RBAC)
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
  INDEX idx_mobile_number (mobile_number),
  INDEX idx_created_at (created_at),
  INDEX idx_department_status (department, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ATTENDANCE TABLE (Enhanced with IP, Device, Flags)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  emp_id BIGINT NOT NULL,
  attendance_date DATE NOT NULL,
  
  -- Swipe Times
  swipe_in_time DATETIME,
  swipe_out_time DATETIME,
  
  -- Location
  swipe_in_location VARCHAR(255) NULL,
  swipe_out_location VARCHAR(255) NULL,
  
  -- IP Address and Device Info
  ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
  device_info TEXT COMMENT 'Device/browser information',
  user_agent TEXT COMMENT 'Full user agent string',
  
  -- Flags
  late_entry BOOLEAN DEFAULT FALSE COMMENT 'True if swipe-in after expected time (e.g., 9:30 AM)',
  early_exit BOOLEAN DEFAULT FALSE COMMENT 'True if swipe-out before expected time (e.g., 6:00 PM)',
  
  -- Status
  status ENUM('IN', 'OUT') DEFAULT 'IN',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_emp_id (emp_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_status (status),
  INDEX idx_swipe_in_time (swipe_in_time),
  INDEX idx_swipe_out_time (swipe_out_time),
  INDEX idx_late_entry (late_entry),
  INDEX idx_early_exit (early_exit),
  INDEX idx_emp_date (emp_id, attendance_date),
  INDEX idx_date_status (attendance_date, status),
  INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. HOLIDAYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS holidays (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  holiday_name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_type ENUM('National', 'Regional', 'Company') DEFAULT 'National',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_holiday_date (holiday_date),
  INDEX idx_holiday_date (holiday_date),
  INDEX idx_year_month (YEAR(holiday_date), MONTH(holiday_date))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. LEAVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leaves (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL COMMENT 'CL, SL, PL, etc.',
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  reason TEXT,
  applied_by BIGINT COMMENT 'Employee who applied',
  approved_by BIGINT COMMENT 'Manager/HR who approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_from_date (from_date),
  INDEX idx_to_date (to_date),
  INDEX idx_leave_type (leave_type),
  INDEX idx_date_range (from_date, to_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. ROLES TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  INDEX idx_role_code (role_code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. MENUS TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS menus (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  menu_name VARCHAR(100) NOT NULL,
  menu_code VARCHAR(50) UNIQUE NOT NULL,
  menu_icon VARCHAR(100),
  menu_path VARCHAR(255),
  display_order INT DEFAULT 0,
  parent_menu_id BIGINT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  FOREIGN KEY (parent_menu_id) REFERENCES menus(id) ON DELETE SET NULL,
  INDEX idx_menu_code (menu_code),
  INDEX idx_status (status),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. SUB_MENUS TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS sub_menus (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  menu_id BIGINT NOT NULL,
  sub_menu_name VARCHAR(100) NOT NULL,
  sub_menu_code VARCHAR(50) NOT NULL,
  sub_menu_path VARCHAR(255),
  display_order INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  UNIQUE KEY unique_menu_submenu_code (menu_id, sub_menu_code),
  INDEX idx_menu_id (menu_id),
  INDEX idx_sub_menu_code (sub_menu_code),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. ROLE_MENU_MAPPING TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS role_menu_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT NOT NULL,
  menu_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_menu (role_id, menu_id),
  INDEX idx_role_id (role_id),
  INDEX idx_menu_id (menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. ROLE_SUBMENU_MAPPING TABLE (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS role_submenu_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT NOT NULL,
  submenu_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (submenu_id) REFERENCES sub_menus(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_submenu (role_id, submenu_id),
  INDEX idx_role_id (role_id),
  INDEX idx_submenu_id (submenu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. EMPLOYEE_ROLE_MAPPING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employee_role_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_role (employee_id, role_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
