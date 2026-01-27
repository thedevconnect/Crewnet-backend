import db from '../config/db.js';

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

    const allRoles = await this._getAllRoles();
    console.log('📋 Roles fetched:', allRoles.length);

    const rolesWithMenus = await Promise.all(
      allRoles.map(async (role) => {
        const menus = await this._getMenusForRole(role.roleCode);
        return {
          ...role,
          menus: menus
        };
      })
    );

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

  async _getAllRoles() {
    try {
      console.log('📋 Fetching all roles from database...');
      
      const [roles] = await db.execute('SELECT * FROM roles ORDER BY roleId ASC');
      console.log('📋 Roles query result:', roles.length, 'roles found');

      if (roles.length === 0) {
        console.log('⚠️ No roles found in database. Table might be empty.');
        return [];
      }

      const formattedRoles = roles.map(role => ({
        id: role.roleId,
        roleName: role.roleName,
        roleCode: role.roleCode,
        description: role.roleDesc || '',
        status: role.status || 'Active'
      }));

      console.log('✅ Roles formatted:', formattedRoles.length);
      return formattedRoles;
    } catch (error) {
      console.error('❌ Error fetching roles:', error.message);
      return [];
    }
  }

  async _getMenusForRole(roleCode) {
    try {
      const [roles] = await db.execute(
        'SELECT * FROM roles WHERE roleCode = ? AND status = "Active" LIMIT 1',
        [roleCode]
      );

      if (roles.length === 0) {
        return [];
      }

      const roleId = roles[0].roleId || roles[0].id || roles[0].role_id;

      try {
        const [menus] = await db.execute(
          `SELECT DISTINCT m.*
          FROM menus m
          INNER JOIN role_menu_mapping rmm ON (m.menuId = rmm.menuId OR m.id = rmm.menu_id)
          WHERE (rmm.roleId = ? OR rmm.role_id = ?) 
          AND (m.status = 'Active' OR m.is_active = 1)
          ORDER BY m.displayOrder ASC, m.display_order ASC, m.menuId ASC, m.id ASC
          LIMIT 50`,
          [roleId, roleId]
        );

        if (menus.length === 0) {
          return [];
        }

        return menus.map(menu => {
          const menuId = menu.menuId || menu.id || menu.menu_id;
          const menuName = menu.menuName || menu.menu_name || menu.MENU_NAME;
          const menuCode = menu.menuCode || menu.menu_code || menu.MENU_CODE;
          const menuIcon = menu.menuIcon || menu.menu_icon || menu.icon || '';
          const menuPath = menu.menuPath || menu.menu_path || menu.menu_url || '';
          const displayOrder = menu.displayOrder || menu.display_order || 0;

          return {
            id: menuId,
            menuName: menuName,
            menuCode: menuCode,
            menuIcon: menuIcon,
            menuPath: menuPath,
            displayOrder: displayOrder
          };
        });
      } catch (mappingError) {
        if (mappingError.message.includes("doesn't exist")) {
          console.log(`⚠️ role_menu_mapping table doesn't exist. Returning empty menus for ${roleCode}`);
          return [];
        }
        throw mappingError;
      }
    } catch (error) {
      console.error(`❌ Error fetching menus for role ${roleCode}:`, error.message);
      return [];
    }
  }
}

export default new AuthLoginService();
