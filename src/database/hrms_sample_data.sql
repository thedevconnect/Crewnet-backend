-- ============================================
-- HRMS SAMPLE DATA
-- Sample data for testing Attendance, Calendar, Dashboard
-- ============================================

USE crewnet;

-- ============================================
-- 1. SAMPLE EMPLOYEES
-- ============================================
INSERT INTO employees (
  employee_code, first_name, last_name, email, mobile_number,
  department, designation, employment_type, joining_date,
  gender, date_of_birth, username, status, created_by
) VALUES
('EMP001', 'John', 'Doe', 'john.doe@example.com', '1234567890',
 'IT', 'Software Engineer', 'Full Time', '2025-01-01',
 'Male', '1990-01-01', 'johndoe', 'Active', 1),

('EMP002', 'Jane', 'Smith', 'jane.smith@example.com', '1234567891',
 'HR', 'HR Manager', 'Full Time', '2024-06-01',
 'Female', '1988-05-15', 'janesmith', 'Active', 1),

('EMP003', 'Bob', 'Johnson', 'bob.johnson@example.com', '1234567892',
 'IT', 'Senior Developer', 'Full Time', '2023-03-15',
 'Male', '1985-08-20', 'bobjohnson', 'Active', 1),

('EMP004', 'Alice', 'Williams', 'alice.williams@example.com', '1234567893',
 'Finance', 'Accountant', 'Full Time', '2024-09-01',
 'Female', '1992-11-10', 'alicewilliams', 'Active', 1);

-- ============================================
-- 2. ASSIGN ROLES TO EMPLOYEES
-- ============================================
-- Assign ESS role to EMP001
INSERT INTO employee_role_mapping (employee_id, role_id, created_by)
SELECT e.id, r.id, 1
FROM employees e, roles r
WHERE e.employee_code = 'EMP001' AND r.role_code = 'ESS';

-- Assign HR Admin role to EMP002
INSERT INTO employee_role_mapping (employee_id, role_id, created_by)
SELECT e.id, r.id, 1
FROM employees e, roles r
WHERE e.employee_code = 'EMP002' AND r.role_code = 'HR_ADMIN';

-- Assign ESS role to EMP003
INSERT INTO employee_role_mapping (employee_id, role_id, created_by)
SELECT e.id, r.id, 1
FROM employees e, roles r
WHERE e.employee_code = 'EMP003' AND r.role_code = 'ESS';

-- Assign ESS role to EMP004
INSERT INTO employee_role_mapping (employee_id, role_id, created_by)
SELECT e.id, r.id, 1
FROM employees e, roles r
WHERE e.employee_code = 'EMP004' AND r.role_code = 'ESS';

-- ============================================
-- 3. SAMPLE HOLIDAYS (January 2026)
-- ============================================
INSERT INTO holidays (holiday_name, holiday_date, holiday_type) VALUES
('New Year', '2026-01-01', 'National'),
('Republic Day', '2026-01-26', 'National');

-- ============================================
-- 4. SAMPLE LEAVES
-- ============================================
-- Leave for EMP001 (January 3-5, 2026)
INSERT INTO leaves (employee_id, from_date, to_date, leave_type, status, reason, applied_by)
SELECT id, '2026-01-03', '2026-01-05', 'CL', 'approved', 'Personal work', id
FROM employees WHERE employee_code = 'EMP001';

-- Leave for EMP003 (January 10, 2026)
INSERT INTO leaves (employee_id, from_date, to_date, leave_type, status, reason, applied_by)
SELECT id, '2026-01-10', '2026-01-10', 'SL', 'approved', 'Sick leave', id
FROM employees WHERE employee_code = 'EMP003';

-- ============================================
-- 5. SAMPLE ATTENDANCE RECORDS (January 2026)
-- ============================================
-- EMP001 - Present on Jan 2 (normal time)
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time, swipe_out_time,
  swipe_in_location, swipe_out_location, late_entry, early_exit, status
)
SELECT id, '2026-01-02', '2026-01-02 09:15:00', '2026-01-02 18:30:00',
       'Main Gate', 'Main Gate', FALSE, FALSE, 'OUT'
FROM employees WHERE employee_code = 'EMP001';

-- EMP001 - Present on Jan 6 (late entry)
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time, swipe_out_time,
  swipe_in_location, swipe_out_location, late_entry, early_exit, status
)
SELECT id, '2026-01-06', '2026-01-06 09:45:00', '2026-01-06 18:00:00',
       'Main Gate', 'Main Gate', TRUE, FALSE, 'OUT'
FROM employees WHERE employee_code = 'EMP001';

-- EMP002 - Present on Jan 2 (normal time)
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time, swipe_out_time,
  swipe_in_location, swipe_out_location, late_entry, early_exit, status
)
SELECT id, '2026-01-02', '2026-01-02 09:00:00', '2026-01-02 18:00:00',
       'Main Gate', 'Main Gate', FALSE, FALSE, 'OUT'
FROM employees WHERE employee_code = 'EMP002';

-- EMP003 - Present on Jan 2 (early exit)
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time, swipe_out_time,
  swipe_in_location, swipe_out_location, late_entry, early_exit, status
)
SELECT id, '2026-01-02', '2026-01-02 09:20:00', '2026-01-02 17:30:00',
       'Main Gate', 'Main Gate', FALSE, TRUE, 'OUT'
FROM employees WHERE employee_code = 'EMP003';

-- EMP004 - Present on Jan 2 (normal time)
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time, swipe_out_time,
  swipe_in_location, swipe_out_location, late_entry, early_exit, status
)
SELECT id, '2026-01-02', '2026-01-02 09:10:00', '2026-01-02 18:15:00',
       'Main Gate', 'Main Gate', FALSE, FALSE, 'OUT'
FROM employees WHERE employee_code = 'EMP004';

-- ============================================
-- 6. TODAY'S ATTENDANCE (for testing)
-- ============================================
-- Note: Update the date to today's date when running
-- EMP001 - Swiped in today (currently IN)
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time,
  swipe_in_location, ip_address, device_info, late_entry, status
)
SELECT id, CURDATE(), NOW(),
       'Main Gate', '192.168.1.100', 'Chrome on Windows', FALSE, 'IN'
FROM employees WHERE employee_code = 'EMP001'
ON DUPLICATE KEY UPDATE swipe_in_time = NOW();

-- EMP002 - Swiped in and out today
INSERT INTO attendance (
  emp_id, attendance_date, swipe_in_time, swipe_out_time,
  swipe_in_location, swipe_out_location, late_entry, early_exit, status
)
SELECT id, CURDATE(), DATE_SUB(NOW(), INTERVAL 9 HOUR), NOW(),
       'Main Gate', 'Main Gate', FALSE, FALSE, 'OUT'
FROM employees WHERE employee_code = 'EMP002'
ON DUPLICATE KEY UPDATE swipe_out_time = NOW(), status = 'OUT';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check employees
SELECT id, employee_code, first_name, last_name, department, status FROM employees;

-- Check employee roles
SELECT e.employee_code, r.role_name, r.role_code
FROM employee_role_mapping erm
JOIN employees e ON erm.employee_id = e.id
JOIN roles r ON erm.role_id = r.id;

-- Check today's attendance
SELECT 
  e.employee_code,
  e.first_name,
  a.attendance_date,
  a.swipe_in_time,
  a.swipe_out_time,
  a.late_entry,
  a.early_exit,
  a.status
FROM attendance a
JOIN employees e ON a.emp_id = e.id
WHERE a.attendance_date = CURDATE()
ORDER BY a.swipe_in_time DESC;

-- Check calendar data for EMP001 (January 2026)
SELECT 
  a.attendance_date,
  CASE 
    WHEN h.holiday_date IS NOT NULL THEN 'Holiday'
    WHEN l.from_date IS NOT NULL THEN 'Leave'
    WHEN DAYOFWEEK(a.attendance_date) IN (1,7) THEN 'Weekend'
    WHEN a.swipe_in_time IS NOT NULL THEN 'Present'
    ELSE 'Absent'
  END as status
FROM (
  SELECT DATE('2026-01-01') + INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY as attendance_date
  FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as a
  CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as b
  CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) as c
) as dates
LEFT JOIN attendance a ON dates.attendance_date = a.attendance_date AND a.emp_id = (SELECT id FROM employees WHERE employee_code = 'EMP001')
LEFT JOIN holidays h ON dates.attendance_date = h.holiday_date
LEFT JOIN leaves l ON dates.attendance_date BETWEEN l.from_date AND l.to_date AND l.employee_id = (SELECT id FROM employees WHERE employee_code = 'EMP001') AND l.status = 'approved'
WHERE dates.attendance_date BETWEEN '2026-01-01' AND '2026-01-31'
ORDER BY dates.attendance_date;
