import db from '../config/db.js';

class EmployeeModel {
  // Get all employees with pagination, search, and sorting
  static async findAll(query) {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    // Search by name or email
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sorting
    const allowedSortFields = ['name', 'email', 'department', 'status', 'joiningDate', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${order}`;

    // Pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM employees WHERE 1=1';
    const countParams = [];
    if (search) {
      countSql += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [countResult] = await db.execute(countSql, countParams);
    const total = countResult[0].total;

    return {
      employees: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
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

