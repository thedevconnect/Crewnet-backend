import rbacService from '../services/rbac.service.js';
import RoleModel from '../models/role.model.js';
import MenuModel from '../models/menu.model.js';
import UserRoleModel from '../models/user-role.model.js';
import ApiResponse from '../utils/ApiResponse.js';

class RBACController {
  // Get menus by user
  async getMenusByUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const isSuperAdmin = req.user.isSuperAdmin || false;
      
      const menus = await rbacService.getMenusByUser(userId, isSuperAdmin);
      res.status(200).json(ApiResponse.success('Menus fetched successfully', menus));
    } catch (error) {
      next(error);
    }
  }

  // Role Management
  async getAllRoles(req, res, next) {
    try {
      const roles = await RoleModel.findAll();
      res.status(200).json(ApiResponse.success('Roles fetched successfully', roles));
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      const role = await RoleModel.findById(id);
      if (!role) {
        return res.status(404).json(ApiResponse.error('Role not found', 404));
      }
      res.status(200).json(ApiResponse.success('Role fetched successfully', role));
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const role = await rbacService.createRole(req.body);
      res.status(201).json(ApiResponse.created('Role created successfully', role));
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const role = await rbacService.updateRole(id, req.body);
      res.status(200).json(ApiResponse.success('Role updated successfully', role));
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      await rbacService.deleteRole(id);
      res.status(200).json(ApiResponse.success('Role deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // User-Role Assignment
  async assignRoleToUser(req, res, next) {
    try {
      const { userId, roleId } = req.body;
      if (!userId || !roleId) {
        return res.status(400).json(ApiResponse.error('userId and roleId are required', 400));
      }
      const result = await rbacService.assignRoleToUser(userId, roleId);
      res.status(200).json(ApiResponse.success('Role assigned successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async removeRoleFromUser(req, res, next) {
    try {
      const { userId, roleId } = req.body;
      if (!userId || !roleId) {
        return res.status(400).json(ApiResponse.error('userId and roleId are required', 400));
      }
      await rbacService.removeRoleFromUser(userId, roleId);
      res.status(200).json(ApiResponse.success('Role removed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateUserRoles(req, res, next) {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;
      if (!Array.isArray(roleIds)) {
        return res.status(400).json(ApiResponse.error('roleIds must be an array', 400));
      }
      await rbacService.updateUserRoles(userId, roleIds);
      res.status(200).json(ApiResponse.success('User roles updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUserRoles(req, res, next) {
    try {
      const { userId } = req.params;
      const roles = await UserRoleModel.getRolesByUserId(userId);
      res.status(200).json(ApiResponse.success('User roles fetched successfully', roles));
    } catch (error) {
      next(error);
    }
  }

  // Menu Management
  async getAllMenus(req, res, next) {
    try {
      const menus = await MenuModel.findAll();
      res.status(200).json(ApiResponse.success('Menus fetched successfully', menus));
    } catch (error) {
      next(error);
    }
  }

  async getMenuById(req, res, next) {
    try {
      const { id } = req.params;
      const menu = await MenuModel.findById(id);
      if (!menu) {
        return res.status(404).json(ApiResponse.error('Menu not found', 404));
      }
      const subMenus = await MenuModel.findSubMenusByMenuId(id);
      res.status(200).json(ApiResponse.success('Menu fetched successfully', { ...menu, subMenus }));
    } catch (error) {
      next(error);
    }
  }

  async createMenu(req, res, next) {
    try {
      const menu = await rbacService.createMenu(req.body);
      res.status(201).json(ApiResponse.created('Menu created successfully', menu));
    } catch (error) {
      next(error);
    }
  }

  async updateMenu(req, res, next) {
    try {
      const { id } = req.params;
      const menu = await rbacService.updateMenu(id, req.body);
      res.status(200).json(ApiResponse.success('Menu updated successfully', menu));
    } catch (error) {
      next(error);
    }
  }

  async deleteMenu(req, res, next) {
    try {
      const { id } = req.params;
      await rbacService.deleteMenu(id);
      res.status(200).json(ApiResponse.success('Menu deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Sub Menu Management
  async createSubMenu(req, res, next) {
    try {
      const subMenu = await rbacService.createSubMenu(req.body);
      res.status(201).json(ApiResponse.created('Sub menu created successfully', subMenu));
    } catch (error) {
      next(error);
    }
  }

  async updateSubMenu(req, res, next) {
    try {
      const { id } = req.params;
      const subMenu = await rbacService.updateSubMenu(id, req.body);
      res.status(200).json(ApiResponse.success('Sub menu updated successfully', subMenu));
    } catch (error) {
      next(error);
    }
  }

  async deleteSubMenu(req, res, next) {
    try {
      const { id } = req.params;
      await rbacService.deleteSubMenu(id);
      res.status(200).json(ApiResponse.success('Sub menu deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Permission Management
  async updateRolePermissions(req, res, next) {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        return res.status(400).json(ApiResponse.error('permissions must be an array', 400));
      }
      await rbacService.updateRolePermissions(roleId, permissions);
      res.status(200).json(ApiResponse.success('Role permissions updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissions(req, res, next) {
    try {
      const { roleId } = req.params;
      const permissions = await rbacService.getRolePermissions(roleId);
      res.status(200).json(ApiResponse.success('Role permissions fetched successfully', permissions));
    } catch (error) {
      next(error);
    }
  }
}

export default new RBACController();

