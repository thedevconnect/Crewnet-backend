import BaseService from './base.service.js';
import EmployeeModel from '../models/employee.model.js';
import ApiError from '../utils/ApiError.js';
import db from '../config/db.js';

/**
 * Employee Service - Extends BaseService for employee-specific CRUD operations
 * 
 * This service extends the generic BaseService and adds employee-specific logic:
 * - Email uniqueness validation
 * - Custom data transformation (camelCase to snake_case)
 * - Custom response formatting for findAll
 */
class EmployeeService extends BaseService {
  constructor() {
    // Initialize base service with table name and primary key
    super('employees', 'id');
  }

  /**
   * Find all employees with pagination, search, and filtering
   * Overrides base findAll to maintain existing response format
   */
  async getAllEmployees(query) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = query;

      // Map sortBy to database column names
      const sortFieldMap = {
        'name': 'first_name',
        'email': 'email',
        'department': 'department',
        'status': 'status',
        'joiningDate': 'joining_date',
        'createdAt': 'created_at'
      };
      const allowedSortFields = ['name', 'email', 'department', 'status', 'joiningDate', 'createdAt', 'created_at', 'first_name', 'joining_date'];
      const mappedSortBy = allowedSortFields.includes(sortBy) ? (sortFieldMap[sortBy] || sortBy) : 'created_at';

      // Use base service findAll with employee-specific options
      const result = await this.findAll({
        page,
        limit,
        sortBy: mappedSortBy,
        sortOrder,
        search,
        searchColumns: ['first_name', 'last_name', 'email', 'employee_code'] // Employee-specific search columns
      });

      // Transform response to match existing API format
      return {
        employees: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch employees', false, error.stack);
    }
  }

  /**
   * Get employee by ID
   * Uses base service findById
   */
  async getEmployeeById(id) {
    try {
      const employee = await this.findById(id);
      if (!employee) throw new ApiError(404, 'Employee not found');
      return employee;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch employee', false, error.stack);
    }
  }

  /**
   * Create a new employee
   * Adds email validation before calling base create
   */
  async createEmployee(data) {
    try {
      // Entity-specific validation: Check email uniqueness
      if (data.email) {
        const existingEmployee = await EmployeeModel.findByEmail(data.email);
        if (existingEmployee) throw new ApiError(400, 'Email already exists');
      }

      // Transform camelCase to snake_case for database
      const dbData = this._transformToDbFormat(data);
      
      // Use base service create
      return await this.create(dbData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create employee', false, error.stack);
    }
  }

  /**
   * Update an employee
   * Adds email validation before calling base updateById
   */
  async updateEmployee(id, data) {
    try {
      const existingEmployee = await this.findById(id);
      if (!existingEmployee) throw new ApiError(404, 'Employee not found');

      // Entity-specific validation: Check email uniqueness if email is being changed
      if (data.email && data.email !== existingEmployee.email) {
        const emailExists = await EmployeeModel.findByEmail(data.email, id);
        if (emailExists) throw new ApiError(400, 'Email already exists');
      }

      // Transform camelCase to snake_case for database
      const dbData = this._transformToDbFormat(data, true);
      
      // Use base service updateById
      return await this.updateById(id, dbData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update employee', false, error.stack);
    }
  }

  /**
   * Delete an employee
   * Uses base service deleteById
   */
  async deleteEmployee(id) {
    try {
      const result = await this.deleteById(id);
      // Transform message to match existing API format
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete employee', false, error.stack);
    }
  }

  /**
   * Helper method: Transform camelCase input to snake_case database format
   * This is entity-specific logic
   */
  _transformToDbFormat(data, isUpdate = false) {
    const toNull = (val) => (val === undefined || val === null || val === '') ? null : val;
    
    const dbData = {};
    
    // Handle firstName/first_name
    if (data.firstName !== undefined || data.first_name !== undefined) {
      dbData.first_name = toNull(data.firstName || data.first_name);
    }
    
    // Handle lastName/last_name
    if (data.lastName !== undefined || data.last_name !== undefined) {
      dbData.last_name = toNull(data.lastName || data.last_name);
    }
    
    // Handle email
    if (data.email !== undefined) {
      dbData.email = toNull(data.email);
    }
    
    // Handle mobileNumber/mobile_number/phone
    if (data.mobileNumber !== undefined || data.mobile_number !== undefined || data.phone !== undefined) {
      dbData.mobile_number = toNull(data.mobileNumber || data.mobile_number || data.phone);
    }
    
    // Handle department
    if (data.department !== undefined) {
      dbData.department = toNull(data.department);
    }
    
    // Handle status
    if (data.status !== undefined) {
      dbData.status = toNull(data.status) || 'Active';
    } else if (!isUpdate) {
      // Default status for new records
      dbData.status = 'Active';
    }
    
    // Handle joiningDate/joining_date
    if (data.joiningDate !== undefined || data.joining_date !== undefined) {
      dbData.joining_date = toNull(data.joiningDate || data.joining_date);
    }

    return dbData;
  }
}

export default new EmployeeService();

