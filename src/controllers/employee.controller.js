import employeeService from '../services/employee.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class EmployeeController {
  async getEmployees(req, res, next) {
    try {
      const result = await employeeService.getAllEmployees(req.query);
      res.status(200).json(ApiResponse.success('Employees fetched successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getEmployee(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.status(200).json(ApiResponse.success('Employee fetched successfully', employee));
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json(ApiResponse.created('Employee created successfully', employee));
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      res.status(200).json(ApiResponse.success('Employee updated successfully', employee));
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      const result = await employeeService.deleteEmployee(req.params.id);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeController();

