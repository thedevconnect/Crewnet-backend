import db from '../config/db.js';

class RoleMenuMappingModel {
  // Create or update permission mapping
  static async upsertPermission(data) {
    const { role_id, menu_id, sub_menu_id, can_view, can_add, can_edit, can_delete } = data;
    
    const [existing] = await db.execute(
      `SELECT id FROM role_menu_mapping 
       WHERE role_id = ? AND menu_id ${menu_id ? '= ?' : 'IS NULL'} 
       AND sub_menu_id ${sub_menu_id ? '= ?' : 'IS NULL'}`,
      menu_id && sub_menu_id ? [role_id, menu_id, sub_menu_id] :
      menu_id ? [role_id, menu_id] :
      [role_id]
    );

    if (existing.length > 0) {
      // Update existing
      const [result] = await db.execute(
        `UPDATE role_menu_mapping 
         SET can_view = ?, can_add = ?, can_edit = ?, can_delete = ?
         WHERE id = ?`,
        [
          can_view ? 1 : 0,
          can_add ? 1 : 0,
          can_edit ? 1 : 0,
          can_delete ? 1 : 0,
          existing[0].id
        ]
      );
      return { id: existing[0].id, ...data };
    } else {
      // Create new
      const [result] = await db.execute(
        `INSERT INTO role_menu_mapping 
         (role_id, menu_id, sub_menu_id, can_view, can_add, can_edit, can_delete) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          role_id,
          menu_id || null,
          sub_menu_id || null,
          can_view ? 1 : 0,
          can_add ? 1 : 0,
          can_edit ? 1 : 0,
          can_delete ? 1 : 0
        ]
      );
      return { id: result.insertId, ...data };
    }
  }

  // Get permissions for a role and menu/submenu
  static async getPermission(roleId, menuId, subMenuId = null) {
    const [rows] = await db.execute(
      `SELECT * FROM role_menu_mapping 
       WHERE role_id = ? AND menu_id ${menuId ? '= ?' : 'IS NULL'} 
       AND sub_menu_id ${subMenuId ? '= ?' : 'IS NULL'}`,
      subMenuId ? [roleId, menuId, subMenuId] :
      menuId ? [roleId, menuId] :
      [roleId]
    );
    return rows[0] || null;
  }

  // Get all permissions for a role
  static async getPermissionsByRoleId(roleId) {
    const [rows] = await db.execute(
      `SELECT * FROM role_menu_mapping WHERE role_id = ?`,
      [roleId]
    );
    return rows;
  }

  // Delete permission mapping
  static async deletePermission(roleId, menuId, subMenuId = null) {
    const [result] = await db.execute(
      `DELETE FROM role_menu_mapping 
       WHERE role_id = ? AND menu_id ${menuId ? '= ?' : 'IS NULL'} 
       AND sub_menu_id ${subMenuId ? '= ?' : 'IS NULL'}`,
      subMenuId ? [roleId, menuId, subMenuId] :
      menuId ? [roleId, menuId] :
      [roleId]
    );
    return result.affectedRows > 0;
  }

  // Bulk update permissions for a role
  static async bulkUpdatePermissions(roleId, permissions) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Delete existing permissions for this role
      await connection.execute(
        'DELETE FROM role_menu_mapping WHERE role_id = ?',
        [roleId]
      );

      // Insert new permissions
      if (permissions && permissions.length > 0) {
        const values = permissions.map(() => 
          '(?, ?, ?, ?, ?, ?, ?)'
        ).join(', ');
        const params = permissions.flatMap(p => [
          roleId,
          p.menu_id || null,
          p.sub_menu_id || null,
          p.can_view ? 1 : 0,
          p.can_add ? 1 : 0,
          p.can_edit ? 1 : 0,
          p.can_delete ? 1 : 0
        ]);

        await connection.execute(
          `INSERT INTO role_menu_mapping 
           (role_id, menu_id, sub_menu_id, can_view, can_add, can_edit, can_delete) 
           VALUES ${values}`,
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
}

export default RoleMenuMappingModel;

