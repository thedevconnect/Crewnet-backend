import db from '../config/db.js';

class EmployeeModel {
  // Get all employees with pagination, search, and sorting
  static async findAll(query) {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = query;
    // Ensure numeric values for pagination to avoid placeholder issues with LIMIT/OFFSET
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const pageNum = Math.max(1, parseInt(page) || 1);
    const offset = (pageNum - 1) * limitNum;

    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    // Search by first_name, last_name, email, or employee_code
    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Sorting - map camelCase to snake_case for database
    const sortFieldMap = {
      'name': 'first_name',  // Map name to first_name
      'email': 'email',
      'department': 'department',
      'status': 'status',
      'joiningDate': 'joining_date',  // Map joiningDate to joining_date
      'createdAt': 'created_at'  // Map createdAt to created_at
    };
    // Use mapped field or original if mapping not found
    const dbSortField = sortFieldMap[sortBy] || (sortBy === 'created_at' ? 'created_at' : 'created_at');
    const allowedSortFields = ['name', 'email', 'department', 'status', 'joiningDate', 'createdAt', 'created_at', 'first_name', 'joining_date'];
    const sortField = allowedSortFields.includes(sortBy) ? (sortFieldMap[sortBy] || sortBy) : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${order}`;

    // Pagination
    // Note: Some MySQL versions are picky about placeholders in LIMIT/OFFSET
    // So we inline the safe, parsed numbers.
    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM employees WHERE 1=1';
    const countParams = [];
    if (search) {
      countSql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    const [countResult] = await db.execute(countSql, countParams);
    const total = countResult[0].total;

    return {
      employees: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  // Get employee by ID
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Create employee
  static async create(data) {
    const { name, email, phone, department, status, joiningDate } = data;
    const sql = `INSERT INTO employees (name, email, phone, department, status, joiningDate) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [name, email, phone, department, status, joiningDate]);
    return this.findById(result.insertId);
  }

  // Update employee
  static async update(id, data) {
    const { name, email, phone, department, status, joiningDate } = data;
    const sql = `UPDATE employees 
                 SET name = ?, email = ?, phone = ?, department = ?, status = ?, joiningDate = ?, updatedAt = CURRENT_TIMESTAMP
                 WHERE id = ?`;
    await db.execute(sql, [name, email, phone, department, status, joiningDate, id]);
    return this.findById(id);
  }

  // Delete employee (hard delete)
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Check if email exists
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
}

export default EmployeeModel;

