import db from '../config/db.js';

class EmployeeModel {
  static async findAll(query) {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const pageNum = Math.max(1, parseInt(page) || 1);
    const offset = (pageNum - 1) * limitNum;

    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const sortFieldMap = {
      'name': 'first_name',
      'email': 'email',
      'department': 'department',
      'status': 'status',
      'joiningDate': 'joining_date',
      'createdAt': 'created_at'
    };
    const allowedSortFields = ['name', 'email', 'department', 'status', 'joiningDate', 'createdAt', 'created_at', 'first_name', 'joining_date'];
    const sortField = allowedSortFields.includes(sortBy) ? (sortFieldMap[sortBy] || sortBy) : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${order}`;
    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await db.execute(sql, params);

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

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const toNull = (val) => (val === undefined || val === null || val === '') ? null : val;
    
    const firstName = toNull(data.firstName || data.first_name || null);
    const lastName = toNull(data.lastName || data.last_name || null);
    const email = toNull(data.email);
    const mobileNumber = toNull(data.mobileNumber || data.mobile_number || data.phone);
    const department = toNull(data.department);
    const status = toNull(data.status) || 'Active';
    const joiningDate = toNull(data.joiningDate || data.joining_date);

    const sql = `INSERT INTO employees (first_name, last_name, email, mobile_number, department, status, joining_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [firstName, lastName, email, mobileNumber, department, status, joiningDate];
    const [result] = await db.execute(sql, params);
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const safeValue = (value) => (value === undefined ? null : value);
    
    const firstName = data.firstName || data.first_name;
    const lastName = data.lastName || data.last_name;
    const email = data.email;
    const mobileNumber = data.mobileNumber || data.mobile_number || data.phone;
    const department = data.department;
    const status = data.status;
    const joiningDate = data.joiningDate || data.joining_date;

    const updates = [];
    const params = [];

    if (firstName !== undefined) {
      updates.push('first_name = ?');
      params.push(safeValue(firstName));
    }
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      params.push(safeValue(lastName));
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(safeValue(email));
    }
    if (mobileNumber !== undefined) {
      updates.push('mobile_number = ?');
      params.push(safeValue(mobileNumber));
    }
    if (department !== undefined) {
      updates.push('department = ?');
      params.push(safeValue(department));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(safeValue(status));
    }
    if (joiningDate !== undefined) {
      updates.push('joining_date = ?');
      params.push(safeValue(joiningDate));
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

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
