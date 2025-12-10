-- ============================================
-- MySQL Database Setup with Stored Procedures & Cursors
-- ============================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS crewnet_cursor;
USE crewnet_cursor;

-- ============================================
-- 1. EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    join_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. EMP_BUFFER TABLE (Temporary buffer for cursor processing)
-- ============================================
CREATE TABLE IF NOT EXISTS emp_buffer (
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    join_date DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. STORED PROCEDURE: sp_add_employee_cur (CURSOR BASED)
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_add_employee_cur$$

CREATE PROCEDURE sp_add_employee_cur()
BEGIN
    -- Declare variables
    DECLARE v_full_name VARCHAR(100);
    DECLARE v_email VARCHAR(100);
    DECLARE v_mobile VARCHAR(20);
    DECLARE v_designation VARCHAR(100);
    DECLARE v_join_date DATE;
    DECLARE done INT DEFAULT FALSE;
    
    -- Declare cursor
    DECLARE emp_cursor CURSOR FOR 
        SELECT full_name, email, mobile, designation, join_date 
        FROM emp_buffer;
    
    -- Declare continue handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Open cursor
    OPEN emp_cursor;
    
    -- Loop through cursor
    read_loop: LOOP
        FETCH emp_cursor INTO v_full_name, v_email, v_mobile, v_designation, v_join_date;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert into employees table
        INSERT INTO employees (full_name, email, mobile, designation, join_date)
        VALUES (v_full_name, v_email, v_mobile, v_designation, v_join_date)
        ON DUPLICATE KEY UPDATE
            full_name = v_full_name,
            mobile = v_mobile,
            designation = v_designation,
            join_date = v_join_date;
    END LOOP;
    
    -- Close cursor
    CLOSE emp_cursor;
    
    -- Truncate buffer table
    TRUNCATE TABLE emp_buffer;
END$$

DELIMITER ;

-- ============================================
-- 4. STORED PROCEDURE: sp_employee_count
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_employee_count$$

CREATE PROCEDURE sp_employee_count()
BEGIN
    SELECT COUNT(*) as totalEmployees FROM employees;
END$$

DELIMITER ;

-- ============================================
-- 5. STORED PROCEDURE: sp_employee_list
-- ============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_employee_list$$

CREATE PROCEDURE sp_employee_list()
BEGIN
    SELECT 
        emp_id,
        full_name,
        email,
        mobile,
        designation,
        join_date,
        created_at
    FROM employees
    ORDER BY emp_id DESC;
END$$

DELIMITER ;

-- ============================================
-- Test Data (Optional)
-- ============================================
-- INSERT INTO emp_buffer (full_name, email, mobile, designation, join_date) VALUES
-- ('John Doe', 'john@example.com', '1234567890', 'Developer', '2024-01-15'),
-- ('Jane Smith', 'jane@example.com', '9876543210', 'Manager', '2024-02-20');

-- CALL sp_add_employee_cur();

