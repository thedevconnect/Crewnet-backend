import db from '../config/db.js';

class LeavesModel {
  // Create leave
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
}

export default LeavesModel;

