import rbacService from '../services/rbac.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class RbacController {
  /**
   * GET /api/rbac/roles
   * Get all active roles
   */
  async getRoles(req, res, next) {
    try {
      const roles = await rbacService.getAllRoles();
      res.status(200).json(ApiResponse.success('Roles fetched successfully', roles));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rbac/roles/:roleId/menus
   * Get menus and submenus by role ID
   * Response optimized for Angular sidebar routing
   */
  async getMenusByRoleId(req, res, next) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json(ApiResponse.error('Invalid role ID', 400));
      }

      const result = await rbacService.getMenusByRoleId(roleId);
      res.status(200).json(ApiResponse.success('Menus fetched successfully', result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rbac/roles/code/:roleCode/menus
   * Get menus and submenus by role code
   * Response optimized for Angular sidebar routing
   */
  async getMenusByRoleCode(req, res, next) {
    try {
      const { roleCode } = req.params;
      if (!roleCode) {
        return res.status(400).json(ApiResponse.error('Role code is required', 400));
      }

      const result = await rbacService.getMenusByRoleCode(roleCode);
      res.status(200).json(ApiResponse.success('Menus fetched successfully', result));
    } catch (error) {
      next(error);
    }
  }
}

export default new RbacController();
