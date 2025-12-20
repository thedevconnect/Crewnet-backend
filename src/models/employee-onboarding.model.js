import db from '../config/db.js';

class EmployeeOnboardingModel {
  // Generate employee code: EMP{YYYYMMDD}{3-digit-sequence}
  static async generateEmployeeCode(joiningDate) {
    const dateStr = joiningDate.replace(/-/g, '').substring(0, 8); // YYYYMMDD
    const prefix = `EMP${dateStr}`;
    
    // Get count of employees created on same date
    const [result] = await db.execute(
      `SELECT COUNT(*) as count FROM employees WHERE employee_code LIKE ?`,
      [`${prefix}%`]
    );
    
    const sequence = (result[0].count + 1).toString().padStart(3, '0');
    return `${prefix}${sequence}`;
  }

  // Generate username from email
  static generateUsername(email) {
    return email.split('@')[0].toLowerCase();
  }

  // Get all employees with pagination, search, and filtering
  static async findAll(query) {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      status = '',
      department = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = query;

    const offset = (page - 1) * pageSize;

    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    // Search by name, email, or employee_code
    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Filter by status
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Filter by department
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    // Sorting
    const allowedSortFields = ['created_at', 'first_name', 'last_name', 'email', 'department', 'joining_date', 'employee_code'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${order}`;

    // Pagination - Use inline numbers to avoid MySQL placeholder issues
    const limitNum = Math.max(1, parseInt(pageSize) || 10);
    const offsetNum = parseInt(offset);
    sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const [rows] = await db.execute(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM employees WHERE 1=1';
    const countParams = [];

    if (search) {
      countSql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    if (department) {
      countSql += ' AND department = ?';
      countParams.push(department);
    }

    const [countResult] = await db.execute(countSql, countParams);
    const totalCount = countResult[0].total;

    return {
      employees: rows,
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };
  }

  // Get employee by ID
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Get employee by employee_code
  static async findByEmployeeCode(employeeCode) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE employee_code = ?', [employeeCode]);
    return rows[0] || null;
  }

  // Get employee by email
  static async findByEmail(email, excludeId = null) {
    let sql = 'SELECT * FROM employees WHERE email = ?';
    const params = [email];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
  }

  // Get employee by mobile number
  static async findByMobileNumber(mobileNumber, excludeId = null) {
    let sql = 'SELECT * FROM employees WHERE mobile_number = ?';
    const params = [mobileNumber];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
  }

  // Get employee by username
  static async findByUsername(username, excludeId = null) {
    let sql = 'SELECT * FROM employees WHERE username = ?';
    const params = [username];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
  }

  // Create employee
  static async create(data) {
    const {
      status = 'Active',
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      mobileNumber,
      department,
      designation,
      employmentType,
      joiningDate,
      role,
      firstLogin = true
    } = data;

    // Generate employee_code
    const employeeCode = await this.generateEmployeeCode(joiningDate);

    // Generate username from email
    let username = this.generateUsername(email);
    
    // Ensure username is unique
    let counter = 1;
    let finalUsername = username;
    while (await this.findByUsername(finalUsername)) {
      finalUsername = `${username}${counter}`;
      counter++;
    }

    const sql = `INSERT INTO employees (
      employee_code, status, first_name, last_name, gender, date_of_birth,
      email, mobile_number, department, designation, employment_type, joining_date,
      role, username, first_login
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.execute(sql, [
      employeeCode,
      status,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      mobileNumber,
      department,
      designation,
      employmentType,
      joiningDate,
      role,
      finalUsername,
      firstLogin
    ]);

    return this.findById(result.insertId);
  }

  // Update employee
  static async update(id, data) {
    const {
      status,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      mobileNumber,
      department,
      designation,
      employmentType,
      joiningDate,
      role,
      firstLogin
    } = data;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (firstName !== undefined) {
      updates.push('first_name = ?');
      params.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      params.push(lastName);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (dateOfBirth !== undefined) {
      updates.push('date_of_birth = ?');
      params.push(dateOfBirth);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
      // Update username if email changes
      let username = this.generateUsername(email);
      let counter = 1;
      let finalUsername = username;
      while (await this.findByUsername(finalUsername, id)) {
        finalUsername = `${username}${counter}`;
        counter++;
      }
      updates.push('username = ?');
      params.push(finalUsername);
    }
    if (mobileNumber !== undefined) {
      updates.push('mobile_number = ?');
      params.push(mobileNumber);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department);
    }
    if (designation !== undefined) {
      updates.push('designation = ?');
      params.push(designation);
    }
    if (employmentType !== undefined) {
      updates.push('employment_type = ?');
      params.push(employmentType);
    }
    if (joiningDate !== undefined) {
      updates.push('joining_date = ?');
      params.push(joiningDate);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (firstLogin !== undefined) {
      updates.push('first_login = ?');
      params.push(firstLogin);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE employees SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  // Delete employee (soft delete - set status to Inactive)
  static async delete(id) {
    const [result] = await db.execute(
      'UPDATE employees SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['Inactive', id]
    );
    return result.affectedRows > 0;
  }

  // Hard delete (if needed)
  static async hardDelete(id) {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default EmployeeOnboardingModel;

