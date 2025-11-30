import EmployeeModel from '../models/employee.model.js';
import ApiError from '../utils/ApiError.js';

class EmployeeService {
  // Get all employees with pagination, search, sorting
  async getAllEmployees(query) {
    try {
      const result = await EmployeeModel.findAll(query);
      return result;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch employees', false, error.stack);
    }
  }

  // Get employee by ID
  async getEmployeeById(id) {
    try {
      const employee = await EmployeeModel.findById(id);
      if (!employee) {
        throw new ApiError(404, 'Employee not found');
      }
      return employee;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to fetch employee', false, error.stack);
    }
  }

  // Create employee
  async createEmployee(data) {
    try {
      // Check if email already exists
      const existingEmployee = await EmployeeModel.findByEmail(data.email);
      if (existingEmployee) {
        throw new ApiError(400, 'Email already exists');
      }

      const employee = await EmployeeModel.create(data);
      return employee;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to create employee', false, error.stack);
    }
  }

  // Update employee
  async updateEmployee(id, data) {
    try {
      // Check if employee exists
      const existingEmployee = await EmployeeModel.findById(id);
      if (!existingEmployee) {
        throw new ApiError(404, 'Employee not found');
      }

      // Check if email is being changed and already exists
      if (data.email && data.email !== existingEmployee.email) {
        const emailExists = await EmployeeModel.findByEmail(data.email, id);
        if (emailExists) {
          throw new ApiError(400, 'Email already exists');
        }
      }

      const employee = await EmployeeModel.update(id, data);
      return employee;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update employee', false, error.stack);
    }
  }

  // Delete employee
  async deleteEmployee(id) {
    try {
      // Check if employee exists
      const existingEmployee = await EmployeeModel.findById(id);
      if (!existingEmployee) {
        throw new ApiError(404, 'Employee not found');
      }

      const deleted = await EmployeeModel.delete(id);
      if (!deleted) {
        throw new ApiError(500, 'Failed to delete employee');
      }
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to delete employee', false, error.stack);
    }
  }
}

export default new EmployeeService();

