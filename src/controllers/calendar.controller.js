import calendarService from '../services/calendar.service.js';
import ApiError from '../utils/ApiError.js';

/**
 * Calendar Controller - Handles HTTP requests for calendar endpoints
 */
class CalendarController {
  /**
   * Get calendar for an employee and month
   * GET /api/calendar?employeeId={id}&month={YYYY-MM}
   */
  async getCalendar(req, res) {
    try {
      const { employeeId, month } = req.query;

      // Validate required parameters
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          error: 'employeeId is required'
        });
      }

      if (!month) {
        return res.status(400).json({
          success: false,
          error: 'month is required (format: YYYY-MM)'
        });
      }

      // Get calendar data from service
      const calendar = await calendarService.getCalendar(employeeId, month);

      // Return calendar data directly (matches frontend expected format)
      res.status(200).json(calendar);

    } catch (error) {
      console.error('Get calendar error:', error);

      // Use ApiError statusCode if available, otherwise default to 500
      const statusCode = error instanceof ApiError ? error.statusCode : 500;

      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch calendar'
      });
    }
  }
}

export default new CalendarController();

