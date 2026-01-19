import dashboardService from '../services/dashboard.service.js';
import ApiError from '../utils/ApiError.js';

/**
 * Dashboard Controller - Handles HTTP requests for dashboard endpoints
 */
class DashboardController {
  /**
   * Get comprehensive dashboard data
   * GET /api/dashboard?month={1-12}&year={YYYY}&date={YYYY-MM-DD}
   */
  async getDashboard(req, res) {
    try {
      const { month, year, date } = req.query;

      // Parse and validate filters
      const filters = {};
      if (month) {
        const monthNum = parseInt(month, 10);
        if (monthNum < 1 || monthNum > 12) {
          return res.status(400).json({
            success: false,
            error: 'Invalid month. Must be between 1 and 12'
          });
        }
        filters.month = monthNum;
      }

      if (year) {
        const yearNum = parseInt(year, 10);
        if (yearNum < 2000 || yearNum > 2100) {
          return res.status(400).json({
            success: false,
            error: 'Invalid year. Must be between 2000 and 2100'
          });
        }
        filters.year = yearNum;
      }

      if (date) {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid date format. Use YYYY-MM-DD format'
          });
        }
        filters.date = date;
      }

      // Get dashboard data from service
      const dashboardData = await dashboardService.getDashboardData(filters);

      res.status(200).json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Get dashboard error:', error);

      // Use ApiError statusCode if available, otherwise default to 500
      const statusCode = error instanceof ApiError ? error.statusCode : 500;

      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch dashboard data'
      });
    }
  }

  /**
   * Get day-wise statistics
   * GET /api/dashboard/day-wise?month={1-12}&year={YYYY}
   */
  async getDayWise(req, res) {
    try {
      const { month, year } = req.query;
      const today = new Date();
      const currentMonth = month ? parseInt(month, 10) : today.getMonth() + 1;
      const currentYear = year ? parseInt(year, 10) : today.getFullYear();

      if (currentMonth < 1 || currentMonth > 12) {
        return res.status(400).json({
          success: false,
          error: 'Invalid month. Must be between 1 and 12'
        });
      }

      const filters = { month: currentMonth, year: currentYear };
      const dashboardData = await dashboardService.getDashboardData(filters);

      res.status(200).json({
        success: true,
        data: {
          month: currentMonth,
          year: currentYear,
          dayWise: dashboardData.dayWise
        }
      });

    } catch (error) {
      console.error('Get day-wise error:', error);
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch day-wise data'
      });
    }
  }

  /**
   * Get monthly statistics
   * GET /api/dashboard/monthly?month={1-12}&year={YYYY}
   */
  async getMonthly(req, res) {
    try {
      const { month, year } = req.query;
      const today = new Date();
      const currentMonth = month ? parseInt(month, 10) : today.getMonth() + 1;
      const currentYear = year ? parseInt(year, 10) : today.getFullYear();

      if (currentMonth < 1 || currentMonth > 12) {
        return res.status(400).json({
          success: false,
          error: 'Invalid month. Must be between 1 and 12'
        });
      }

      const filters = { month: currentMonth, year: currentYear };
      const dashboardData = await dashboardService.getDashboardData(filters);

      res.status(200).json({
        success: true,
        data: {
          currentMonth: dashboardData.currentMonth,
          lastMonth: dashboardData.lastMonth
        }
      });

    } catch (error) {
      console.error('Get monthly error:', error);
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch monthly data'
      });
    }
  }
}

export default new DashboardController();

