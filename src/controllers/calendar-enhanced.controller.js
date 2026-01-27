import calendarService from '../services/calendar.service.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Enhanced Calendar Controller
 * Handles calendar queries with day-wise status
 */
class CalendarEnhancedController {
  /**
   * GET /api/calendar?employeeId={id}&month={YYYY-MM}
   * Get calendar for employee and month
   */
  async getCalendar(req, res, next) {
    try {
      const employeeId = parseInt(req.query.employeeId);
      const month = req.query.month;

      if (!employeeId || isNaN(employeeId)) {
        return res.status(400).json(
          ApiResponse.error('Valid employeeId is required', 400)
        );
      }

      if (!month) {
        return res.status(400).json(
          ApiResponse.error('Month is required (format: YYYY-MM)', 400)
        );
      }

      const result = await calendarService.getCalendar(employeeId, month);

      res.status(200).json(
        ApiResponse.success('Calendar fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new CalendarEnhancedController();
