import { promisePool } from '../../config/db.js';

class HolidayController {
  async getHolidays(req, res) {
    try {
      const { page = 1, limit = 10, search = '', searchText = '' } = req.query;
      
      // Parse and validate page and limit
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);
      const offset = (pageNum - 1) * limitNum;

      // Use search or searchText (support both for compatibility)
      const searchTerm = search || searchText;

      // Build WHERE clause for search
      let sql = 'SELECT * FROM holidays_master WHERE 1=1';
      let countSql = 'SELECT COUNT(*) as total FROM holidays_master WHERE 1=1';
      const params = [];
      const countParams = [];

      // Add search filter if search term is provided
      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;
        const searchCondition = ' AND (holiday_name LIKE ? OR day_name LIKE ? OR holiday_type LIKE ?)';
        sql += searchCondition;
        countSql += searchCondition;
        params.push(searchPattern, searchPattern, searchPattern);
        countParams.push(searchPattern, searchPattern, searchPattern);
      }

      // Add ordering and pagination
      sql += ` ORDER BY id DESC LIMIT ${limitNum} OFFSET ${offset}`;

      // Get total count with search filter
      const [countResult] = await promisePool.execute(countSql, countParams);
      const totalRecords = countResult[0].total;

      // Calculate total pages
      const totalPages = Math.ceil(totalRecords / limitNum);

      // Fetch paginated data
      // Use template literals for LIMIT and OFFSET to avoid MySQL placeholder issues
      const [holidays] = await promisePool.execute(sql, params);

      res.status(200).json({
        success: true,
        totalRecords,
        totalPages,
        currentPage: pageNum,
        data: holidays
      });

    } catch (error) {
      console.error('Get holidays error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error'
      });
    }
  }
}

export default new HolidayController();   