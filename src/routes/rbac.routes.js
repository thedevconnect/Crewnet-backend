import express from 'express';
import rbacController from '../controllers/rbac.controller.js';
import rbacFrontendController from '../controllers/rbac-frontend.controller.js';

const router = express.Router();

router.get('/roles', rbacController.getRoles.bind(rbacController));
router.get('/roles/:roleId/menus', rbacController.getMenusByRoleId.bind(rbacController));
router.get('/roles/code/:roleCode/menus', rbacController.getMenusByRoleCode.bind(rbacController));
router.get('/frontend/menus/:roleCode', rbacFrontendController.getMenusForFrontend.bind(rbacFrontendController));
router.get('/frontend/menus/:roleCode/fallback', rbacFrontendController.getFallbackMenus.bind(rbacFrontendController));

export default router;
