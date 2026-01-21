import express from 'express';
import rbacController from '../controllers/rbac.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireSuperAdmin } from '../middlewares/superadmin.middleware.js';

const router = express.Router();

// Public route - Get menus by user (requires authentication)
router.get('/menus/by-user', verifyToken, rbacController.getMenusByUser.bind(rbacController));

// SuperAdmin-only routes - Role Management
router.get('/roles', verifyToken, requireSuperAdmin, rbacController.getAllRoles.bind(rbacController));
router.get('/roles/:id', verifyToken, requireSuperAdmin, rbacController.getRoleById.bind(rbacController));
router.post('/roles', verifyToken, requireSuperAdmin, rbacController.createRole.bind(rbacController));
router.put('/roles/:id', verifyToken, requireSuperAdmin, rbacController.updateRole.bind(rbacController));
router.delete('/roles/:id', verifyToken, requireSuperAdmin, rbacController.deleteRole.bind(rbacController));

// SuperAdmin-only routes - User-Role Assignment
router.post('/user-roles/assign', verifyToken, requireSuperAdmin, rbacController.assignRoleToUser.bind(rbacController));
router.post('/user-roles/remove', verifyToken, requireSuperAdmin, rbacController.removeRoleFromUser.bind(rbacController));
router.put('/user-roles/:userId', verifyToken, requireSuperAdmin, rbacController.updateUserRoles.bind(rbacController));
router.get('/user-roles/:userId', verifyToken, requireSuperAdmin, rbacController.getUserRoles.bind(rbacController));

// SuperAdmin-only routes - Menu Management
router.get('/menus', verifyToken, requireSuperAdmin, rbacController.getAllMenus.bind(rbacController));
router.get('/menus/:id', verifyToken, requireSuperAdmin, rbacController.getMenuById.bind(rbacController));
router.post('/menus', verifyToken, requireSuperAdmin, rbacController.createMenu.bind(rbacController));
router.put('/menus/:id', verifyToken, requireSuperAdmin, rbacController.updateMenu.bind(rbacController));
router.delete('/menus/:id', verifyToken, requireSuperAdmin, rbacController.deleteMenu.bind(rbacController));

// SuperAdmin-only routes - Sub Menu Management
router.post('/sub-menus', verifyToken, requireSuperAdmin, rbacController.createSubMenu.bind(rbacController));
router.put('/sub-menus/:id', verifyToken, requireSuperAdmin, rbacController.updateSubMenu.bind(rbacController));
router.delete('/sub-menus/:id', verifyToken, requireSuperAdmin, rbacController.deleteSubMenu.bind(rbacController));

// SuperAdmin-only routes - Permission Management
router.get('/roles/:roleId/permissions', verifyToken, requireSuperAdmin, rbacController.getRolePermissions.bind(rbacController));
router.put('/roles/:roleId/permissions', verifyToken, requireSuperAdmin, rbacController.updateRolePermissions.bind(rbacController));

export default router;

