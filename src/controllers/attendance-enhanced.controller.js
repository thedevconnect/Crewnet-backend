import attendanceService from '../services/attendance.service.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Enhanced Attendance Controller
 * Handles swipe-in, swipe-out, and attendance queries
 */
class AttendanceEnhancedController {
  /**
   * POST /api/attendance/swipe-in
   * Swipe in with IP address and device info
   */
  async swipeIn(req, res, next) {
    try {
      const employeeId = req.body.employeeId || req.user?.employeeId;
      
      if (!employeeId) {
        return res.status(400).json(
          ApiResponse.error('Employee ID is required', 400)
        );
      }

      const options = {
        location: req.body.location || null,
        ipAddress: req.body.ipAddress || this._getClientIp(req),
        deviceInfo: req.body.deviceInfo || null,
        userAgent: req.body.userAgent || req.headers['user-agent'] || null,
        request: req
      };

      const result = await attendanceService.swipeIn(employeeId, options);

      res.status(201).json(
        ApiResponse.created('Swipe In Successful', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/attendance/swipe-out
   * Swipe out with IP address and device info
   */
  async swipeOut(req, res, next) {
    try {
      const employeeId = req.body.employeeId || req.user?.employeeId;
      
      if (!employeeId) {
        return res.status(400).json(
          ApiResponse.error('Employee ID is required', 400)
        );
      }

      const options = {
        location: req.body.location || null,
        ipAddress: req.body.ipAddress || this._getClientIp(req),
        deviceInfo: req.body.deviceInfo || null,
        userAgent: req.body.userAgent || req.headers['user-agent'] || null,
        request: req
      };

      const result = await attendanceService.swipeOut(employeeId, options);

      res.status(200).json(
        ApiResponse.success('Swipe Out Successful', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/attendance/today/:employeeId
   * Get today's attendance for an employee
   */
  async getTodayAttendance(req, res, next) {
    try {
      const employeeId = parseInt(req.params.employeeId) || req.user?.employeeId;
      
      if (!employeeId) {
        return res.status(400).json(
          ApiResponse.error('Employee ID is required', 400)
        );
      }

      const result = await attendanceService.getTodayAttendance(employeeId);

      res.status(200).json(
        ApiResponse.success('Today attendance fetched successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client IP address
   * @private
   */
  _getClientIp(req) {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           null;
  }
}

export default new AttendanceEnhancedController();
