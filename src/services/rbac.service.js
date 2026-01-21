import MenuModel from '../models/menu.model.js';
import RoleModel from '../models/role.model.js';
import RoleMenuMappingModel from '../models/role-menu-mapping.model.js';
import ApiError from '../utils/ApiError.js';
import db from '../config/db.js';

class RBACService {
  // Get menus for a user (with permissions)
  async getMenusByUser(userId, isSuperAdmin) {
    try {
      if (isSuperAdmin) {
        // SuperAdmin gets all menus and submenus with full permissions
        const menus = await MenuModel.findAllActive();
        return this.formatMenusForFrontend(menus, true);
      }

      // Get user roles
      const roles = await RoleModel.findByUserId(userId);
      if (roles.length === 0) {
        return []; // No roles = no menus
      }

      const roleIds = roles.map(r => r.id);

      // Get all menus with permissions from all roles
      const [menuRows] = await db.execute(
        `SELECT DISTINCT m.*, 
                MAX(CASE WHEN rmm.can_view = 1 THEN 1 ELSE 0 END) as can_view,
                MAX(CASE WHEN rmm.can_add = 1 THEN 1 ELSE 0 END) as can_add,
                MAX(CASE WHEN rmm.can_edit = 1 THEN 1 ELSE 0 END) as can_edit,
                MAX(CASE WHEN rmm.can_delete = 1 THEN 1 ELSE 0 END) as can_delete
         FROM menus m
         LEFT JOIN role_menu_mapping rmm ON m.id = rmm.menu_id AND rmm.role_id IN (${roleIds.map(() => '?').join(',')}) AND rmm.sub_menu_id IS NULL
         GROUP BY m.id
         HAVING can_view = 1
         ORDER BY m.display_order ASC, m.label ASC`,
        roleIds
      );

      // Get submenus with permissions
      const [subMenuRows] = await db.execute(
        `SELECT DISTINCT sm.*, sm.menu_id,
                MAX(CASE WHEN rmm.can_view = 1 THEN 1 ELSE 0 END) as can_view,
                MAX(CASE WHEN rmm.can_add = 1 THEN 1 ELSE 0 END) as can_add,
                MAX(CASE WHEN rmm.can_edit = 1 THEN 1 ELSE 0 END) as can_edit,
                MAX(CASE WHEN rmm.can_delete = 1 THEN 1 ELSE 0 END) as can_delete
         FROM sub_menus sm
         LEFT JOIN role_menu_mapping rmm ON sm.id = rmm.sub_menu_id AND rmm.role_id IN (${roleIds.map(() => '?').join(',')})
         GROUP BY sm.id
         HAVING can_view = 1
         ORDER BY sm.display_order ASC, sm.label ASC`,
        roleIds
      );

      // Group submenus by menu_id
      const subMenusByMenu = {};
      subMenuRows.forEach(subMenu => {
        if (!subMenusByMenu[subMenu.menu_id]) {
          subMenusByMenu[subMenu.menu_id] = [];
        }
        subMenusByMenu[subMenu.menu_id].push({
          id: subMenu.id,
          label: subMenu.label,
          route: subMenu.route,
          permissions: {
            can_view: subMenu.can_view === 1,
            can_add: subMenu.can_add === 1,
            can_edit: subMenu.can_edit === 1,
            can_delete: subMenu.can_delete === 1
          }
        });
      });

      // Format menus with submenus
      return menuRows.map(menu => ({
        id: menu.id,
        label: menu.label,
        icon: menu.icon,
        route: menu.route,
        permissions: {
          can_view: menu.can_view === 1,
          can_add: menu.can_add === 1,
          can_edit: menu.can_edit === 1,
          can_delete: menu.can_delete === 1
        },
        children: subMenusByMenu[menu.id] || []
      }));
    } catch (error) {
      // If RBAC tables don't exist yet, return empty array for graceful degradation
      if (error.message && (error.message.includes("doesn't exist") || error.message.includes("Unknown table"))) {
        console.warn('[RBAC] Tables not found, returning empty menus:', error.message);
        return [];
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Format menus for frontend (SuperAdmin case)
  formatMenusForFrontend(menus, isSuperAdmin = false) {
    return menus.map(menu => {
      const menuObj = {
        id: menu.id,
        label: menu.label,
        icon: menu.icon,
        route: menu.route,
        permissions: isSuperAdmin ? {
          can_view: true,
          can_add: true,
          can_edit: true,
          can_delete: true
        } : {
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false
        },
        children: []
      };

      // Handle submenus array
      if (menu.submenus && Array.isArray(menu.submenus) && menu.submenus.length > 0) {
        menuObj.children = menu.submenus
          .filter(sm => sm && sm.is_active !== 0 && sm.is_active !== false)
          .map(sm => ({
            id: sm.id,
            label: sm.label,
            route: sm.route,
            permissions: isSuperAdmin ? {
              can_view: true,
              can_add: true,
              can_edit: true,
              can_delete: true
            } : {
              can_view: false,
              can_add: false,
              can_edit: false,
              can_delete: false
            }
          }));
      }

      return menuObj;
    });
  }

  // Role Management
  async createRole(data) {
    const { role_code, role_name, is_superadmin = false, description } = data;

    if (!role_code || !role_name) {
      throw new ApiError(400, 'role_code and role_name are required');
    }

    // Check if role_code already exists
    const existing = await RoleModel.findByCode(role_code);
    if (existing) {
      throw new ApiError(400, 'Role code already exists');
    }

    return await RoleModel.create({ role_code, role_name, is_superadmin, description });
  }

  async updateRole(id, data) {
    const role = await RoleModel.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // Check if role_code is being changed and already exists
    if (data.role_code && data.role_code !== role.role_code) {
      const existing = await RoleModel.findByCode(data.role_code);
      if (existing) {
        throw new ApiError(400, 'Role code already exists');
      }
    }

    return await RoleModel.update(id, data);
  }

  async deleteRole(id) {
    const role = await RoleModel.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // Prevent deletion of SuperAdmin role
    if (role.is_superadmin) {
      throw new ApiError(400, 'Cannot delete SuperAdmin role');
    }

    return await RoleModel.delete(id);
  }

  // User-Role Assignment
  async assignRoleToUser(userId, roleId) {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    const result = await UserRoleModel.assignRole(userId, roleId);
    if (!result) {
      throw new ApiError(400, 'Role already assigned to user');
    }
    return result;
  }

  async removeRoleFromUser(userId, roleId) {
    const result = await UserRoleModel.removeRole(userId, roleId);
    if (!result) {
      throw new ApiError(404, 'Role not assigned to user');
    }
    return result;
  }

  async updateUserRoles(userId, roleIds) {
    // Validate all role IDs exist
    for (const roleId of roleIds) {
      const role = await RoleModel.findById(roleId);
      if (!role) {
        throw new ApiError(404, `Role with ID ${roleId} not found`);
      }
    }

    return await UserRoleModel.replaceUserRoles(userId, roleIds);
  }

  // Menu Management
  async createMenu(data) {
    const { label, icon, route, display_order = 0, is_active = true } = data;

    if (!label) {
      throw new ApiError(400, 'label is required');
    }

    return await MenuModel.create({ label, icon, route, display_order, is_active });
  }

  async updateMenu(id, data) {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new ApiError(404, 'Menu not found');
    }
    return await MenuModel.update(id, data);
  }

  async deleteMenu(id) {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new ApiError(404, 'Menu not found');
    }
    return await MenuModel.delete(id);
  }

  // Sub Menu Management
  async createSubMenu(data) {
    const { menu_id, label, route, display_order = 0, is_active = true } = data;

    if (!menu_id || !label) {
      throw new ApiError(400, 'menu_id and label are required');
    }

    const menu = await MenuModel.findById(menu_id);
    if (!menu) {
      throw new ApiError(404, 'Menu not found');
    }

    return await MenuModel.createSubMenu({ menu_id, label, route, display_order, is_active });
  }

  async updateSubMenu(id, data) {
    const subMenu = await MenuModel.findSubMenuById(id);
    if (!subMenu) {
      throw new ApiError(404, 'Sub menu not found');
    }
    return await MenuModel.updateSubMenu(id, data);
  }

  async deleteSubMenu(id) {
    const subMenu = await MenuModel.findSubMenuById(id);
    if (!subMenu) {
      throw new ApiError(404, 'Sub menu not found');
    }
    return await MenuModel.deleteSubMenu(id);
  }

  // Permission Management
  async updateRolePermissions(roleId, permissions) {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    return await RoleMenuMappingModel.bulkUpdatePermissions(roleId, permissions);
  }

  async getRolePermissions(roleId) {
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    return await RoleMenuMappingModel.getPermissionsByRoleId(roleId);
  }
}

export default new RBACService();

