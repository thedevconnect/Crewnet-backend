import EmployeeModel from '../models/employee.model.js';
import ApiError from '../utils/ApiError.js';

class EmployeeService {
  async getAllEmployees(query) {
    try {
      return await EmployeeModel.findAll(query);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch employees', false, error.stack);
    }
  }

  async getEmployeeById(id) {
    try {
      const employee = await EmployeeModel.findById(id);
      if (!employee) throw new ApiError(404, 'Employee not found');
      return employee;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch employee', false, error.stack);
    }
  }

  async createEmployee(data) {
    try {
      const existingEmployee = await EmployeeModel.findByEmail(data.email);
      if (existingEmployee) throw new ApiError(400, 'Email already exists');
      return await EmployeeModel.create(data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create employee', false, error.stack);
    }
  }

  async updateEmployee(id, data) {
    try {
      const existingEmployee = await EmployeeModel.findById(id);
      if (!existingEmployee) throw new ApiError(404, 'Employee not found');

      if (data.email && data.email !== existingEmployee.email) {
        const emailExists = await EmployeeModel.findByEmail(data.email, id);
        if (emailExists) throw new ApiError(400, 'Email already exists');
      }

      return await EmployeeModel.update(id, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update employee', false, error.stack);
    }
  }

  async deleteEmployee(id) {
    try {
      const existingEmployee = await EmployeeModel.findById(id);
      if (!existingEmployee) throw new ApiError(404, 'Employee not found');

      const deleted = await EmployeeModel.delete(id);
      if (!deleted) throw new ApiError(500, 'Failed to delete employee');
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete employee', false, error.stack);
    }
  }
}

export default new EmployeeService();

