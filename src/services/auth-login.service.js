import db from '../config/db.js';
import rbacFrontendService from './rbac-frontend.service.js';

class AuthLoginService {
  async login(email, password) {
    console.log('🔐 Login attempt:', { email });

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const query = 'SELECT id, email, password FROM users WHERE email = ?';
    console.log('📝 Query:', query);
    console.log('📝 Email:', email.trim());

    const [users] = await db.execute(query, [email.trim()]);
    console.log('📊 Query result:', users.length > 0 ? 'User found' : 'No user found');

    if (users.length === 0) {
      console.log('❌ Email not found:', email);
      throw new Error('Email not found');
    }

    const user = users[0];
    console.log('👤 User found:', { id: user.id, email: user.email });

    if (user.password !== password) {
      console.log('❌ Password mismatch for email:', email);
      throw new Error('Invalid password');
    }

    console.log('✅ Login successful for email:', email);

    // Get roles mapped to this user and their menus in Angular-friendly format
    const rolesWithMenus = await this._getUserRolesWithMenus(user.id);
    console.log('📋 User roles with menus prepared:', rolesWithMenus.length);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      },
      roles: rolesWithMenus
    };
  }

  /**
   * Get roles assigned to the user + menus for each role
   * Uses `user_roles` mapping table and `rbacFrontendService` for Angular MenuItem format
   */
  async _getUserRolesWithMenus(userId) {
    try {
      console.log('📋 Fetching roles for user from database...', { userId });

      const sql = `
        SELECT 
          r.id,
          r.role_name,
          r.role_code,
          r.description,
          r.is_superadmin,
          r.status,
          r.is_active
        FROM user_roles ur
        INNER JOIN roles r ON ur.roleId = r.id
        WHERE ur.userId = ?
          AND (r.status = 'Active' OR r.is_active = 1)
        ORDER BY r.id ASC
      `;

      const [rows] = await db.execute(sql, [userId]);
      console.log('📋 User roles query result:', rows.length, 'roles found for user');

      if (rows.length === 0) {
        console.log('⚠️ No roles mapped for user. Falling back to all active roles.');
        return await this._getAllActiveRolesWithMenus();
      }

      const rolesWithMenus = [];

      for (const role of rows) {
        const roleCode = role.role_code || role.roleCode;
        if (!roleCode) {
          console.warn('⚠️ Role without role_code found, skipping', role);
          continue;
        }

        let menus = [];
        try {
          // Fetch menus for this role in Angular MenuItem format
          menus = await rbacFrontendService.getMenusForFrontend(roleCode);
        } catch (e) {
          console.error(`❌ Failed to fetch menus for frontend for role ${roleCode}, using fallback menus.`, e.message || e);
          menus = rbacFrontendService.getFallbackMenus(roleCode);
        }

        rolesWithMenus.push({
          id: role.id,
          roleName: role.role_name || role.roleName,
          roleCode,
          description: role.description || '',
          isSuperAdmin: role.is_superadmin || 0,
          menus
        });
      }

      return rolesWithMenus;
    } catch (error) {
      console.error('❌ Error fetching user roles with menus:', error.message);

      // If user_roles table is missing or any other error, still try to return active roles + menus
      if (error.message && error.message.includes("user_roles")) {
        console.log('⚠️ user_roles table missing, falling back to all active roles with menus.');
        return await this._getAllActiveRolesWithMenus();
      }

      return [];
    }
  }

  /**
   * Fallback: get all active roles and their menus (for environments
   * where user_roles mapping is not yet configured)
   */
  async _getAllActiveRolesWithMenus() {
    const fallbackSql = `
      SELECT *
      FROM roles
      WHERE status = 'Active'
    `;

    const [allRoles] = await db.execute(fallbackSql);
    console.log('📋 Fallback roles query result:', allRoles.length, 'active roles found');

    const rolesWithMenus = [];

    for (const role of allRoles) {
      const id =
        role.id ??
        role.roleId ??
        role.role_id;

      const roleName =
        role.role_name ??
        role.roleName ??
        role.ROLE_NAME ??
        null;

      const roleCode =
        role.role_code ??
        role.roleCode ??
        role.ROLE_CODE ??
        null;

      if (!roleCode) {
        console.warn('⚠️ Role without role_code found in fallback, skipping', role);
        continue;
      }

      let menus = [];
      try {
        // Try dynamic menus from database
        menus = await rbacFrontendService.getMenusForFrontend(roleCode);
      } catch (e) {
        console.error(`❌ Failed to fetch menus for frontend for role ${roleCode}, using fallback menus.`, e.message || e);
        // Fallback to hardcoded menus (same structure as Angular MenuItem[])
        menus = rbacFrontendService.getFallbackMenus(roleCode);
      }

      rolesWithMenus.push({
        id,
        roleName,
        roleCode,
        description:
          role.description ??
          role.roleDesc ??
          role.role_desc ??
          role.DESCRIPTION ??
          '',
        isSuperAdmin: role.is_superadmin || role.isSuperAdmin || 0,
        menus
      });
    }

    return rolesWithMenus;
  }
}

export default new AuthLoginService();
