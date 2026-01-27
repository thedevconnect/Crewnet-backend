import rbacFrontendService from '../services/rbac-frontend.service.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * RBAC Frontend Controller
 * Handles menu requests for Angular frontend
 */
class RbacFrontendController {
  /**
   * GET /api/rbac/frontend/menus/:roleCode
   * Get menus for Angular frontend in MenuItem format
   */
  async getMenusForFrontend(req, res, next) {
    try {
      const { roleCode } = req.params;

      if (!roleCode) {
        return res.status(400).json(
          ApiResponse.error('Role code is required', 400)
        );
      }

      // Convert to uppercase for consistency
      const normalizedRoleCode = roleCode.toUpperCase().replace('-', '_');

      const menuItems = await rbacFrontendService.getMenusForFrontend(normalizedRoleCode);

      res.status(200).json(
        ApiResponse.success('Menus fetched successfully', menuItems)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rbac/frontend/menus/:roleCode/fallback
   * Get fallback menus (for testing or API failure scenarios)
   */
  async getFallbackMenus(req, res, next) {
    try {
      const { roleCode } = req.params;

      if (!roleCode) {
        return res.status(400).json(
          ApiResponse.error('Role code is required', 400)
        );
      }

      const normalizedRoleCode = roleCode.toUpperCase().replace('-', '_');
      const menuItems = rbacFrontendService.getFallbackMenus(normalizedRoleCode);

      res.status(200).json(
        ApiResponse.success('Fallback menus fetched successfully', menuItems)
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new RbacFrontendController();