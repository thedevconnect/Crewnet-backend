import dashboardEnhancedService from '../services/dashboard-enhanced.service.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Enhanced Dashboard Controller - Role-Aware
 * Handles dashboard queries based on user role
 */
class DashboardEnhancedController {
  /**
   * GET /api/dashboard
   * Get comprehensive dashboard data (role-aware)
   */
  async getDashboard(req, res, next) {
    try {
      const { month, year, date } = req.query;
      
      // Get user context from request (set by auth middleware)
      const userContext = {
        roleCode: req.user?.roleCode || 'ESS',
        employeeId: req.user?.employeeId || null,
        department: req.user?.department || null
      };

      const filters = {};
      if (month) filters.month = parseInt(month, 10);
      if (year) filters.year = parseInt(year, 10);
      if (date) filters.date = date;

      const result = await dashboardEnhancedService.getDashboardData(filters, userContext);

      res.status(200).json(
        ApiResponse.success('Dashboard data fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/day-wise
   * Get day-wise statistics (role-aware)
   */
  async getDayWise(req, res, next) {
    try {
      const { month, year, date } = req.query;
      
      const userContext = {
        roleCode: req.user?.roleCode || 'ESS',
        employeeId: req.user?.employeeId || null,
        department: req.user?.department || null
      };

      const filters = {};
      if (month) filters.month = parseInt(month, 10);
      if (year) filters.year = parseInt(year, 10);
      if (date) filters.date = date;

      const result = await dashboardEnhancedService.getDayWiseStats(filters, userContext);

      res.status(200).json(
        ApiResponse.success('Day-wise statistics fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/monthly
   * Get monthly statistics (role-aware)
   */
  async getMonthly(req, res, next) {
    try {
      const { month, year } = req.query;
      
      const userContext = {
        roleCode: req.user?.roleCode || 'ESS',
        employeeId: req.user?.employeeId || null,
        department: req.user?.department || null
      };

      const filters = {};
      if (month) filters.month = parseInt(month, 10);
      if (year) filters.year = parseInt(year, 10);

      const result = await dashboardEnhancedService.getMonthlyStats(filters, userContext);

      res.status(200).json(
        ApiResponse.success('Monthly statistics fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardEnhancedController();
