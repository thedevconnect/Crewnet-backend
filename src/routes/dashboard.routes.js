import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data
 * Query params: month (1-12), year (YYYY), date (YYYY-MM-DD)
 */
router.get('/', dashboardController.getDashboard.bind(dashboardController));

/**
 * GET /api/dashboard/day-wise
 * Get day-wise swipe-in statistics
 * Query params: month (1-12), year (YYYY)
 */
router.get('/day-wise', dashboardController.getDayWise.bind(dashboardController));

/**
 * GET /api/dashboard/monthly
 * Get monthly statistics with last month comparison
 * Query params: month (1-12), year (YYYY)
 */
router.get('/monthly', dashboardController.getMonthly.bind(dashboardController));

export default router;

