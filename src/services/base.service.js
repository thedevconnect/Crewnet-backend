import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Base CRUD Service - Generic service for all entities
 * 
 * This service provides common CRUD operations that can be used by any entity.
 * Entity-specific services should extend this class and override methods as needed.
 * 
 * @class BaseService
 */
class BaseService {
  /**
   * Creates an instance of BaseService
   * @param {string} tableName - The name of the database table
   * @param {string} primaryKey - The primary key column name (default: 'id')
   */
  constructor(tableName, primaryKey = 'id') {
    if (!tableName) {
      throw new Error('Table name is required');
    }
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Create a new record in the table
   * @param {Object} data - The data to insert
   * @returns {Promise<Object>} The created record
   */
  async create(data) {
    try {
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        throw new ApiError(400, 'Data is required and must be a non-empty object');
      }

      // Build INSERT query dynamically
      const columns = Object.keys(data).filter(key => data[key] !== undefined);
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(col => data[col]);

      const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const [result] = await db.execute(sql, values);

      // Return the created record
      return await this.findById(result.insertId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create record in ${this.tableName}`, false, error.stack);
    }
  }

  /**
   * Find all records with optional where conditions
   * @param {Object} options - Query options
   * @param {Object} options.where - WHERE conditions (e.g., { status: 'Active', department: 'IT' })
   * @param {number} options.page - Page number for pagination (default: 1)
   * @param {number} options.limit - Records per page (default: 10)
   * @param {string} options.sortBy - Column to sort by (default: 'created_at' or primary key)
   * @param {string} options.sortOrder - Sort order 'ASC' or 'DESC' (default: 'DESC')
   * @param {string} options.search - Search term (optional, requires searchColumns to be set)
   * @param {Array<string>} options.searchColumns - Columns to search in (optional)
   * @returns {Promise<Object>} Object with records array and pagination info
   */
  async findAll(options = {}) {
    try {
      const {
        where = {},
        page = 1,
        limit = 10,
        sortBy = null,
        sortOrder = 'DESC',
        search = '',
        searchColumns = []
      } = options;

      const limitNum = Math.max(1, parseInt(limit) || 10);
      const pageNum = Math.max(1, parseInt(page) || 1);
      const offset = (pageNum - 1) * limitNum;

      // Build WHERE clause
      let sql = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      const params = [];

      // Add WHERE conditions
      Object.keys(where).forEach(key => {
        if (where[key] !== undefined && where[key] !== null) {
          sql += ` AND ${key} = ?`;
          params.push(where[key]);
        }
      });

      // Add search conditions
      if (search && searchColumns.length > 0) {
        const searchConditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        sql += ` AND (${searchConditions})`;
        const searchTerm = `%${search}%`;
        params.push(...searchColumns.map(() => searchTerm));
      }

      // Add sorting
      const defaultSortBy = sortBy || (this.tableName === 'employees' ? 'created_at' : this.primaryKey);
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${defaultSortBy} ${order}`;

      // Add pagination
      sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

      // Execute query
      const [rows] = await db.execute(sql, params);

      // Get total count for pagination
      let countSql = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE 1=1`;
      const countParams = [];

      // Add same WHERE conditions for count
      Object.keys(where).forEach(key => {
        if (where[key] !== undefined && where[key] !== null) {
          countSql += ` AND ${key} = ?`;
          countParams.push(where[key]);
        }
      });

      // Add same search conditions for count
      if (search && searchColumns.length > 0) {
        const searchConditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        countSql += ` AND (${searchConditions})`;
        const searchTerm = `%${search}%`;
        countParams.push(...searchColumns.map(() => searchTerm));
      }

      const [countResult] = await db.execute(countSql, countParams);
      const total = countResult[0]?.total || 0;

      // Return results in a generic format
      // Entity-specific services can override this to customize the response structure
      return {
        data: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to fetch records from ${this.tableName}`, false, error.stack);
    }
  }

  /**
   * Find a record by its primary key
   * @param {number|string} id - The primary key value
   * @returns {Promise<Object|null>} The record or null if not found
   */
  async findById(id) {
    try {
      if (id === undefined || id === null) {
        throw new ApiError(400, 'ID is required');
      }

      const sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
      const [rows] = await db.execute(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to fetch record from ${this.tableName}`, false, error.stack);
    }
  }

  /**
   * Update a record by its primary key
   * @param {number|string} id - The primary key value
   * @param {Object} data - The data to update (only provided fields will be updated)
   * @returns {Promise<Object>} The updated record
   */
  async updateById(id, data) {
    try {
      if (id === undefined || id === null) {
        throw new ApiError(400, 'ID is required');
      }

      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        throw new ApiError(400, 'Data is required and must be a non-empty object');
      }

      // Check if record exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new ApiError(404, `Record not found in ${this.tableName}`);
      }

      // Build UPDATE query dynamically (only update provided fields)
      const updates = [];
      const params = [];

      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && key !== this.primaryKey) {
          updates.push(`${key} = ?`);
          params.push(data[key]);
        }
      });

      if (updates.length === 0) {
        // No fields to update, return existing record
        return existing;
      }

      // Add updated_at timestamp if column exists (common pattern)
      // Note: This is a best-effort attempt. If column doesn't exist, MySQL will error
      // Entity-specific services can override this method to handle this better
      // We check if any update already includes updated_at to avoid duplicates
      if (!updates.some(u => u.toLowerCase().includes('updated_at'))) {
        // Try to add updated_at - if column doesn't exist, MySQL will throw an error
        // which will be caught and handled by the outer try-catch
        updates.push('updated_at = CURRENT_TIMESTAMP');
      }

      params.push(id);
      const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE ${this.primaryKey} = ?`;
      await db.execute(sql, params);

      // Return the updated record
      return await this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update record in ${this.tableName}`, false, error.stack);
    }
  }

  /**
   * Delete a record by its primary key
   * @param {number|string} id - The primary key value
   * @returns {Promise<Object>} Success message
   */
  async deleteById(id) {
    try {
      if (id === undefined || id === null) {
        throw new ApiError(400, 'ID is required');
      }

      // Check if record exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new ApiError(404, `Record not found in ${this.tableName}`);
      }

      const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
      const [result] = await db.execute(sql, [id]);

      if (result.affectedRows === 0) {
        throw new ApiError(500, `Failed to delete record from ${this.tableName}`);
      }

      return { message: `Record deleted successfully from ${this.tableName}` };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete record from ${this.tableName}`, false, error.stack);
    }
  }
}

export default BaseService;

