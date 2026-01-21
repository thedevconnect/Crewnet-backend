import db from '../config/db.js';

class MenuModel {
  // Find menu by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM menus WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Get all menus with submenus (tolerant if is_active/display_order columns are missing)
  static async findAll(includeInactive = false) {
    const baseQuery = `SELECT m.* FROM menus m ORDER BY m.display_order ASC, m.label ASC`;
    try {
      // Try with is_active filter if requested
      const query = includeInactive
        ? baseQuery
        : `SELECT m.* FROM menus m WHERE m.is_active = 1 ORDER BY m.display_order ASC, m.label ASC`;
      const [rows] = await db.execute(query);
      for (const menu of rows) {
        const subMenus = await this.findSubMenusByMenuId(menu.id);
        menu.submenus = subMenus;
      }
      return rows;
    } catch (error) {
      if (error.message && (error.message.includes("is_active") || error.message.includes("display_order"))) {
        // Fallback when columns don't exist; order by label only
        const [rows] = await db.execute(`SELECT m.* FROM menus m ORDER BY m.label ASC`);
        for (const menu of rows) {
          const subMenus = await this.findSubMenusByMenuId(menu.id, true);
          menu.submenus = subMenus;
        }
        return rows;
      }
      throw error;
    }
  }

  // Get all active menus
  static async findAllActive() {
    return this.findAll(false);
  }

  // Create new menu
  static async create(data) {
    const { label, icon, route, display_order = 0, is_active = true } = data;
    const [result] = await db.execute(
      'INSERT INTO menus (label, icon, route, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [label, icon || null, route || null, display_order, is_active ? 1 : 0]
    );
    return this.findById(result.insertId);
  }

  // Update menu
  static async update(id, data) {
    const { label, icon, route, display_order, is_active } = data;
    const updates = [];
    const params = [];

    if (label !== undefined) {
      updates.push('label = ?');
      params.push(label);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      params.push(icon);
    }
    if (route !== undefined) {
      updates.push('route = ?');
      params.push(route);
    }
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE menus SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.findById(id);
  }

  // Delete menu
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM menus WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Sub Menu Methods
  static async findSubMenuById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM sub_menus WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findSubMenusByMenuId(menuId, skipActiveFilter = false) {
    const query = skipActiveFilter
      ? 'SELECT * FROM sub_menus WHERE menu_id = ? ORDER BY display_order ASC, label ASC'
      : 'SELECT * FROM sub_menus WHERE menu_id = ? AND is_active = 1 ORDER BY display_order ASC, label ASC';
    try {
      const [rows] = await db.execute(query, [menuId]);
      return rows;
    } catch (error) {
      if (error.message && (error.message.includes("is_active") || error.message.includes("display_order"))) {
        const [rows] = await db.execute(
          'SELECT * FROM sub_menus WHERE menu_id = ? ORDER BY label ASC',
          [menuId]
        );
        return rows;
      }
      throw error;
    }
  }

  static async createSubMenu(data) {
    const { menu_id, label, route, display_order = 0, is_active = true } = data;
    const [result] = await db.execute(
      'INSERT INTO sub_menus (menu_id, label, route, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [menu_id, label, route || null, display_order, is_active ? 1 : 0]
    );
    return this.findSubMenuById(result.insertId);
  }

  static async updateSubMenu(id, data) {
    const { label, route, display_order, is_active } = data;
    const updates = [];
    const params = [];

    if (label !== undefined) {
      updates.push('label = ?');
      params.push(label);
    }
    if (route !== undefined) {
      updates.push('route = ?');
      params.push(route);
    }
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findSubMenuById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE sub_menus SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.findSubMenuById(id);
  }

  static async deleteSubMenu(id) {
    const [result] = await db.execute('DELETE FROM sub_menus WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get menus with permissions for a role
  static async findMenusByRoleId(roleId) {
    const [rows] = await db.execute(
      `SELECT m.*, 
              rmm.can_view, rmm.can_add, rmm.can_edit, rmm.can_delete
       FROM menus m
       LEFT JOIN role_menu_mapping rmm ON m.id = rmm.menu_id AND rmm.role_id = ? AND rmm.sub_menu_id IS NULL
       WHERE m.is_active = 1
       ORDER BY m.display_order ASC`,
      [roleId]
    );
    return rows;
  }

  // Get submenus with permissions for a role
  static async findSubMenusByRoleId(roleId, menuId) {
    const [rows] = await db.execute(
      `SELECT sm.*, 
              rmm.can_view, rmm.can_add, rmm.can_edit, rmm.can_delete
       FROM sub_menus sm
       LEFT JOIN role_menu_mapping rmm ON sm.id = rmm.sub_menu_id AND rmm.role_id = ? AND rmm.menu_id = ?
       WHERE sm.menu_id = ? AND sm.is_active = 1
       ORDER BY sm.display_order ASC`,
      [roleId, menuId, menuId]
    );
    return rows;
  }
}

export default MenuModel;

