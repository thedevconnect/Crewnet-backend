import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * RBAC Frontend Service
 * Returns menu data in Angular-friendly format
 */
class RbacFrontendService {
  /**
   * Get menus for Angular frontend by role code
   * Returns format compatible with Angular MenuItem interface
   * @param {string} roleCode - Role code (ESS, HR_ADMIN, SUPER_ADMIN)
   * @returns {Promise<Array>} Menu items for Angular
   */
  async getMenusForFrontend(roleCode) {
    try {
      if (!roleCode) {
        throw new ApiError(400, 'Role code is required');
      }

      // Get role by code
      const [roles] = await db.execute(
        'SELECT id FROM roles WHERE role_code = ? AND status = "Active"',
        [roleCode]
      );

      if (roles.length === 0) {
        throw new ApiError(404, 'Role not found');
      }

      const roleId = roles[0].id;

      // Get menus assigned to this role with proper path prefixes
      const menusSql = `
        SELECT DISTINCT
          m.id,
          m.menu_name,
          m.menu_code,
          m.menu_icon,
          m.menu_path,
          m.display_order
        FROM menus m
        INNER JOIN role_menu_mapping rmm ON m.id = rmm.menu_id
        WHERE rmm.role_id = ? AND m.status = 'Active'
        ORDER BY m.display_order ASC, m.id ASC
      `;

      const [menus] = await db.execute(menusSql, [roleId]);

      // Transform to Angular MenuItem format with role-based path prefixes
      const menuItems = menus.map(menu => {
        let route = menu.menu_path;
        
        // Add role-based prefix to routes
        if (roleCode === 'ESS') {
          route = `/ess${menu.menu_path}`;
        } else if (roleCode === 'HR_ADMIN') {
          route = `/hr-admin${menu.menu_path}`;
        }

        return {
          menu: menu.menu_name,
          icon: menu.menu_icon,
          route: route,
          menuCode: menu.menu_code,
          displayOrder: menu.display_order
        };
      });

      return menuItems;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch menus for frontend', false, error.stack);
    }
  }

  /**
   * Get fallback menus (same as hardcoded frontend menus)
   * Use this if API fails or for testing
   * @param {string} roleCode - Role code
   * @returns {Array} Fallback menu items
   */
  getFallbackMenus(roleCode) {
    if (roleCode === 'ESS') {
      return [
        { menu: 'Dashboard', icon: 'pi-home', route: '/ess/dashboard' },
        { menu: 'Employee Profile Setup', icon: 'pi-user', route: '/ess/emp-profile-setup' },
        { menu: 'Leaves', icon: 'pi-calendar-minus', route: '/ess/leaves' },
        { menu: 'Attendance', icon: 'pi-calendar', route: '/ess/attendance' },
        { menu: 'Employee Calendar', icon: 'pi-calendar-plus', route: '/ess/employee-calendar' },
        { menu: 'Shifts', icon: 'pi-clock', route: '/ess/shifts' },
        { menu: 'Departments', icon: 'pi-building', route: '/ess/departments' },
        { menu: 'Reports', icon: 'pi-file', route: '/ess/reports' },
        { menu: 'Settings', icon: 'pi-cog', route: '/ess/settings' },
        { menu: 'Tickets', icon: 'pi-ticket', route: '/ess/tickets' },
        { menu: 'Holidays', icon: 'pi-calendar-times', route: '/ess/holidays' },
        { menu: 'Logout', icon: 'pi-sign-out', route: '/ess/logout' }
      ];
    } else if (roleCode === 'HR_ADMIN') {
      return [
        { menu: 'Dashboard', icon: 'pi-home', route: '/hr-admin/dashboard' },
        { menu: 'Employee Onboarding', icon: 'pi-users', route: '/hr-admin/HrEmployees' },
        { menu: 'Leaves', icon: 'pi-calendar-minus', route: '/hr-admin/leaves' },
        { menu: 'Attendance', icon: 'pi-calendar', route: '/hr-admin/attendance' },
        { menu: 'Shifts', icon: 'pi-clock', route: '/hr-admin/shifts' },
        { menu: 'Departments', icon: 'pi-building', route: '/hr-admin/departments' },
        { menu: 'Reports', icon: 'pi-file', route: '/hr-admin/reports' },
        { menu: 'Settings', icon: 'pi-cog', route: '/hr-admin/settings' },
        { menu: 'Tickets', icon: 'pi-ticket', route: '/hr-admin/tickets' },
        { menu: 'Logout', icon: 'pi-sign-out', route: '/hr-admin/logout' }
      ];
    }
    
    return [];
  }
}

export default new RbacFrontendService();