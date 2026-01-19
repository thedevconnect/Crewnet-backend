import BaseService from './base.service.js';
import ApiError from '../utils/ApiError.js';

/**
 * Leaves Service - Extends BaseService for leave-specific CRUD operations
 * 
 * This service extends the generic BaseService and adds leave-specific logic:
 * - Field validation (required fields)
 * - Data transformation (camelCase to snake_case)
 * - Custom response formatting for findAll
 */
class LeavesService extends BaseService {
  constructor() {
    // Initialize base service with table name and primary key
    super('leaves', 'id');
  }

  /**
   * Find all leaves with pagination, search, and filtering
   * Overrides base findAll to maintain existing response format
   */
  async getAllLeaves(query) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = query;

      // Allowed sort fields for leaves
      const allowedSortFields = ['created_at', 'from_date', 'to_date', 'leave_type'];
      const mappedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

      // Use base service findAll with leave-specific options
      const result = await this.findAll({
        page,
        limit,
        sortBy: mappedSortBy,
        sortOrder,
        search,
        searchColumns: ['leave_type', 'reason'] // Leave-specific search columns
      });

      // Transform response to match existing API format
      return {
        leaves: result.data || [],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Get all leaves service error:', error);
      throw error;
    }
  }

  /**
   * Get leave by ID
   * Uses base service findById with error handling
   */
  async getLeaveById(id) {
    try {
      const leave = await this.findById(id);
      if (!leave) {
        throw new ApiError(404, 'Leave not found');
      }
      return leave;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch leave', false, error.stack);
    }
  }

  /**
   * Create a new leave
   * Adds validation before calling base create
   */
  async createLeave(data) {
    try {
      // Entity-specific validation: Check required fields
      const requiredFields = ['fromDate', 'toDate', 'sessionFrom', 'sessionTo', 'leaveType', 'reason'];
      const missingFields = requiredFields.filter(field => !data[field] || (typeof data[field] === 'string' && !data[field].trim()));
      
      if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
      }

      // Transform camelCase to snake_case for database
      const dbData = this._transformToDbFormat(data);
      
      // Use base service create
      const createdLeave = await this.create(dbData);
      return createdLeave;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create leave', false, error.stack);
    }
  }

  /**
   * Update a leave
   * Uses base service updateById with data transformation
   */
  async updateLeave(id, data) {
    try {
      // Transform camelCase to snake_case for database
      const dbData = this._transformToDbFormat(data, true);
      
      // Use base service updateById
      return await this.updateById(id, dbData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update leave', false, error.stack);
    }
  }

  /**
   * Delete a leave
   * Uses base service deleteById
   */
  async deleteLeave(id) {
    try {
      const result = await this.deleteById(id);
      // Transform message to match existing API format
      return { message: 'Leave deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete leave', false, error.stack);
    }
  }

  /**
   * Helper method: Transform camelCase input to snake_case database format
   * This is entity-specific logic
   */
  _transformToDbFormat(data, isUpdate = false) {
    const dbData = {};
    
    if (data.fromDate !== undefined) dbData.from_date = data.fromDate;
    if (data.toDate !== undefined) dbData.to_date = data.toDate;
    if (data.sessionFrom !== undefined) dbData.session_from = data.sessionFrom;
    if (data.sessionTo !== undefined) dbData.session_to = data.sessionTo;
    if (data.leaveType !== undefined) dbData.leave_type = data.leaveType;
    if (data.reason !== undefined) dbData.reason = data.reason;
    if (data.ccTo !== undefined) {
      dbData.cc_to = data.ccTo || null;
    } else if (!isUpdate) {
      // Default cc_to to null for new records if not provided
      dbData.cc_to = null;
    }

    return dbData;
  }
}

export default new LeavesService();
