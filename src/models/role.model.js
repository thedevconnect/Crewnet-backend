import db from '../config/db.js';

class RoleModel {
  // Find role by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find role by code
  static async findByCode(roleCode) {
    const [rows] = await db.execute(
      'SELECT * FROM roles WHERE role_code = ?',
      [roleCode]
    );
    return rows[0] || null;
  }

  // Get all roles
  static async findAll() {
    const [rows] = await db.execute(
      'SELECT * FROM roles ORDER BY display_order ASC, role_name ASC'
    );
    return rows;
  }

  // Create new role
  static async create(data) {
    const { role_code, role_name, is_superadmin = false, description } = data;
    const [result] = await db.execute(
      'INSERT INTO roles (role_code, role_name, is_superadmin, description) VALUES (?, ?, ?, ?)',
      [role_code, role_name, is_superadmin ? 1 : 0, description || null]
    );
    return this.findById(result.insertId);
  }

  // Update role
  static async update(id, data) {
    const { role_code, role_name, is_superadmin, description } = data;
    const updates = [];
    const params = [];

    if (role_code !== undefined) {
      updates.push('role_code = ?');
      params.push(role_code);
    }
    if (role_name !== undefined) {
      updates.push('role_name = ?');
      params.push(role_name);
    }
    if (is_superadmin !== undefined) {
      updates.push('is_superadmin = ?');
      params.push(is_superadmin ? 1 : 0);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.findById(id);
  }

  // Delete role
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM roles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get roles for a user
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT r.* FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows;
  }

  // Check if user is super admin
  static async isSuperAdmin(userId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ? AND r.is_superadmin = 1`,
      [userId]
    );
    return rows[0].count > 0;
  }
}

export default RoleModel;

