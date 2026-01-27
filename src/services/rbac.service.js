import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import BaseService from './base.service.js';

/**
 * RBAC Service
 * Handles Role-Based Access Control operations
 */
class RbacService extends BaseService {
  constructor() {
    super('roles');
  }

  /**
   * Get all roles
   * @returns {Promise<Array>} Array of roles
   */
  async getAllRoles() {
    try {
      const sql = `
        SELECT 
          id,
          role_name,
          role_code,
          description,
          status,
          created_at,
          updated_at,
          created_by,
          updated_by
        FROM roles
        WHERE status = 'Active'
        ORDER BY id ASC
      `;
      const [rows] = await db.execute(sql);
      return rows;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch roles', false, error.stack);
    }
  }

  /**
   * Get menus and submenus by role ID
   * Returns hierarchical structure optimized for Angular sidebar
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Hierarchical menu structure
   */
  async getMenusByRoleId(roleId) {
    try {
      if (!roleId) {
        throw new ApiError(400, 'Role ID is required');
      }

      // Verify role exists using roleId column
      const [roles] = await db.execute(
        'SELECT * FROM roles WHERE roleId = ? AND status = "Active" LIMIT 1',
        [roleId]
      );
      if (roles.length === 0) {
        throw new ApiError(404, 'Role not found');
      }

      // Get all menus assigned to this role
      let menus = [];
      let submenus = [];
      
      try {
        const menusSql = `
          SELECT DISTINCT m.*
          FROM menus m
          INNER JOIN role_menu_mapping rmm ON (m.menuId = rmm.menuId OR m.id = rmm.menu_id)
          WHERE (rmm.roleId = ? OR rmm.role_id = ?) 
          AND (m.status = 'Active' OR m.is_active = 1)
          ORDER BY m.displayOrder ASC, m.display_order ASC, m.menuId ASC, m.id ASC
        `;
        [menus] = await db.execute(menusSql, [roleId, roleId]);
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log('⚠️ role_menu_mapping table does not exist');
        } else {
          throw error;
        }
      }

      // Get all submenus assigned to this role
      try {
        const submenusSql = `
          SELECT DISTINCT sm.*
          FROM sub_menus sm
          INNER JOIN role_submenu_mapping rsm ON (sm.subMenuId = rsm.subMenuId OR sm.id = rsm.submenu_id)
          WHERE (rsm.roleId = ? OR rsm.role_id = ?) 
          AND (sm.status = 'Active' OR sm.is_active = 1)
          ORDER BY sm.menuId ASC, sm.menu_id ASC, sm.displayOrder ASC, sm.display_order ASC
        `;
        [submenus] = await db.execute(submenusSql, [roleId, roleId]);
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log('⚠️ role_submenu_mapping table does not exist');
        } else {
          throw error;
        }
      }

      // Build hierarchical structure
      const menuMap = new Map();
      
      // First, create menu entries
      menus.forEach(menu => {
        const menuId = menu.menuId || menu.id || menu.menu_id;
        const menuName = menu.menuName || menu.menu_name || menu.MENU_NAME;
        const menuCode = menu.menuCode || menu.menu_code || menu.MENU_CODE;
        const menuIcon = menu.menuIcon || menu.menu_icon || menu.icon || '';
        const menuPath = menu.menuPath || menu.menu_path || menu.menu_url || '';
        const displayOrder = menu.displayOrder || menu.display_order || 0;
        const parentMenuId = menu.parentMenuId || menu.parent_menu_id || null;

        menuMap.set(menuId, {
          id: menuId,
          menuName: menuName,
          menuCode: menuCode,
          menuIcon: menuIcon,
          menuPath: menuPath,
          displayOrder: displayOrder,
          parentMenuId: parentMenuId,
          subMenus: []
        });
      });

      // Then, attach submenus to their parent menus
      submenus.forEach(submenu => {
        const submenuId = submenu.subMenuId || submenu.id || submenu.sub_menu_id;
        const menuId = submenu.menuId || submenu.menu_id;
        const subMenuName = submenu.subMenuName || submenu.sub_menu_name || submenu.SUB_MENU_NAME;
        const subMenuCode = submenu.subMenuCode || submenu.sub_menu_code || submenu.SUB_MENU_CODE;
        const subMenuPath = submenu.subMenuPath || submenu.sub_menu_path || submenu.sub_menu_url || '';
        const displayOrder = submenu.displayOrder || submenu.display_order || 0;

        const menu = menuMap.get(menuId);
        if (menu) {
          menu.subMenus.push({
            id: submenuId,
            subMenuName: subMenuName,
            subMenuCode: subMenuCode,
            subMenuPath: subMenuPath,
            displayOrder: displayOrder
          });
        }
      });

      // Convert map to array and sort by display order
      const menuArray = Array.from(menuMap.values())
        .sort((a, b) => a.displayOrder - b.displayOrder);

      // Build nested structure if parent_menu_id exists
      const finalMenus = [];
      const menuById = new Map(menuArray.map(m => [m.id, m]));

      menuArray.forEach(menu => {
        if (menu.parentMenuId) {
          const parent = menuById.get(menu.parentMenuId);
          if (parent) {
            if (!parent.subMenus) parent.subMenus = [];
            parent.subMenus.push(menu);
          } else {
            finalMenus.push(menu);
          }
        } else {
          finalMenus.push(menu);
        }
      });

      const roleData = roles[0];
      return {
        role: {
          id: roleData.roleId || roleData.id || roleData.role_id,
          roleName: roleData.roleName || roleData.role_name || roleData.ROLE_NAME,
          roleCode: roleData.roleCode || roleData.role_code || roleData.ROLE_CODE,
          description: roleData.roleDesc || roleData.description || roleData.DESCRIPTION || ''
        },
        menus: finalMenus
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch menus for role', false, error.stack);
    }
  }

  /**
   * Get menus by role code
   * @param {string} roleCode - Role code (e.g., 'SUPER_ADMIN', 'HR_ADMIN')
   * @returns {Promise<Object>} Hierarchical menu structure
   */
  async getMenusByRoleCode(roleCode) {
    try {
      if (!roleCode) {
        throw new ApiError(400, 'Role code is required');
      }

      // Get role by code
      const roleSql = `SELECT roleId FROM roles WHERE roleCode = ? AND status = 'Active'`;
      const [roles] = await db.execute(roleSql, [roleCode]);
      
      if (roles.length === 0) {
        throw new ApiError(404, 'Role not found');
      }

      return await this.getMenusByRoleId(roles[0].roleId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch menus for role', false, error.stack);
    }
  }

  /**
   * Get role by code
   * @param {string} roleCode - Role code
   * @returns {Promise<Object>} Role object
   */
  async getRoleByCode(roleCode) {
    try {
      const sql = `SELECT * FROM roles WHERE role_code = ? AND status = 'Active'`;
      const [rows] = await db.execute(sql, [roleCode]);
      return rows[0] || null;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch role', false, error.stack);
    }
  }
}

export default new RbacService();
