-- ============================================
-- RBAC (Role-Based Access Control) Database Schema
-- For HRMS Application - Dynamic Menu & Permission System
-- ============================================

USE crewnet;

-- ============================================
-- 1. ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique code for role (e.g., SUPER_ADMIN, HR_ADMIN, ESS, DEVELOPER)',
  description TEXT,
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT 'Employee ID who created this role',
  updated_by BIGINT COMMENT 'Employee ID who last updated this role',
  
  -- Future-ready fields for activity tracking
  last_login_at TIMESTAMP NULL COMMENT 'Last login timestamp for this role (aggregated)',
  last_login_ip VARCHAR(45) COMMENT 'Last login IP address (IPv4 or IPv6)',
  
  INDEX idx_role_code (role_code),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_created_by (created_by),
  INDEX idx_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. MENUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menus (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  menu_name VARCHAR(100) NOT NULL,
  menu_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique code for menu (e.g., DASHBOARD, EMPLOYEES, ATTENDANCE)',
  menu_icon VARCHAR(100) COMMENT 'Icon class or name (e.g., fa-dashboard, material-icons)',
  menu_path VARCHAR(255) COMMENT 'Angular route path (e.g., /dashboard, /employees)',
  display_order INT DEFAULT 0 COMMENT 'Order in which menu appears in sidebar',
  parent_menu_id BIGINT NULL COMMENT 'Self-referencing for nested menus (NULL for top-level)',
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT 'Employee ID who created this menu',
  updated_by BIGINT COMMENT 'Employee ID who last updated this menu',
  
  FOREIGN KEY (parent_menu_id) REFERENCES menus(id) ON DELETE SET NULL,
  INDEX idx_menu_code (menu_code),
  INDEX idx_status (status),
  INDEX idx_display_order (display_order),
  INDEX idx_parent_menu_id (parent_menu_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. SUB_MENUS TABLE (Activities)
-- ============================================
CREATE TABLE IF NOT EXISTS sub_menus (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  menu_id BIGINT NOT NULL COMMENT 'Parent menu ID',
  sub_menu_name VARCHAR(100) NOT NULL,
  sub_menu_code VARCHAR(50) NOT NULL COMMENT 'Unique code for submenu/activity',
  sub_menu_path VARCHAR(255) COMMENT 'Angular route path (e.g., /employees/list, /employees/add)',
  display_order INT DEFAULT 0 COMMENT 'Order in which submenu appears',
  status ENUM('Active', 'Inactive') DEFAULT 'Active' NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT 'Employee ID who created this submenu',
  updated_by BIGINT COMMENT 'Employee ID who last updated this submenu',
  
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  UNIQUE KEY unique_menu_submenu_code (menu_id, sub_menu_code),
  INDEX idx_menu_id (menu_id),
  INDEX idx_sub_menu_code (sub_menu_code),
  INDEX idx_status (status),
  INDEX idx_display_order (display_order),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. ROLE_MENU_MAPPING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_menu_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT NOT NULL,
  menu_id BIGINT NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT 'Employee ID who assigned this menu to role',
  updated_by BIGINT COMMENT 'Employee ID who last updated this mapping',
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_menu (role_id, menu_id),
  INDEX idx_role_id (role_id),
  INDEX idx_menu_id (menu_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. ROLE_SUBMENU_MAPPING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_submenu_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT NOT NULL,
  submenu_id BIGINT NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT 'Employee ID who assigned this submenu to role',
  updated_by BIGINT COMMENT 'Employee ID who last updated this mapping',
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (submenu_id) REFERENCES sub_menus(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_submenu (role_id, submenu_id),
  INDEX idx_role_id (role_id),
  INDEX idx_submenu_id (submenu_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. USER_ACTIVITY_LOG TABLE (Future-ready)
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL COMMENT 'Employee ID or User ID',
  role_id BIGINT COMMENT 'Role ID at the time of activity',
  activity_type VARCHAR(50) NOT NULL COMMENT 'LOGIN, SWIPE_IN, SWIPE_OUT, MENU_ACCESS, etc.',
  activity_description TEXT,
  ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
  user_agent TEXT COMMENT 'Browser/client information',
  menu_id BIGINT COMMENT 'Menu accessed (if applicable)',
  submenu_id BIGINT COMMENT 'Submenu accessed (if applicable)',
  activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL,
  FOREIGN KEY (submenu_id) REFERENCES sub_menus(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_activity_timestamp (activity_timestamp),
  INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
