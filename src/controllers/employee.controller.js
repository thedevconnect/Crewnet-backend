import employeeService from '../services/employee.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class EmployeeController {
  // Get all employees
  async getEmployees(req, res, next) {
    try {
      const result = await employeeService.getAllEmployees(req.query);
      const response = ApiResponse.success('Employees fetched successfully', result);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get employee by ID
  async getEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);
      const response = ApiResponse.success('Employee fetched successfully', employee);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Create employee
  async createEmployee(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      const response = ApiResponse.created('Employee created successfully', employee);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update employee
  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeService.updateEmployee(id, req.body);
      const response = ApiResponse.success('Employee updated successfully', employee);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete employee
  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const result = await employeeService.deleteEmployee(id);
      const response = ApiResponse.success(result.message);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeController();

