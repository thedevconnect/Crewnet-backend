import { promisePool } from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Calendar Service - Generates employee attendance calendar for a given month
 * 
 * Business Logic Priority:
 * 1. Public Holiday (PH) - Highest priority
 * 2. Approved Leave (CL/SL) - Second priority
 * 3. Weekly Off - Sunday (WO) - Third priority
 * 4. Attendance Record (P/A) - Fourth priority
 * 5. Absent (A) - Default/fallback
 */
class CalendarService {
  /**
   * Get calendar for a specific employee and month
   * @param {number} employeeId - Employee ID
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Object>} Calendar data with days array
   */
  async getCalendar(employeeId, month) {
    try {
      // Validate employeeId
      if (!employeeId || isNaN(parseInt(employeeId))) {
        throw new ApiError(400, 'Invalid employee ID');
      }

      // Validate month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        throw new ApiError(400, 'Invalid month format. Use YYYY-MM format');
      }

      // Parse month and get date range
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of the month

      // Validate date range
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Invalid month/year');
      }

      // Verify employee exists
      // Try to get employee with first_name/last_name, fallback to name if columns don't exist
      let employee;
      try {
        const [employeeRows] = await promisePool.execute(
          'SELECT id, employee_code, first_name, last_name FROM employees WHERE id = ?',
          [employeeId]
        );
        if (employeeRows.length === 0) {
          throw new ApiError(404, 'Employee not found');
        }
        employee = employeeRows[0];
      } catch (error) {
        // If first_name/last_name columns don't exist, try with name column
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === '42S22') {
          const [employeeRows] = await promisePool.execute(
            'SELECT id, employee_code, name FROM employees WHERE id = ?',
            [employeeId]
          );
          if (employeeRows.length === 0) {
            throw new ApiError(404, 'Employee not found');
          }
          employee = employeeRows[0];
        } else if (error instanceof ApiError) {
          throw error;
        } else {
          throw new ApiError(404, 'Employee not found');
        }
      }

      // Get all data for the month in parallel to avoid N+1 queries
      const [holidays, leaves, attendanceRecords] = await Promise.all([
        this._getHolidays(year, monthNum),
        this._getLeaves(employeeId, startDate, endDate),
        this._getAttendanceWithTimes(employeeId, startDate, endDate)
      ]);

      // Create Maps/Sets for O(1) lookups
      const holidayMap = new Map(); // date -> holiday info
      holidays.forEach(holiday => {
        holidayMap.set(holiday.holiday_date, holiday);
      });

      const leaveMap = new Map(); // date -> leave info
      leaves.forEach(leave => {
        const leaveDates = this._getDateRange(leave.from_date, leave.to_date);
        leaveDates.forEach(date => {
          // Only add if status is approved (assuming 'approved' or similar)
          // If status column doesn't exist, include all leaves
          if (!leave.status || leave.status.toLowerCase() === 'approved' || leave.status.toLowerCase() === 'approve') {
            if (!leaveMap.has(date)) {
              leaveMap.set(date, leave);
            }
          }
        });
      });

      // Group attendance records by date
      const attendanceByDate = new Map(); // date -> array of records
      attendanceRecords.forEach(record => {
        const dateStr = this._formatDate(new Date(record.attendance_date));
        if (!attendanceByDate.has(dateStr)) {
          attendanceByDate.set(dateStr, []);
        }
        attendanceByDate.get(dateStr).push(record);
      });

      // Generate calendar table
      const table = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = this._formatDate(currentDate);
        const dayName = this._getDayName(currentDate);
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

        // Get attendance records for this date
        const dayAttendance = attendanceByDate.get(dateStr) || [];
        
        // Calculate working minutes and format in/out times
        const { inOutTime, workingMinutes } = this._calculateAttendanceInfo(dayAttendance);

        // Determine status based on priority
        let dayStatus = 'A'; // Default: Absent

        // Priority 1: Public Holiday
        if (holidayMap.has(dateStr)) {
          const holiday = holidayMap.get(dateStr);
          // Check if it's a restricted holiday (RH) - check holiday_type column if exists
          if (holiday.holiday_type && (holiday.holiday_type.toLowerCase() === 'restricted' || holiday.holiday_type.toLowerCase() === 'rh')) {
            dayStatus = 'RH';
          } else {
            dayStatus = 'PH'; // Default to Public Holiday
          }
        }
        // Priority 2: Approved Leave
        else if (leaveMap.has(dateStr)) {
          const leave = leaveMap.get(dateStr);
          const leaveType = leave.leave_type || '';
          
          // Check if there's also attendance (half-day leave)
          // Half-day: has leave AND has attendance with in/out times
          const hasCompleteAttendance = dayAttendance.length > 0 && 
            dayAttendance.some(r => r.swipe_in_time && r.swipe_out_time);
          
          if (hasCompleteAttendance) {
            // Half-day leave - working minutes will be calculated from attendance
            dayStatus = 'CL/2'; // Half-day casual leave (assuming CL, can be adjusted)
          } else {
            // Full-day leave - no attendance
            // Map leave types to status codes
            if (leaveType.toLowerCase().includes('casual')) {
              dayStatus = 'CL';
            } else if (leaveType.toLowerCase().includes('sick')) {
              dayStatus = 'SL';
            } else {
              dayStatus = 'CL'; // Default to CL
            }
          }
        }
        // Priority 3: Weekly Off (Sunday)
        else if (dayOfWeek === 0) {
          dayStatus = 'WO';
        }
        // Priority 4: Attendance Record (Present)
        else if (dayAttendance.length > 0 && dayAttendance.some(r => r.swipe_in_time && r.swipe_out_time)) {
          dayStatus = 'P';
        }
        // Priority 5: Default to Absent (already set)

        // Get background color based on status
        const backColor = this._getStatusColor(dayStatus);

        // Format dateLabel as ISO string with time component (YYYY-MM-DDTHH:mm:ss)
        const dateLabel = new Date(
          Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0)
        ).toISOString();

        table.push({
          dateLabel: dateLabel,
          dayName: dayName,
          inOutTime: inOutTime,
          dayStatus: dayStatus,
          backColor: backColor,
          workingMinutes: workingMinutes
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        table: table
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Calendar service error:', error);
      throw new ApiError(500, 'Failed to generate calendar', false, error.stack);
    }
  }

  /**
   * Get holidays for a specific month
   * @private
   */
  async _getHolidays(year, month) {
    try {
      const [rows] = await promisePool.execute(
        `SELECT * FROM holidays 
         WHERE YEAR(holiday_date) = ? AND MONTH(holiday_date) = ?
         ORDER BY holiday_date ASC`,
        [year, month]
      );
      
      return rows.map(row => ({
        id: row.id || row.holidayId || row.holiday_id,
        holiday_name: row.holiday_name || row.holidayName || row.holidayName,
        holiday_date: row.holiday_date || row.holidayDate || row.holidayDate,
        holiday_type: row.holiday_type || row.holidayType || null
      }));
    } catch (error) {
      // If table doesn't exist, return empty array (graceful degradation)
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
        console.warn('Holidays table does not exist. Returning empty holidays list.');
        return [];
      }
      throw error;
    }
  }

  /**
   * Get leaves for an employee within date range
   * @private
   */
  async _getLeaves(employeeId, startDate, endDate) {
    try {
      const startDateStr = this._formatDate(startDate);
      const endDateStr = this._formatDate(endDate);

      // Try different query variations based on available columns
      // Priority: employee_id + status > employee_id > all leaves + status > all leaves
      let query;
      let params;
      let rows;

      // Strategy 1: Try with employee_id and status
      try {
        query = `SELECT id, employee_id, from_date, to_date, leave_type, status 
                 FROM leaves 
                 WHERE employee_id = ? 
                 AND (
                   (from_date <= ? AND to_date >= ?) OR
                   (from_date BETWEEN ? AND ?) OR
                   (to_date BETWEEN ? AND ?)
                 )`;
        params = [employeeId, endDateStr, startDateStr, startDateStr, endDateStr, startDateStr, endDateStr];
        [rows] = await promisePool.execute(query, params);
        return rows || [];
      } catch (error) {
        // If employee_id doesn't exist, try without it but with status
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === '42S22') {
          if (error.sqlMessage && error.sqlMessage.includes('employee_id')) {
            console.warn('Leaves table does not have employee_id column. Fetching all leaves for the month.');
            // Strategy 2: Try without employee_id but with status
            try {
              query = `SELECT id, from_date, to_date, leave_type, status 
                       FROM leaves 
                       WHERE (
                         (from_date <= ? AND to_date >= ?) OR
                         (from_date BETWEEN ? AND ?) OR
                         (to_date BETWEEN ? AND ?)
                       )`;
              params = [endDateStr, startDateStr, startDateStr, endDateStr, startDateStr, endDateStr];
              [rows] = await promisePool.execute(query, params);
              return rows || [];
            } catch (error2) {
              // If status doesn't exist either, try without status
              if (error2.code === 'ER_BAD_FIELD_ERROR' || error2.code === '42S22') {
                if (error2.sqlMessage && error2.sqlMessage.includes('status')) {
                  console.warn('Leaves table does not have status column. Fetching leaves without status.');
                  // Strategy 3: Query without status column
                  query = `SELECT id, from_date, to_date, leave_type 
                           FROM leaves 
                           WHERE (
                             (from_date <= ? AND to_date >= ?) OR
                             (from_date BETWEEN ? AND ?) OR
                             (to_date BETWEEN ? AND ?)
                           )`;
                  params = [endDateStr, startDateStr, startDateStr, endDateStr, startDateStr, endDateStr];
                  [rows] = await promisePool.execute(query, params);
                  return rows || [];
                }
              }
              throw error2;
            }
          } else if (error.sqlMessage && error.sqlMessage.includes('status')) {
            // If status doesn't exist but employee_id does, try without status
            console.warn('Leaves table does not have status column. Fetching leaves without status.');
            query = `SELECT id, employee_id, from_date, to_date, leave_type 
                     FROM leaves 
                     WHERE employee_id = ? 
                     AND (
                       (from_date <= ? AND to_date >= ?) OR
                       (from_date BETWEEN ? AND ?) OR
                       (to_date BETWEEN ? AND ?)
                     )`;
            params = [employeeId, endDateStr, startDateStr, startDateStr, endDateStr, startDateStr, endDateStr];
            [rows] = await promisePool.execute(query, params);
            return rows || [];
          }
        }
        throw error;
      }
    } catch (error) {
      // If table doesn't exist, return empty array
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
        console.warn('Leaves table does not exist. Returning empty leaves list.');
        return [];
      }
      throw error;
    }
  }

  /**
   * Get attendance records with swipe in/out times for an employee within date range
   * @private
   */
  async _getAttendanceWithTimes(employeeId, startDate, endDate) {
    try {
      const startDateStr = this._formatDate(startDate);
      const endDateStr = this._formatDate(endDate);

      // Query attendance table (uses emp_id, not employee_id)
      // Get all records with swipe in/out times, ordered by date and time
      const [rows] = await promisePool.execute(
        `SELECT attendance_date, swipe_in_time, swipe_out_time 
         FROM attendance 
         WHERE emp_id = ? 
         AND attendance_date BETWEEN ? AND ?
         AND swipe_in_time IS NOT NULL
         ORDER BY attendance_date, swipe_in_time ASC`,
        [employeeId, startDateStr, endDateStr]
      );
      return rows || [];
    } catch (error) {
      // If table doesn't exist, return empty array
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
        console.warn('Attendance table does not exist. Returning empty attendance list.');
        return [];
      }
      throw error;
    }
  }

  /**
   * Calculate attendance info (in/out times and working minutes) for a day
   * @private
   */
  _calculateAttendanceInfo(attendanceRecords) {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        inOutTime: '     \n ',
        workingMinutes: 0
      };
    }

    // Filter records that have both in and out times
    const completeRecords = attendanceRecords.filter(r => r.swipe_in_time && r.swipe_out_time);
    
    if (completeRecords.length === 0) {
      // If there are records but no complete in/out pairs, show first swipe in if available
      const firstRecord = attendanceRecords.find(r => r.swipe_in_time);
      if (firstRecord) {
        const inTime = this._formatTime(firstRecord.swipe_in_time);
        return {
          inOutTime: `IN    ${inTime} \n `,
          workingMinutes: 0
        };
      }
      return {
        inOutTime: '     \n ',
        workingMinutes: 0
      };
    }

    // Get first swipe in and last swipe out
    const firstSwipeIn = completeRecords[0].swipe_in_time;
    const lastSwipeOut = completeRecords[completeRecords.length - 1].swipe_out_time;

    // Calculate total working minutes from all complete records
    let totalMinutes = 0;
    completeRecords.forEach(record => {
      const inTime = new Date(record.swipe_in_time);
      const outTime = new Date(record.swipe_out_time);
      const diffMinutes = Math.floor((outTime - inTime) / (1000 * 60));
      totalMinutes += diffMinutes;
    });

    const inTimeFormatted = this._formatTime(firstSwipeIn);
    const outTimeFormatted = this._formatTime(lastSwipeOut);

    return {
      inOutTime: `IN    ${inTimeFormatted} \nOUT ${outTimeFormatted}`,
      workingMinutes: totalMinutes
    };
  }

  /**
   * Format datetime to time string (e.g., "09:48 AM")
   * @private
   */
  _formatTime(datetime) {
    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${String(displayHours).padStart(2, '0')}:${displayMinutes} ${ampm}`;
  }

  /**
   * Get background color for status
   * @private
   */
  _getStatusColor(status) {
    const colorMap = {
      'P': '#03be3c',      // Green for Present
      'A': '#ff0000',      // Red for Absent (if needed)
      'WO': '#097af3',     // Blue for Weekly Off
      'PH': '#9796F2',     // Purple for Public Holiday
      'CL': '#f9a597',     // Light red for Casual Leave
      'CL/2': '#343C19',   // Dark green for Half-day Casual Leave
      'SL': '#f9a597',     // Light red for Sick Leave (same as CL)
      'RH': '#C2977D'      // Brown for Restricted Holiday
    };
    return colorMap[status] || '#cccccc'; // Default gray
  }

  /**
   * Get all dates in a range (inclusive)
   * @private
   */
  _getDateRange(startDateStr, endDateStr) {
    const dates = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const current = new Date(start);

    while (current <= end) {
      dates.push(this._formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Format date to YYYY-MM-DD
   * @private
   */
  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get day name (e.g., "Monday", "Tuesday")
   * @private
   */
  _getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

export default new CalendarService();

