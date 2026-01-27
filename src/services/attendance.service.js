import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Attendance Service
 * Handles swipe-in, swipe-out, and attendance queries
 */
class AttendanceService {
  // Configuration: Expected work hours (can be made configurable)
  EXPECTED_SWIPE_IN_TIME = '09:30:00'; // 9:30 AM
  EXPECTED_SWIPE_OUT_TIME = '18:00:00'; // 6:00 PM

  /**
   * Swipe In - Record employee swipe-in
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Additional options (location, ipAddress, deviceInfo, userAgent)
   * @returns {Promise<Object>} Swipe-in record
   */
  async swipeIn(employeeId, options = {}) {
    try {
      if (!employeeId) {
        throw new ApiError(400, 'Employee ID is required');
      }

      // Verify employee exists
      const [employees] = await db.execute(
        'SELECT id, status FROM employees WHERE id = ?',
        [employeeId]
      );

      if (employees.length === 0) {
        throw new ApiError(404, 'Employee not found');
      }

      if (employees[0].status !== 'Active') {
        throw new ApiError(400, 'Employee is not active');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      // Check if employee has already swiped in without swiping out
      const [existingRecords] = await db.execute(
        `SELECT id, swipe_in_time, swipe_out_time 
         FROM attendance 
         WHERE emp_id = ? 
         AND attendance_date = ? 
         AND status = 'IN' 
         AND swipe_out_time IS NULL
         ORDER BY swipe_in_time DESC 
         LIMIT 1`,
        [employeeId, today]
      );

      if (existingRecords.length > 0) {
        throw new ApiError(400, 'Already swiped in. Please swipe out first.');
      }

      // Calculate late entry flag
      const swipeInTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
      const isLateEntry = this._isTimeAfter(swipeInTime, this.EXPECTED_SWIPE_IN_TIME);

      // Get IP address from request or options
      const ipAddress = options.ipAddress || this._getClientIp(options.request);
      const deviceInfo = options.deviceInfo || null;
      const userAgent = options.userAgent || options.request?.headers?.['user-agent'] || null;

      // Insert swipe-in record
      const [result] = await db.execute(
        `INSERT INTO attendance 
         (emp_id, attendance_date, swipe_in_time, swipe_in_location, 
          ip_address, device_info, user_agent, late_entry, status) 
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, 'IN')`,
        [
          employeeId,
          today,
          options.location || null,
          ipAddress,
          deviceInfo,
          userAgent,
          isLateEntry
        ]
      );

      // Fetch the created record
      const [newRecord] = await db.execute(
        'SELECT * FROM attendance WHERE id = ?',
        [result.insertId]
      );

      return this._formatAttendanceRecord(newRecord[0]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to process swipe-in', false, error.stack);
    }
  }

  /**
   * Swipe Out - Record employee swipe-out
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Additional options (location, ipAddress, deviceInfo, userAgent)
   * @returns {Promise<Object>} Swipe-out record
   */
  async swipeOut(employeeId, options = {}) {
    try {
      if (!employeeId) {
        throw new ApiError(400, 'Employee ID is required');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      // Find the latest IN record without swipe-out
      const [records] = await db.execute(
        `SELECT * FROM attendance 
         WHERE emp_id = ? 
         AND attendance_date = ? 
         AND status = 'IN' 
         AND swipe_out_time IS NULL
         ORDER BY swipe_in_time DESC 
         LIMIT 1`,
        [employeeId, today]
      );

      if (records.length === 0) {
        throw new ApiError(400, 'Please swipe in first');
      }

      const record = records[0];

      // Calculate early exit flag
      const swipeOutTime = now.toTimeString().split(' ')[0];
      const isEarlyExit = this._isTimeBefore(swipeOutTime, this.EXPECTED_SWIPE_OUT_TIME);

      // Get IP address
      const ipAddress = options.ipAddress || this._getClientIp(options.request);
      const deviceInfo = options.deviceInfo || null;
      const userAgent = options.userAgent || options.request?.headers?.['user-agent'] || null;

      // Update swipe-out
      await db.execute(
        `UPDATE attendance 
         SET swipe_out_time = NOW(), 
             swipe_out_location = ?,
             ip_address = COALESCE(?, ip_address),
             device_info = COALESCE(?, device_info),
             user_agent = COALESCE(?, user_agent),
             early_exit = ?,
             status = 'OUT'
         WHERE id = ?`,
        [
          options.location || null,
          ipAddress,
          deviceInfo,
          userAgent,
          isEarlyExit,
          record.id
        ]
      );

      // Fetch updated record
      const [updatedRecord] = await db.execute(
        'SELECT * FROM attendance WHERE id = ?',
        [record.id]
      );

      const formatted = this._formatAttendanceRecord(updatedRecord[0]);
      
      // Calculate duration
      if (formatted.swipeInTime && formatted.swipeOutTime) {
        formatted.duration = this._calculateDuration(
          formatted.swipeInTime,
          formatted.swipeOutTime
        );
      }

      return formatted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to process swipe-out', false, error.stack);
    }
  }

  /**
   * Get today's attendance for an employee
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object>} Today's attendance records
   */
  async getTodayAttendance(employeeId) {
    try {
      if (!employeeId) {
        throw new ApiError(400, 'Employee ID is required');
      }

      const today = new Date().toISOString().split('T')[0];

      const [records] = await db.execute(
        `SELECT * FROM attendance 
         WHERE emp_id = ? AND attendance_date = ? 
         ORDER BY swipe_in_time ASC`,
        [employeeId, today]
      );

      if (records.length === 0) {
        return {
          status: 'NOT_SWIPED',
          records: [],
          totalTime: { hours: 0, minutes: 0, formatted: '0h 0m' }
        };
      }

      const formattedRecords = records.map(r => this._formatAttendanceRecord(r));
      
      // Calculate total time
      let totalMilliseconds = 0;
      formattedRecords.forEach(record => {
        if (record.swipeInTime && record.swipeOutTime) {
          totalMilliseconds += new Date(record.swipeOutTime) - new Date(record.swipeInTime);
        }
      });

      const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
      const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

      const lastRecord = formattedRecords[formattedRecords.length - 1];
      const currentStatus = lastRecord.status === 'IN' && !lastRecord.swipeOutTime ? 'IN' : 'OUT';

      return {
        status: currentStatus,
        records: formattedRecords,
        totalRecords: records.length,
        totalTime: {
          hours: totalHours,
          minutes: totalMinutes,
          formatted: `${totalHours}h ${totalMinutes}m`
        },
        lastSwipeIn: lastRecord.swipeInTime,
        lastSwipeOut: lastRecord.swipeOutTime || null
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch today attendance', false, error.stack);
    }
  }

  /**
   * Format attendance record for response
   * @private
   */
  _formatAttendanceRecord(record) {
    return {
      id: record.id,
      employeeId: record.emp_id,
      attendanceDate: record.attendance_date,
      swipeInTime: record.swipe_in_time,
      swipeInLocation: record.swipe_in_location,
      swipeOutTime: record.swipe_out_time,
      swipeOutLocation: record.swipe_out_location,
      ipAddress: record.ip_address,
      deviceInfo: record.device_info,
      lateEntry: record.late_entry || false,
      earlyExit: record.early_exit || false,
      status: record.status
    };
  }

  /**
   * Calculate duration between two times
   * @private
   */
  _calculateDuration(startTime, endTime) {
    const diff = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      hours,
      minutes,
      formatted: `${hours}h ${minutes}m`
    };
  }

  /**
   * Check if time1 is after time2
   * @private
   */
  _isTimeAfter(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return h1 > h2 || (h1 === h2 && m1 > m2);
  }

  /**
   * Check if time1 is before time2
   * @private
   */
  _isTimeBefore(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return h1 < h2 || (h1 === h2 && m1 < m2);
  }

  /**
   * Get client IP address from request
   * @private
   */
  _getClientIp(req) {
    if (!req) return null;
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           null;
  }
}

export default new AttendanceService();
