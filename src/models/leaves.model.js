import db from '../config/db.js';

class LeavesModel {
  static async findAll(query) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = query;
      const limitNum = Math.max(1, parseInt(limit) || 10);
      const pageNum = Math.max(1, parseInt(page) || 1);
      const offset = (pageNum - 1) * limitNum;

      let sql = 'SELECT * FROM leaves WHERE 1=1';
      const params = [];

      if (search) {
        sql += ' AND (leave_type LIKE ? OR reason LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const allowedSortFields = ['created_at', 'from_date', 'to_date', 'leave_type'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${sortField} ${order}`;
      sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

      const [rows] = await db.execute(sql, params);

      let countSql = 'SELECT COUNT(*) as total FROM leaves WHERE 1=1';
      const countParams = [];
      if (search) {
        countSql += ' AND (leave_type LIKE ? OR reason LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }
      const [countResult] = await db.execute(countSql, countParams);
      const total = countResult[0]?.total || 0;

      return {
        leaves: rows || [],
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 0
        }
      };
    } catch (error) {
      console.error('LeavesModel.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM leaves WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `INSERT INTO leaves (from_date, to_date, session_from, session_to, leave_type, reason, cc_to) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      data.from_date,
      data.to_date,
      data.session_from,
      data.session_to,
      data.leave_type,
      data.reason,
      data.cc_to || null
    ];

    const [result] = await db.execute(sql, params);
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.from_date !== undefined) {
      updates.push('from_date = ?');
      params.push(data.from_date);
    }
    if (data.to_date !== undefined) {
      updates.push('to_date = ?');
      params.push(data.to_date);
    }
    if (data.session_from !== undefined) {
      updates.push('session_from = ?');
      params.push(data.session_from);
    }
    if (data.session_to !== undefined) {
      updates.push('session_to = ?');
      params.push(data.session_to);
    }
    if (data.leave_type !== undefined) {
      updates.push('leave_type = ?');
      params.push(data.leave_type);
    }
    if (data.reason !== undefined) {
      updates.push('reason = ?');
      params.push(data.reason);
    }
    if (data.cc_to !== undefined) {
      updates.push('cc_to = ?');
      params.push(data.cc_to);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const sql = `UPDATE leaves SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM leaves WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default LeavesModel;
