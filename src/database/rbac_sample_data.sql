-- ============================================
-- RBAC Sample Data Inserts
-- For HRMS Application - Roles, Menus, Submenus, and Mappings
-- ============================================

USE crewnet;

-- ============================================
-- 1. INSERT ROLES
-- ============================================
INSERT INTO roles (role_name, role_code, description, status, created_by) VALUES
('Super Admin', 'SUPER_ADMIN', 'Full system access with all permissions', 'Active', 1),
('HR Admin', 'HR_ADMIN', 'Human Resources administration access', 'Active', 1),
('Employee Self Service', 'ESS', 'Employee self-service portal access', 'Active', 1),
('Developer', 'DEVELOPER', 'Developer access for testing and development', 'Active', 1);

-- ============================================
-- 2. INSERT MENUS
-- ============================================
INSERT INTO menus (menu_name, menu_code, menu_icon, menu_path, display_order, status, created_by) VALUES
('Dashboard', 'DASHBOARD', 'fa-dashboard', '/dashboard', 1, 'Active', 1),
('Employees', 'EMPLOYEES', 'fa-users', '/employees', 2, 'Active', 1),
('Attendance', 'ATTENDANCE', 'fa-clock', '/attendance', 3, 'Active', 1),
('Leaves', 'LEAVES', 'fa-calendar-alt', '/leaves', 4, 'Active', 1),
('Calendar', 'CALENDAR', 'fa-calendar', '/calendar', 5, 'Active', 1),
('Reports', 'REPORTS', 'fa-chart-bar', '/reports', 6, 'Active', 1),
('Settings', 'SETTINGS', 'fa-cog', '/settings', 7, 'Active', 1),
('Role Management', 'ROLE_MANAGEMENT', 'fa-user-shield', '/role-management', 8, 'Active', 1);

-- ============================================
-- 3. INSERT SUB_MENUS (Activities)
-- ============================================

-- Dashboard Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Dashboard', 'DASHBOARD_VIEW', '/dashboard', 1, 'Active', 1
FROM menus WHERE menu_code = 'DASHBOARD';

-- Employees Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Employees', 'EMPLOYEES_VIEW', '/employees/list', 1, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEES'
UNION ALL
SELECT id, 'Add Employee', 'EMPLOYEES_ADD', '/employees/add', 2, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEES'
UNION ALL
SELECT id, 'Edit Employee', 'EMPLOYEES_EDIT', '/employees/edit', 3, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEES'
UNION ALL
SELECT id, 'Delete Employee', 'EMPLOYEES_DELETE', '/employees/delete', 4, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEES'
UNION ALL
SELECT id, 'Employee Onboarding', 'EMPLOYEES_ONBOARDING', '/employees/onboarding', 5, 'Active', 1
FROM menus WHERE menu_code = 'EMPLOYEES';

-- Attendance Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Attendance', 'ATTENDANCE_VIEW', '/attendance/list', 1, 'Active', 1
FROM menus WHERE menu_code = 'ATTENDANCE'
UNION ALL
SELECT id, 'Swipe In/Out', 'ATTENDANCE_SWIPE', '/attendance/swipe', 2, 'Active', 1
FROM menus WHERE menu_code = 'ATTENDANCE'
UNION ALL
SELECT id, 'Attendance Reports', 'ATTENDANCE_REPORTS', '/attendance/reports', 3, 'Active', 1
FROM menus WHERE menu_code = 'ATTENDANCE';

-- Leaves Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Leaves', 'LEAVES_VIEW', '/leaves/list', 1, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES'
UNION ALL
SELECT id, 'Apply Leave', 'LEAVES_APPLY', '/leaves/apply', 2, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES'
UNION ALL
SELECT id, 'Approve Leave', 'LEAVES_APPROVE', '/leaves/approve', 3, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES'
UNION ALL
SELECT id, 'Reject Leave', 'LEAVES_REJECT', '/leaves/reject', 4, 'Active', 1
FROM menus WHERE menu_code = 'LEAVES';

-- Calendar Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Calendar', 'CALENDAR_VIEW', '/calendar', 1, 'Active', 1
FROM menus WHERE menu_code = 'CALENDAR'
UNION ALL
SELECT id, 'Manage Holidays', 'CALENDAR_HOLIDAYS', '/calendar/holidays', 2, 'Active', 1
FROM menus WHERE menu_code = 'CALENDAR';

-- Reports Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Reports', 'REPORTS_VIEW', '/reports', 1, 'Active', 1
FROM menus WHERE menu_code = 'REPORTS'
UNION ALL
SELECT id, 'Export Reports', 'REPORTS_EXPORT', '/reports/export', 2, 'Active', 1
FROM menus WHERE menu_code = 'REPORTS';

-- Settings Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Settings', 'SETTINGS_VIEW', '/settings', 1, 'Active', 1
FROM menus WHERE menu_code = 'SETTINGS'
UNION ALL
SELECT id, 'Edit Settings', 'SETTINGS_EDIT', '/settings/edit', 2, 'Active', 1
FROM menus WHERE menu_code = 'SETTINGS';

-- Role Management Submenus
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Roles', 'ROLE_MANAGEMENT_VIEW', '/role-management/roles', 1, 'Active', 1
FROM menus WHERE menu_code = 'ROLE_MANAGEMENT'
UNION ALL
SELECT id, 'Manage Roles', 'ROLE_MANAGEMENT_MANAGE', '/role-management/manage', 2, 'Active', 1
FROM menus WHERE menu_code = 'ROLE_MANAGEMENT'
UNION ALL
SELECT id, 'Assign Menus', 'ROLE_MANAGEMENT_ASSIGN', '/role-management/assign', 3, 'Active', 1
FROM menus WHERE menu_code = 'ROLE_MANAGEMENT';

-- ============================================
-- 4. ROLE-MENU MAPPINGS
-- ============================================

-- Super Admin: All menus
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'SUPER_ADMIN';

-- HR Admin: Dashboard, Employees, Attendance, Leaves, Calendar, Reports
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'HR_ADMIN'
AND m.menu_code IN ('DASHBOARD', 'EMPLOYEES', 'ATTENDANCE', 'LEAVES', 'CALENDAR', 'REPORTS');

-- ESS: Dashboard, Attendance, Leaves, Calendar
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'ESS'
AND m.menu_code IN ('DASHBOARD', 'ATTENDANCE', 'LEAVES', 'CALENDAR');

-- Developer: All menus (for testing)
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r
CROSS JOIN menus m
WHERE r.role_code = 'DEVELOPER';

-- ============================================
-- 5. ROLE-SUBMENU MAPPINGS
-- ============================================

-- Super Admin: All submenus
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
CROSS JOIN sub_menus sm
WHERE r.role_code = 'SUPER_ADMIN';

-- HR Admin: All submenus for assigned menus
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
INNER JOIN role_menu_mapping rmm ON r.id = rmm.role_id
INNER JOIN sub_menus sm ON rmm.menu_id = sm.menu_id
WHERE r.role_code = 'HR_ADMIN';

-- ESS: Limited submenus
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
CROSS JOIN sub_menus sm
WHERE r.role_code = 'ESS'
AND sm.sub_menu_code IN (
  'DASHBOARD_VIEW',
  'ATTENDANCE_VIEW', 'ATTENDANCE_SWIPE',
  'LEAVES_VIEW', 'LEAVES_APPLY',
  'CALENDAR_VIEW'
);

-- Developer: All submenus (for testing)
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r
CROSS JOIN sub_menus sm
WHERE r.role_code = 'DEVELOPER';
