import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Enhanced Dashboard Service - Role-Aware
 * Provides different data based on user role:
 * - ESS: Only own data
 * - HR Admin: Department data
 * - Super Admin: All data
 */
class DashboardEnhancedService {
  /**
   * Get dashboard data based on role
   * @param {Object} filters - Filters (month, year, date, employeeId)
   * @param {Object} userContext - User context (roleCode, employeeId, department)
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData(filters = {}, userContext = {}) {
    try {
      const { roleCode, employeeId, department } = userContext;
      const today = new Date().toISOString().split('T')[0];

      // Determine data scope based on role
      const scope = this._getDataScope(roleCode, employeeId, department);

      // Get all data in parallel
      const [
        todayPresent,
        todayAbsent,
        lateEmployees,
        leaveCount,
        dayWiseStats,
        monthlyStats
      ] = await Promise.all([
        this._getTodayPresentCount(scope),
        this._getTodayAbsentCount(scope),
        this._getLateEmployees(scope),
        this._getLeaveCount(scope, today),
        this._getDayWiseStats(scope, filters),
        this._getMonthlyStats(scope, filters)
      ]);

      return {
        role: roleCode || 'UNKNOWN',
        scope: scope.type,
        summary: {
          todayPresent,
          todayAbsent,
          lateEmployees: lateEmployees.length,
          leaveCount
        },
        lateEmployees,
        dayWise: dayWiseStats,
        monthly: monthlyStats
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch dashboard data', false, error.stack);
    }
  }

  /**
   * Get day-wise statistics
   * @param {Object} filters - Filters (month, year, date)
   * @param {Object} userContext - User context
   * @returns {Promise<Array>} Day-wise statistics
   */
  async getDayWiseStats(filters = {}, userContext = {}) {
    try {
      const { roleCode, employeeId, department } = userContext;
      const scope = this._getDataScope(roleCode, employeeId, department);

      return await this._getDayWiseStats(scope, filters);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch day-wise statistics', false, error.stack);
    }
  }

  /**
   * Get monthly statistics
   * @param {Object} filters - Filters (month, year)
   * @param {Object} userContext - User context
   * @returns {Promise<Object>} Monthly statistics
   */
  async getMonthlyStats(filters = {}, userContext = {}) {
    try {
      const { roleCode, employeeId, department } = userContext;
      const scope = this._getDataScope(roleCode, employeeId, department);

      return await this._getMonthlyStats(scope, filters);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch monthly statistics', false, error.stack);
    }
  }

  /**
   * Determine data scope based on role
   * @private
   */
  _getDataScope(roleCode, employeeId, department) {
    if (roleCode === 'SUPER_ADMIN') {
      return { type: 'ALL', employeeId: null, department: null };
    } else if (roleCode === 'HR_ADMIN') {
      return { type: 'DEPARTMENT', employeeId: null, department };
    } else if (roleCode === 'ESS' || roleCode === 'DEVELOPER') {
      return { type: 'EMPLOYEE', employeeId, department: null };
    }
    // Default: Employee scope
    return { type: 'EMPLOYEE', employeeId, department: null };
  }

  /**
   * Get today's present count
   * @private
   */
  async _getTodayPresentCount(scope) {
    let sql = `
      SELECT COUNT(DISTINCT a.emp_id) as count
      FROM attendance a
      INNER JOIN employees e ON a.emp_id = e.id
      WHERE a.attendance_date = CURDATE()
      AND a.swipe_in_time IS NOT NULL
      AND e.status = 'Active'
    `;

    const params = [];

    if (scope.type === 'EMPLOYEE') {
      sql += ' AND a.emp_id = ?';
      params.push(scope.employeeId);
    } else if (scope.type === 'DEPARTMENT') {
      sql += ' AND e.department = ?';
      params.push(scope.department);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0]?.count || 0;
  }

  /**
   * Get today's absent count
   * @private
   */
  async _getTodayAbsentCount(scope) {
    // Total active employees minus present employees
    let totalSql = `
      SELECT COUNT(*) as count
      FROM employees
      WHERE status = 'Active'
    `;
    const totalParams = [];

    if (scope.type === 'EMPLOYEE') {
      totalSql += ' AND id = ?';
      totalParams.push(scope.employeeId);
    } else if (scope.type === 'DEPARTMENT') {
      totalSql += ' AND department = ?';
      totalParams.push(scope.department);
    }

    const [totalRows] = await db.execute(totalSql, totalParams);
    const total = totalRows[0]?.count || 0;

    const present = await this._getTodayPresentCount(scope);
    return Math.max(0, total - present);
  }

  /**
   * Get late employees (swiped in after 9:30 AM)
   * @private
   */
  async _getLateEmployees(scope) {
    let sql = `
      SELECT 
        e.id,
        e.employee_code,
        CONCAT(e.first_name, ' ', e.last_name) as name,
        e.department,
        a.swipe_in_time,
        TIME(a.swipe_in_time) as swipe_in_time_only
      FROM attendance a
      INNER JOIN employees e ON a.emp_id = e.id
      WHERE a.attendance_date = CURDATE()
      AND a.swipe_in_time IS NOT NULL
      AND a.late_entry = TRUE
      AND e.status = 'Active'
    `;

    const params = [];

    if (scope.type === 'EMPLOYEE') {
      sql += ' AND a.emp_id = ?';
      params.push(scope.employeeId);
    } else if (scope.type === 'DEPARTMENT') {
      sql += ' AND e.department = ?';
      params.push(scope.department);
    }

    sql += ' ORDER BY a.swipe_in_time ASC LIMIT 50';

    const [rows] = await db.execute(sql, params);
    return rows.map(r => ({
      employeeId: r.id,
      employeeCode: r.employee_code,
      name: r.name,
      department: r.department,
      swipeInTime: r.swipe_in_time,
      swipeInTimeOnly: r.swipe_in_time_only
    }));
  }

  /**
   * Get leave count for today
   * @private
   */
  async _getLeaveCount(scope, date) {
    let sql = `
      SELECT COUNT(DISTINCT l.employee_id) as count
      FROM leaves l
      INNER JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'approved'
      AND ? BETWEEN l.from_date AND l.to_date
      AND e.status = 'Active'
    `;

    const params = [date];

    if (scope.type === 'EMPLOYEE') {
      sql += ' AND l.employee_id = ?';
      params.push(scope.employeeId);
    } else if (scope.type === 'DEPARTMENT') {
      sql += ' AND e.department = ?';
      params.push(scope.department);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0]?.count || 0;
  }

  /**
   * Get day-wise statistics
   * @private
   */
  async _getDayWiseStats(scope, filters) {
    const month = filters.month || new Date().getMonth() + 1;
    const year = filters.year || new Date().getFullYear();
    const date = filters.date;

    let sql = `
      SELECT 
        a.attendance_date as date,
        COUNT(DISTINCT a.emp_id) as present_count,
        COUNT(CASE WHEN a.late_entry = TRUE THEN 1 END) as late_count,
        COUNT(CASE WHEN a.early_exit = TRUE THEN 1 END) as early_exit_count
      FROM attendance a
      INNER JOIN employees e ON a.emp_id = e.id
      WHERE YEAR(a.attendance_date) = ?
      AND MONTH(a.attendance_date) = ?
      AND a.swipe_in_time IS NOT NULL
      AND e.status = 'Active'
    `;

    const params = [year, month];

    if (scope.type === 'EMPLOYEE') {
      sql += ' AND a.emp_id = ?';
      params.push(scope.employeeId);
    } else if (scope.type === 'DEPARTMENT') {
      sql += ' AND e.department = ?';
      params.push(scope.department);
    }

    if (date) {
      sql += ' AND a.attendance_date = ?';
      params.push(date);
    }

    sql += ' GROUP BY a.attendance_date ORDER BY a.attendance_date ASC';

    const [rows] = await db.execute(sql, params);
    return rows.map(r => ({
      date: r.date.toISOString().split('T')[0],
      presentCount: r.present_count,
      lateCount: r.late_count,
      earlyExitCount: r.early_exit_count
    }));
  }

  /**
   * Get monthly statistics
   * @private
   */
  async _getMonthlyStats(scope, filters) {
    const month = filters.month || new Date().getMonth() + 1;
    const year = filters.year || new Date().getFullYear();

    let sql = `
      SELECT 
        COUNT(DISTINCT a.emp_id) as unique_employees,
        COUNT(DISTINCT a.attendance_date) as working_days,
        COUNT(*) as total_swipe_ins,
        COUNT(CASE WHEN a.late_entry = TRUE THEN 1 END) as total_late_entries,
        COUNT(CASE WHEN a.early_exit = TRUE THEN 1 END) as total_early_exits,
        AVG(TIMESTAMPDIFF(MINUTE, a.swipe_in_time, a.swipe_out_time)) as avg_working_minutes
      FROM attendance a
      INNER JOIN employees e ON a.emp_id = e.id
      WHERE YEAR(a.attendance_date) = ?
      AND MONTH(a.attendance_date) = ?
      AND a.swipe_in_time IS NOT NULL
      AND e.status = 'Active'
    `;

    const params = [year, month];

    if (scope.type === 'EMPLOYEE') {
      sql += ' AND a.emp_id = ?';
      params.push(scope.employeeId);
    } else if (scope.type === 'DEPARTMENT') {
      sql += ' AND e.department = ?';
      params.push(scope.department);
    }

    const [rows] = await db.execute(sql, params);
    const row = rows[0] || {};

    return {
      month,
      year,
      uniqueEmployees: row.unique_employees || 0,
      workingDays: row.working_days || 0,
      totalSwipeIns: row.total_swipe_ins || 0,
      totalLateEntries: row.total_late_entries || 0,
      totalEarlyExits: row.early_exit_count || 0,
      avgWorkingMinutes: Math.round(row.avg_working_minutes || 0)
    };
  }
}

export default new DashboardEnhancedService();
