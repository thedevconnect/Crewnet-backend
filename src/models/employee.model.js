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
    // Helper function - convert undefined/null/empty to null
    const toNull = (val) => (val === undefined || val === null || val === '') ? null : val;
    
    // Debug: Log received data
    console.log('EmployeeModel.create - Received data:', JSON.stringify(data, null, 2));
    
    // Extract and normalize all values - ensure no undefined
    let firstName = null;
    try {
      if (data.firstName !== undefined) firstName = toNull(data.firstName);
      else if (data.first_name !== undefined) firstName = toNull(data.first_name);
      else if (data.name !== undefined && data.name !== null && data.name !== '') {
        const parts = String(data.name).split(' ').filter(p => p);
        firstName = parts[0] || null;
      }
    } catch (e) {
      console.error('Error extracting firstName:', e);
      firstName = null;
    }
    if (firstName === undefined) firstName = null;
    
    let lastName = null;
    try {
      if (data.lastName !== undefined) lastName = toNull(data.lastName);
      else if (data.last_name !== undefined) lastName = toNull(data.last_name);
      else if (data.name !== undefined && data.name !== null && data.name !== '') {
        const parts = String(data.name).split(' ').filter(p => p);
        lastName = parts.slice(1).join(' ') || null;
      }
    } catch (e) {
      console.error('Error extracting lastName:', e);
      lastName = null;
    }
    if (lastName === undefined) lastName = null;
    
    let email = (data.email === undefined) ? null : toNull(data.email);
    let mobileNumber = (data.mobileNumber === undefined && data.mobile_number === undefined && data.phone === undefined) 
      ? null 
      : toNull(data.mobileNumber ?? data.mobile_number ?? data.phone);
    let department = (data.department === undefined) ? null : toNull(data.department);
    let status = (data.status === undefined) ? 'Active' : (toNull(data.status) || 'Active');
    let joiningDate = (data.joiningDate === undefined && data.joining_date === undefined) 
      ? null 
      : toNull(data.joiningDate ?? data.joining_date);
    
    // Ensure all are explicitly null if undefined
    if (email === undefined) email = null;
    if (mobileNumber === undefined) mobileNumber = null;
    if (department === undefined) department = null;
    if (status === undefined) status = 'Active';
    if (joiningDate === undefined) joiningDate = null;
    
    // Debug: Log extracted values
    console.log('EmployeeModel.create - Extracted values:', {
      firstName, lastName, email, mobileNumber, department, status, joiningDate
    });
    
    // Build params array - explicitly convert each to null if undefined
    const params = [
      firstName === undefined ? null : firstName,
      lastName === undefined ? null : lastName,
      email === undefined ? null : email,
      mobileNumber === undefined ? null : mobileNumber,
      department === undefined ? null : department,
      status === undefined ? null : status,
      joiningDate === undefined ? null : joiningDate
    ];
    
    // Final check - replace any remaining undefined with null
    for (let i = 0; i < params.length; i++) {
      if (params[i] === undefined) {
        console.warn(`Warning: params[${i}] is undefined, converting to null`);
        params[i] = null;
      }
    }
    
    // Debug: Log final params
    console.log('EmployeeModel.create - Final params:', params);
    console.log('EmployeeModel.create - Params has undefined?', params.some(p => p === undefined));
    
    // Check which table structure exists - try new structure first
    const sql = `INSERT INTO employees (first_name, last_name, email, mobile_number, department, status, joining_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    try {
      const [result] = await db.execute(sql, params);
      return this.findById(result.insertId);
    } catch (error) {
      // If new structure fails, try old structure
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        const oldSql = `INSERT INTO employees (name, email, phone, department, status, joiningDate) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        const fullName = (firstName && lastName) ? `${firstName} ${lastName}`.trim() : (firstName || lastName || null);
        const oldParams = [
          fullName === undefined ? null : fullName,
          email === undefined ? null : email,
          mobileNumber === undefined ? null : mobileNumber,
          department === undefined ? null : department,
          status === undefined ? null : status,
          joiningDate === undefined ? null : joiningDate
        ];
        
        // Final safety check
        for (let i = 0; i < oldParams.length; i++) {
          if (oldParams[i] === undefined) {
            oldParams[i] = null;
          }
        }
        
        console.log('EmployeeModel.create - Old structure params:', oldParams);
        const [result] = await db.execute(oldSql, oldParams);
        return this.findById(result.insertId);
      }
      throw error;
    }
  }

  // Update employee
  static async update(id, data) {
    // Helper function to ensure no undefined values
    const safeValue = (value) => (value === undefined ? null : value);
    
    // Support both old and new format
    const firstName = data.firstName !== undefined ? data.firstName : (data.first_name !== undefined ? data.first_name : (data.name ? data.name.split(' ')[0] : undefined));
    const lastName = data.lastName !== undefined ? data.lastName : (data.last_name !== undefined ? data.last_name : (data.name ? data.name.split(' ').slice(1).join(' ') : undefined));
    const email = data.email;
    const mobileNumber = data.mobileNumber !== undefined ? data.mobileNumber : (data.mobile_number !== undefined ? data.mobile_number : data.phone);
    const department = data.department;
    const status = data.status;
    const joiningDate = data.joiningDate !== undefined ? data.joiningDate : data.joining_date;
    
    // Build dynamic update query
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
    
    try {
      await db.execute(sql, params);
      return this.findById(id);
    } catch (error) {
      // Fallback to old structure if new structure fails
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        const oldUpdates = [];
        const oldParams = [];
        
        if (data.name !== undefined) {
          oldUpdates.push('name = ?');
          oldParams.push(safeValue(data.name));
        }
        if (email !== undefined) {
          oldUpdates.push('email = ?');
          oldParams.push(safeValue(email));
        }
        if (mobileNumber !== undefined) {
          oldUpdates.push('phone = ?');
          oldParams.push(safeValue(mobileNumber));
        }
        if (department !== undefined) {
          oldUpdates.push('department = ?');
          oldParams.push(safeValue(department));
        }
        if (status !== undefined) {
          oldUpdates.push('status = ?');
          oldParams.push(safeValue(status));
        }
        if (joiningDate !== undefined) {
          oldUpdates.push('joiningDate = ?');
          oldParams.push(safeValue(joiningDate));
        }
        
        oldUpdates.push('updatedAt = CURRENT_TIMESTAMP');
        oldParams.push(id);
        
        const oldSql = `UPDATE employees SET ${oldUpdates.join(', ')} WHERE id = ?`;
        await db.execute(oldSql, oldParams);
        return this.findById(id);
      }
      throw error;
    }
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

