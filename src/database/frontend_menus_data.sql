-- ============================================
-- FRONTEND MENUS DATA
-- Replace hardcoded Angular menus with dynamic API-based menus
-- ============================================

USE crewnet;

-- Clear existing menu data
DELETE FROM role_submenu_mapping;
DELETE FROM role_menu_mapping;
DELETE FROM sub_menus;
DELETE FROM menus;

-- ============================================
-- 1. INSERT MENUS (Based on Frontend Requirements)
-- ============================================
INSERT INTO menus (menu_name, menu_code, menu_icon, menu_path, display_order, status, created_by) VALUES
('Dashboard', 'DASHBOARD', 'pi-home', '/dashboard', 1, 'Active', 1),
('Employee Profile Setup', 'EMPLOYEE_PROFILE', 'pi-user', '/emp-profile-setup', 2, 'Active', 1),
('Employee Onboarding', 'EMPLOYEE_ONBOARDING', 'pi-users', '/HrEmployees', 3, 'Active', 1),
('Leaves', 'LEAVES', 'pi-calendar-minus', '/leaves', 4, 'Active', 1),
('Attendance', 'ATTENDANCE', 'pi-calendar', '/attendance', 5, 'Active', 1),
('Employee Calendar', 'EMPLOYEE_CALENDAR', 'pi-calendar-plus', '/employee-calendar', 6, 'Active', 1),
('Shifts', 'SHIFTS', 'pi-clock', '/shifts', 7, 'Active', 1),
('Departments', 'DEPARTMENTS', 'pi-building', '/departments', 8, 'Active', 1),
('Reports', 'REPORTS', 'pi-file', '/reports', 9, 'Active', 1),
('Settings', 'SETTINGS', 'pi-cog', '/settings', 10, 'Active', 1),
('Tickets', 'TICKETS', 'pi-ticket', '/tickets', 11, 'Active', 1),
('Holidays', 'HOLIDAYS', 'pi-calendar-times', '/holidays', 12, 'Active', 1),
('Logout', 'LOGOUT', 'pi-sign-out', '/logout', 13, 'Active', 1);

-- ============================================
-- 2. INSERT SUB_MENUS (Activities under each menu)
-- ============================================

-- Dashboard Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Dashboard', 'DASHBOARD_VIEW', '/dashboard', 1, 'Active', 1
FROM menus WHERE menu_code = 'DASHBOARD';

-- Employee Profile Setup Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'Setup Profile', 'PROFILE_SETUP', '/emp-profile-setup', 1, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEE_PROFILE'
UNION ALL
SELECT id, 'Update Profile', 'PROFILE_UPDATE', '/emp-profile-setup/update', 2, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEE_PROFILE';

-- Employee Onboarding Submenus (HR Admin only)
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Employees', 'EMPLOYEE_VIEW', '/HrEmployees', 1, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEE_ONBOARDING'
UNION ALL
SELECT id, 'Add Employee', 'EMPLOYEE_ADD', '/HrEmployees/add', 2, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEE_ONBOARDING'
UNION ALL
SELECT id, 'Edit Employee', 'EMPLOYEE_EDIT', '/HrEmployees/edit', 3, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEE_ONBOARDING';

-- Leaves Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Leaves', 'LEAVES_VIEW', '/leaves', 1, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES'
UNION ALL
SELECT id, 'Apply Leave', 'LEAVES_APPLY', '/leaves/apply', 2, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES'
UNION ALL
SELECT id, 'Approve Leaves', 'LEAVES_APPROVE', '/leaves/approve', 3, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES';

-- Attendance Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Attendance', 'ATTENDANCE_VIEW', '/attendance', 1, 'Active', 1
FROM menus WHERE menu_code = 'ATTENDANCE'
UNION ALL
SELECT id, 'Mark Attendance', 'ATTENDANCE_MARK', '/attendance/mark', 2, 'Active', 1
FROM menus WHERE menu_code = 'ATTENDANCE';

-- Employee Calendar Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Calendar', 'CALENDAR_VIEW', '/employee-calendar', 1, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEE_CALENDAR';

-- Shifts Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Shifts', 'SHIFTS_VIEW', '/shifts', 1, 'Active', 1
FROM menus WHERE menu_code = 'SHIFTS'
UNION ALL
SELECT id, 'Manage Shifts', 'SHIFTS_MANAGE', '/shifts/manage', 2, 'Active', 1
FROM menus WHERE menu_code = 'SHIFTS';

-- Departments Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Departments', 'DEPARTMENTS_VIEW', '/departments', 1, 'Active', 1
FROM menus WHERE menu_code = 'DEPARTMENTS'
UNION ALL
SELECT id, 'Manage Departments', 'DEPARTMENTS_MANAGE', '/departments/manage', 2, 'Active', 1
FROM menus WHERE menu_code = 'DEPARTMENTS';

-- Reports Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Reports', 'REPORTS_VIEW', '/reports', 1, 'Active', 1
FROM menus WHERE menu_code = 'REPORTS'
UNION ALL
SELECT id, 'Generate Reports', 'REPORTS_GENERATE', '/reports/generate', 2, 'Active', 1
FROM menus WHERE menu_code = 'REPORTS';

-- Settings Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Settings', 'SETTINGS_VIEW', '/settings', 1, 'Active', 1
FROM menus WHERE menu_code = 'SETTINGS'
UNION ALL
SELECT id, 'Update Settings', 'SETTINGS_UPDATE', '/settings/update', 2, 'Active', 1
FROM menus WHERE menu_code = 'SETTINGS';

-- Tickets Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Tickets', 'TICKETS_VIEW', '/tickets', 1, 'Active', 1
FROM menus WHERE menu_code = 'TICKETS'
UNION ALL
SELECT id, 'Create Ticket', 'TICKETS_CREATE', '/tickets/create', 2, 'Active', 1
FROM menus WHERE menu_code = 'TICKETS';

-- Holidays Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Holidays', 'HOLIDAYS_VIEW', '/holidays', 1, 'Active', 1
FROM menus WHERE menu_code = 'HOLIDAYS'
UNION ALL
SELECT id, 'Manage Holidays', 'HOLIDAYS_MANAGE', '/holidays/manage', 2, 'Active', 1
FROM menus WHERE menu_code = 'HOLIDAYS';

-- Logout (no submenus needed)
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'Logout', 'LOGOUT_ACTION', '/logout', 1, 'Active', 1
FROM menus WHERE menu_code = 'LOGOUT';

-- ============================================
-- 3. ESS ROLE MENU ASSIGNMENTS
-- ============================================
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'ESS'
AND m.menu_code IN (
  'DASHBOARD',
  'EMPLOYEE_PROFILE',
  'LEAVES',
  'ATTENDANCE', 
  'EMPLOYEE_CALENDAR',
  'SHIFTS',
  'DEPARTMENTS',
  'REPORTS',
  'SETTINGS',
  'TICKETS',
  'HOLIDAYS',
  'LOGOUT'
);

-- ============================================
-- 4. HR_ADMIN ROLE MENU ASSIGNMENTS
-- ============================================
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'HR_ADMIN'
AND m.menu_code IN (
  'DASHBOARD',
  'EMPLOYEE_ONBOARDING',
  'LEAVES',
  'ATTENDANCE',
  'SHIFTS',
  'DEPARTMENTS',
  'REPORTS',
  'SETTINGS',
  'TICKETS',
  'LOGOUT'
);

-- ============================================
-- 5. ESS SUBMENU ASSIGNMENTS
-- ============================================
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
INNER JOIN role_menu_mapping rmm ON r.id = rmm.role_id
INNER JOIN sub_menus sm ON rmm.menu_id = sm.menu_id
WHERE r.role_code = 'ESS';

-- ============================================
-- 6. HR_ADMIN SUBMENU ASSIGNMENTS  
-- ============================================
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
INNER JOIN role_menu_mapping rmm ON r.id = rmm.role_id
INNER JOIN sub_menus sm ON rmm.menu_id = sm.menu_id
WHERE r.role_code = 'HR_ADMIN';

-- ============================================
-- 7. SUPER_ADMIN gets all menus
-- ============================================
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'SUPER_ADMIN';

INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
CROSS JOIN sub_menus sm
WHERE r.role_code = 'SUPER_ADMIN';