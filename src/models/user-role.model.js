import db from '../config/db.js';

class UserRoleModel {
  // Assign role to user
  static async assignRole(userId, roleId) {
    try {
      const [result] = await db.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roleId]
      );
      return { id: result.insertId, user_id: userId, role_id: roleId };
    } catch (error) {
      // Handle duplicate entry
      if (error.code === 'ER_DUP_ENTRY') {
        return null; // Already assigned
      }
      throw error;
    }
  }

  // Remove role from user
  static async removeRole(userId, roleId) {
    const [result] = await db.execute(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );
    return result.affectedRows > 0;
  }

  // Get all roles for a user
  static async getRolesByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT r.* FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return rows;
  }

  // Get all users for a role
  static async getUsersByRoleId(roleId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       WHERE ur.role_id = ?`,
      [roleId]
    );
    return rows;
  }

  // Replace all roles for a user (remove existing and assign new)
  static async replaceUserRoles(userId, roleIds) {
    // Start transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Remove all existing roles
      await connection.execute(
        'DELETE FROM user_roles WHERE user_id = ?',
        [userId]
      );

      // Assign new roles
      if (roleIds && roleIds.length > 0) {
        const values = roleIds.map(() => '(?, ?)').join(', ');
        const params = roleIds.flatMap(roleId => [userId, roleId]);
        await connection.execute(
          `INSERT INTO user_roles (user_id, role_id) VALUES ${values}`,
          params
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Check if user has role
  static async hasRole(userId, roleId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );
    return rows[0].count > 0;
  }
}

export default UserRoleModel;

