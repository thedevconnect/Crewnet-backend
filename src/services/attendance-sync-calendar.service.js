import { promisePool } from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/** Status to background color mapping for calendar UI */
const STATUS_COLORS = {
  P: '#03be3c',
  'CL/2': '#343C19',
  MP: '#ff3300'
};

/** Minimum working minutes for full day (P). Below this = half day (CL/2). 270 = 4.5 hours */
const FULL_DAY_MINUTES = 270;

/**
 * Attendance Sync Calendar Service
 * Syncs raw punches from attendance_punch into employee_attendance_daily
 * and returns monthly calendar data for the frontend.
 */
class AttendanceSyncCalendarService {
  /**
   * Format a Date or TIME value as "hh:mm AM/PM" (12-hour).
   * @param {Date|string} value - punch_time or time string
   * @returns {string} e.g. "09:48 AM"
   */
  _formatTime12h(value) {
    if (value == null) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }

  /** Convert Date to MySQL TIME string HH:MM:SS for DB columns. */
  _toTimeString(value) {
    if (value == null) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return null;
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  /**
   * Get day name from date string (YYYY-MM-DD) or Date.
   * @param {string|Date} dateStr
   * @returns {string} e.g. "Monday"
   */
  _getDayName(dateStr) {
    const d = typeof dateStr === 'string' ? new Date(dateStr + 'T12:00:00') : dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  /**
   * Compute working minutes between first IN and last OUT.
   * @param {Date|string} inTime
   * @param {Date|string} outTime
   * @returns {number} minutes
   */
  _workingMinutes(inTime, outTime) {
    if (inTime == null || outTime == null) return 0;
    const a = inTime instanceof Date ? inTime : new Date(inTime);
    const b = outTime instanceof Date ? outTime : new Date(outTime);
    return Math.max(0, Math.round((b - a) / (1000 * 60)));
  }

  /**
   * Derive day_status: MP (missing punch), CL/2 (half day), P (present).
   * @param {boolean} hasOut - whether OUT punch exists
   * @param {number} workingMinutes
   * @returns {string} 'P' | 'CL/2' | 'MP'
   */
  _dayStatus(hasOut, workingMinutes) {
    if (!hasOut) return 'MP';
    if (workingMinutes < FULL_DAY_MINUTES) return 'CL/2';
    return 'P';
  }

  /**
   * Fetch all punch records for an employee in a given month/year.
   * @param {number} employeeId
   * @param {number} month - 1-12
   * @param {number} year
   * @returns {Promise<Array>} rows from attendance_punch
   */
  async _getPunchesForMonth(employeeId, month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [rows] = await promisePool.execute(
      `SELECT employee_id, punch_time, punch_type, attendance_date
       FROM attendance_punch
       WHERE employee_id = ? AND attendance_date BETWEEN ? AND ?
       ORDER BY attendance_date ASC, punch_time ASC`,
      [employeeId, startDate, endDate]
    );
    return rows;
  }

  /**
   * Group punches by attendance_date and compute first IN, last OUT per day.
   * @param {Array} punches - from _getPunchesForMonth
   * @returns {Map<string, { firstIn: Date, lastOut: Date }>} date string -> { firstIn, lastOut }
   */
  _groupPunchesByDate(punches) {
    const byDate = new Map();

    for (const p of punches) {
      const dateStr = typeof p.attendance_date === 'string'
        ? p.attendance_date
        : p.attendance_date.toISOString().split('T')[0];
      const punchTime = p.punch_time instanceof Date ? p.punch_time : new Date(p.punch_time);

      if (!byDate.has(dateStr)) {
        byDate.set(dateStr, { firstIn: null, lastOut: null });
      }
      const day = byDate.get(dateStr);

      if (p.punch_type === 'IN') {
        if (day.firstIn == null || punchTime < day.firstIn) day.firstIn = punchTime;
      } else if (p.punch_type === 'OUT') {
        if (day.lastOut == null || punchTime > day.lastOut) day.lastOut = punchTime;
      }
    }

    return byDate;
  }

  /**
   * Build daily record for UPSERT and for response.
   * @param {string} dateLabel - YYYY-MM-DD
   * @param {Object} day - { firstIn, lastOut }
   * @returns {Object} { dateLabel, dayName, inOutTime, dayStatus, backColor, workingMinutes, dbRow }
   */
  _buildDailyRecord(dateLabel, day) {
    const { firstIn, lastOut } = day;
    const hasOut = lastOut != null;
    const workingMinutes = this._workingMinutes(firstIn, lastOut);
    const dayStatus = this._dayStatus(hasOut, workingMinutes);
    const statusColor = STATUS_COLORS[dayStatus] || '#999';

    const inStr = firstIn != null ? this._formatTime12h(firstIn) : '';
    const outStr = lastOut != null ? this._formatTime12h(lastOut) : '';
    const inOutDisplay = [inStr ? `IN ${inStr}` : '', outStr ? `OUT ${outStr}` : ''].filter(Boolean).join('\n') || null;

    const dayName = this._getDayName(dateLabel);

    return {
      dateLabel,
      dayName,
      inOutTime: inOutDisplay || '',
      dayStatus,
      backColor: statusColor,
      workingMinutes,
      // For DB: day_name, in_time, out_time (MySQL TIME as HH:MM:SS), in_out_display, day_status, status_color, working_minutes
      dbRow: {
        day_name: dayName,
        in_time: this._toTimeString(firstIn),
        out_time: this._toTimeString(lastOut),
        in_out_display: inOutDisplay,
        day_status: dayStatus,
        status_color: statusColor,
        working_minutes: workingMinutes
      }
    };
  }

  /**
   * UPSERT one row into employee_attendance_daily.
   * Unique key = (employee_id, attendance_date).
   */
  async _upsertDailyRow(employeeId, attendanceDate, dbRow) {
    await promisePool.execute(
      `INSERT INTO employee_attendance_daily
       (employee_id, attendance_date, day_name, in_time, out_time, in_out_display, day_status, status_color, working_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         day_name = VALUES(day_name),
         in_time = VALUES(in_time),
         out_time = VALUES(out_time),
         in_out_display = VALUES(in_out_display),
         day_status = VALUES(day_status),
         status_color = VALUES(status_color),
         working_minutes = VALUES(working_minutes),
         updated_at = CURRENT_TIMESTAMP`,
      [
        employeeId,
        attendanceDate,
        dbRow.day_name,
        dbRow.in_time,
        dbRow.out_time,
        dbRow.in_out_display,
        dbRow.day_status,
        dbRow.status_color,
        dbRow.working_minutes
      ]
    );
  }

  /**
   * Sync calendar: read punches, compute daily records, UPSERT, return monthly table.
   * @param {number} employeeId
   * @param {number} month - 1-12
   * @param {number} year
   * @returns {Promise<{ table: Array }>} { table: [{ dateLabel, dayName, inOutTime, dayStatus, backColor, workingMinutes }] }
   */
  async syncCalendar(employeeId, month, year) {
    if (!employeeId || !month || !year) {
      throw new ApiError(400, 'employeeId, month, and year are required');
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      throw new ApiError(400, 'month must be 1-12');
    }
    if (yearNum < 2000 || yearNum > 2100 || isNaN(yearNum)) {
      throw new ApiError(400, 'year must be valid');
    }

    // Check if attendance_punch table exists; if not, return empty table for the month
    let punches = [];
    try {
      punches = await this._getPunchesForMonth(employeeId, monthNum, yearNum);
    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        return { table: this._emptyMonthTable(yearNum, monthNum) };
      }
      throw new ApiError(500, 'Failed to fetch punch records', false, err.stack);
    }

    const byDate = this._groupPunchesByDate(punches);
    const table = [];
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    let skipUpsert = false; // set true if employee_attendance_daily table missing

    for (let d = 1; d <= lastDay; d++) {
      const dateLabel = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const day = byDate.get(dateLabel) || { firstIn: null, lastOut: null };
      const record = this._buildDailyRecord(dateLabel, day);
      table.push({
        dateLabel: record.dateLabel,
        dayName: record.dayName,
        inOutTime: record.inOutTime,
        dayStatus: record.dayStatus,
        backColor: record.backColor,
        workingMinutes: record.workingMinutes
      });

      const hasPunch = day.firstIn != null || day.lastOut != null;
      if (hasPunch && !skipUpsert) {
        try {
          await this._upsertDailyRow(employeeId, dateLabel, record.dbRow);
        } catch (err) {
          if (err.code === 'ER_NO_SUCH_TABLE') {
            skipUpsert = true;
            // Table not created yet; skip further upserts, still return full calendar
          } else {
            throw new ApiError(500, 'Failed to sync daily attendance', false, err.stack);
          }
        }
      }
    }

    return { table };
  }

  /**
   * Build empty calendar table for a month (all days, no punches).
   */
  _emptyMonthTable(year, month) {
    const lastDay = new Date(year, month, 0).getDate();
    const table = [];
    for (let d = 1; d <= lastDay; d++) {
      const dateLabel = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      table.push({
        dateLabel,
        dayName: this._getDayName(dateLabel),
        inOutTime: '',
        dayStatus: 'A',
        backColor: '#999',
        workingMinutes: 0
      });
    }
    return table;
  }
}

export default new AttendanceSyncCalendarService();
