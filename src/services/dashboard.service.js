import { promisePool } from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Dashboard Service - Provides comprehensive dashboard statistics
 * 
 * Features:
 * - Day-wise swipe-in counts
 * - Monthly swipe-in statistics
 * - Last month comparison
 * - Employee-wise breakdowns
 * - Department-wise statistics
 * - Leave and holiday statistics
 */
class DashboardService {
  /**
   * Get comprehensive dashboard data
   * @param {Object} filters - Optional filters (date, month, year)
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardData(filters = {}) {
    try {
      const today = new Date();
      const currentMonth = filters.month || today.getMonth() + 1;
      const currentYear = filters.year || today.getFullYear();
      const specificDate = filters.date; // Optional specific date filter

      // Get all data in parallel for performance
      const [
        totalEmployees,
        activeEmployees,
        todaySwipeIns,
        todayStats,
        monthlyStats,
        lastMonthStats,
        dayWiseData,
        departmentStats,
        leaveStats,
        holidayStats,
        employeeAttendanceBreakdown
      ] = await Promise.all([
        this._getTotalEmployees(),
        this._getActiveEmployees(),
        this._getTodaySwipeIns(),
        this._getTodayStats(),
        this._getMonthlyStats(currentYear, currentMonth),
        this._getLastMonthStats(currentYear, currentMonth),
        this._getDayWiseData(currentYear, currentMonth, specificDate),
        this._getDepartmentStats(currentYear, currentMonth),
        this._getLeaveStats(currentYear, currentMonth),
        this._getHolidayStats(currentYear, currentMonth),
        this._getEmployeeAttendanceBreakdown(currentYear, currentMonth)
      ]);

      return {
        summary: {
          totalEmployees: totalEmployees,
          activeEmployees: activeEmployees,
          todaySwipeIns: todaySwipeIns,
          todayStats: todayStats
        },
        currentMonth: {
          month: currentMonth,
          year: currentYear,
          monthName: new Date(currentYear, currentMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          stats: monthlyStats
        },
        lastMonth: {
          stats: lastMonthStats,
          comparison: this._calculateComparison(monthlyStats, lastMonthStats)
        },
        dayWise: dayWiseData,
        departmentWise: departmentStats,
        leaveStats: leaveStats,
        holidayStats: holidayStats,
        employeeBreakdown: employeeAttendanceBreakdown
      };

    } catch (error) {
      console.error('Dashboard service error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to fetch dashboard data', false, error.stack);
    }
  }

  /**
   * Get total employees count
   * @private
   */
  async _getTotalEmployees() {
    try {
      const [rows] = await promisePool.execute('SELECT COUNT(*) as count FROM employees');
      return rows[0]?.count || 0;
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') return 0;
      throw error;
    }
  }

  /**
   * Get active employees count
   * @private
   */
  async _getActiveEmployees() {
    try {
      const [rows] = await promisePool.execute(
        "SELECT COUNT(*) as count FROM employees WHERE status = 'Active'"
      );
      return rows[0]?.count || 0;
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
        // If status column doesn't exist, return total employees
        return await this._getTotalEmployees();
      }
      throw error;
    }
  }

  /**
   * Get today's swipe-in count
   * @private
   */
  async _getTodaySwipeIns() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [rows] = await promisePool.execute(
        `SELECT COUNT(DISTINCT emp_id) as count 
         FROM attendance 
         WHERE attendance_date = ? AND swipe_in_time IS NOT NULL`,
        [today]
      );
      return rows[0]?.count || 0;
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') return 0;
      throw error;
    }
  }

  /**
   * Get today's detailed statistics
   * @private
   */
  async _getTodayStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [rows] = await promisePool.execute(
        `SELECT 
          COUNT(DISTINCT emp_id) as total_swipe_ins,
          COUNT(CASE WHEN swipe_out_time IS NOT NULL THEN 1 END) as total_swipe_outs,
          COUNT(CASE WHEN swipe_out_time IS NULL THEN 1 END) as still_inside
         FROM attendance 
         WHERE attendance_date = ?`,
        [today]
      );
      return rows[0] || { total_swipe_ins: 0, total_swipe_outs: 0, still_inside: 0 };
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return { total_swipe_ins: 0, total_swipe_outs: 0, still_inside: 0 };
      }
      throw error;
    }
  }

  /**
   * Get monthly statistics
   * @private
   */
  async _getMonthlyStats(year, month) {
    try {
      const [rows] = await promisePool.execute(
        `SELECT 
          COUNT(DISTINCT emp_id) as unique_employees,
          COUNT(DISTINCT attendance_date) as working_days,
          COUNT(*) as total_swipe_ins,
          COUNT(CASE WHEN swipe_out_time IS NOT NULL THEN 1 END) as total_swipe_outs,
          AVG(TIMESTAMPDIFF(MINUTE, swipe_in_time, swipe_out_time)) as avg_working_minutes
         FROM attendance 
         WHERE YEAR(attendance_date) = ? AND MONTH(attendance_date) = ?
         AND swipe_in_time IS NOT NULL`,
        [year, month]
      );
      return {
        uniqueEmployees: rows[0]?.unique_employees || 0,
        workingDays: rows[0]?.working_days || 0,
        totalSwipeIns: rows[0]?.total_swipe_ins || 0,
        totalSwipeOuts: rows[0]?.total_swipe_outs || 0,
        avgWorkingMinutes: Math.round(rows[0]?.avg_working_minutes || 0)
      };
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return {
          uniqueEmployees: 0,
          workingDays: 0,
          totalSwipeIns: 0,
          totalSwipeOuts: 0,
          avgWorkingMinutes: 0
        };
      }
      throw error;
    }
  }

  /**
   * Get last month statistics
   * @private
   */
  async _getLastMonthStats(year, month) {
    try {
      // Calculate last month
      const lastMonthDate = new Date(year, month - 2, 1);
      const lastMonth = lastMonthDate.getMonth() + 1;
      const lastYear = lastMonthDate.getFullYear();

      return await this._getMonthlyStats(lastYear, lastMonth);
    } catch (error) {
      return {
        uniqueEmployees: 0,
        workingDays: 0,
        totalSwipeIns: 0,
        totalSwipeOuts: 0,
        avgWorkingMinutes: 0
      };
    }
  }

  /**
   * Get day-wise data for the month
   * @private
   */
  async _getDayWiseData(year, month, specificDate = null) {
    try {
      let query = `
        SELECT 
          attendance_date as date,
          COUNT(DISTINCT emp_id) as swipe_in_count,
          COUNT(*) as total_records,
          COUNT(CASE WHEN swipe_out_time IS NOT NULL THEN 1 END) as swipe_out_count
        FROM attendance 
        WHERE YEAR(attendance_date) = ? AND MONTH(attendance_date) = ?
        AND swipe_in_time IS NOT NULL
      `;
      const params = [year, month];

      if (specificDate) {
        query += ' AND attendance_date = ?';
        params.push(specificDate);
      }

      query += ' GROUP BY attendance_date ORDER BY attendance_date ASC';

      const [rows] = await promisePool.execute(query, params);
      return rows || [];
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') return [];
      throw error;
    }
  }

  /**
   * Get department-wise statistics
   * @private
   */
  async _getDepartmentStats(year, month) {
    try {
      const [rows] = await promisePool.execute(
        `SELECT 
          e.department,
          COUNT(DISTINCT a.emp_id) as employees_count,
          COUNT(*) as total_swipe_ins,
          AVG(TIMESTAMPDIFF(MINUTE, a.swipe_in_time, a.swipe_out_time)) as avg_working_minutes
         FROM attendance a
         INNER JOIN employees e ON a.emp_id = e.id
         WHERE YEAR(a.attendance_date) = ? AND MONTH(a.attendance_date) = ?
         AND a.swipe_in_time IS NOT NULL
         GROUP BY e.department
         ORDER BY employees_count DESC`,
        [year, month]
      );
      return rows || [];
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get leave statistics
   * @private
   */
  async _getLeaveStats(year, month) {
    try {
      // Calculate first and last day of month
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Try with employee_id first
      try {
        const [rows] = await promisePool.execute(
          `SELECT 
            leave_type,
            COUNT(*) as count,
            COUNT(DISTINCT employee_id) as employees_count
           FROM leaves
           WHERE (YEAR(from_date) = ? AND MONTH(from_date) = ?)
           OR (YEAR(to_date) = ? AND MONTH(to_date) = ?)
           OR (from_date <= ? AND to_date >= ?)
           GROUP BY leave_type`,
          [year, month, year, month, lastDay, firstDay]
        );
        return rows || [];
      } catch (error) {
        // If employee_id column doesn't exist, try without it
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage && error.sqlMessage.includes('employee_id')) {
          const [rows] = await promisePool.execute(
            `SELECT 
              leave_type,
              COUNT(*) as count
             FROM leaves
             WHERE (YEAR(from_date) = ? AND MONTH(from_date) = ?)
             OR (YEAR(to_date) = ? AND MONTH(to_date) = ?)
             OR (from_date <= ? AND to_date >= ?)
             GROUP BY leave_type`,
            [year, month, year, month, lastDay, firstDay]
          );
          return rows.map(r => ({ ...r, employees_count: 0 })) || [];
        }
        throw error;
      }
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') return [];
      throw error;
    }
  }

  /**
   * Get holiday statistics
   * @private
   */
  async _getHolidayStats(year, month) {
    try {
      const [rows] = await promisePool.execute(
        `SELECT 
          holiday_date,
          holiday_name,
          holiday_type
         FROM holidays
         WHERE YEAR(holiday_date) = ? AND MONTH(holiday_date) = ?
         ORDER BY holiday_date ASC`,
        [year, month]
      );
      return {
        total: rows?.length || 0,
        holidays: rows || []
      };
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return { total: 0, holidays: [] };
      }
      throw error;
    }
  }

  /**
   * Get employee-wise attendance breakdown
   * @private
   */
  async _getEmployeeAttendanceBreakdown(year, month) {
    try {
      // Try with first_name/last_name, fallback to name
      try {
        const [rows] = await promisePool.execute(
          `SELECT 
            e.id,
            e.employee_code,
            COALESCE(e.first_name, e.name, '') as first_name,
            COALESCE(e.last_name, '') as last_name,
            COALESCE(e.name, CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, ''))) as name,
            e.department,
            COUNT(DISTINCT a.attendance_date) as days_present,
            COUNT(*) as total_swipe_ins,
            AVG(TIMESTAMPDIFF(MINUTE, a.swipe_in_time, a.swipe_out_time)) as avg_working_minutes
           FROM employees e
           LEFT JOIN attendance a ON e.id = a.emp_id 
             AND YEAR(a.attendance_date) = ? 
             AND MONTH(a.attendance_date) = ?
             AND a.swipe_in_time IS NOT NULL
           GROUP BY e.id, e.employee_code, e.first_name, e.last_name, e.name, e.department
           ORDER BY days_present DESC, e.employee_code ASC
           LIMIT 50`,
          [year, month]
        );
        return rows || [];
      } catch (error) {
        // If column doesn't exist, try simpler query
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          const [rows] = await promisePool.execute(
            `SELECT 
              e.id,
              e.employee_code,
              e.department,
              COUNT(DISTINCT a.attendance_date) as days_present,
              COUNT(*) as total_swipe_ins,
              AVG(TIMESTAMPDIFF(MINUTE, a.swipe_in_time, a.swipe_out_time)) as avg_working_minutes
             FROM employees e
             LEFT JOIN attendance a ON e.id = a.emp_id 
               AND YEAR(a.attendance_date) = ? 
               AND MONTH(a.attendance_date) = ?
               AND a.swipe_in_time IS NOT NULL
             GROUP BY e.id, e.employee_code, e.department
             ORDER BY days_present DESC, e.employee_code ASC
             LIMIT 50`,
            [year, month]
          );
          return rows || [];
        }
        throw error;
      }
      return rows || [];
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') return [];
      throw error;
    }
  }

  /**
   * Calculate comparison between current and last month
   * @private
   */
  _calculateComparison(current, last) {
    const compare = (currentVal, lastVal) => {
      if (lastVal === 0) return currentVal > 0 ? 100 : 0;
      return Math.round(((currentVal - lastVal) / lastVal) * 100);
    };

    return {
      uniqueEmployees: {
        current: current.uniqueEmployees,
        last: last.uniqueEmployees,
        change: compare(current.uniqueEmployees, last.uniqueEmployees),
        changeType: current.uniqueEmployees > last.uniqueEmployees ? 'increase' : 
                    current.uniqueEmployees < last.uniqueEmployees ? 'decrease' : 'same'
      },
      totalSwipeIns: {
        current: current.totalSwipeIns,
        last: last.totalSwipeIns,
        change: compare(current.totalSwipeIns, last.totalSwipeIns),
        changeType: current.totalSwipeIns > last.totalSwipeIns ? 'increase' : 
                    current.totalSwipeIns < last.totalSwipeIns ? 'decrease' : 'same'
      },
      avgWorkingMinutes: {
        current: current.avgWorkingMinutes,
        last: last.avgWorkingMinutes,
        change: compare(current.avgWorkingMinutes, last.avgWorkingMinutes),
        changeType: current.avgWorkingMinutes > last.avgWorkingMinutes ? 'increase' : 
                    current.avgWorkingMinutes < last.avgWorkingMinutes ? 'decrease' : 'same'
      }
    };
  }
}

export default new DashboardService();

