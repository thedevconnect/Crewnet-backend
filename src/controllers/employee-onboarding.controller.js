import employeeOnboardingService from '../services/employee-onboarding.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class EmployeeOnboardingController {
  // Get dropdown options
  async getDropdownOptions(req, res, next) {
    try {
      const options = employeeOnboardingService.getDropdownOptions();
      const response = ApiResponse.success('Dropdown options fetched successfully', options);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get all employees
  async getEmployees(req, res, next) {
    try {
      const result = await employeeOnboardingService.getAllEmployees(req.query);
      
      // Transform employee list
      const transformedEmployees = result.employees.map(emp => this.transformEmployeeResponse(emp));
      
      const response = ApiResponse.success('Employees fetched successfully', {
        employees: transformedEmployees,
        pagination: result.pagination
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get employee by ID
  async getEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeOnboardingService.getEmployeeById(id);
      
      // Transform database fields to API format
      const transformedEmployee = this.transformEmployeeResponse(employee);
      
      const response = ApiResponse.success('Employee fetched successfully', transformedEmployee);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Create employee
  async createEmployee(req, res, next) {
    try {
      const employee = await employeeOnboardingService.createEmployee(req.body);
      
      // Transform database fields to API format
      const transformedEmployee = this.transformEmployeeResponse(employee);
      
      const response = ApiResponse.created('Employee created successfully', transformedEmployee);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update employee
  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeOnboardingService.updateEmployee(id, req.body);
      
      // Transform database fields to API format
      const transformedEmployee = this.transformEmployeeResponse(employee);
      
      const response = ApiResponse.success('Employee updated successfully', transformedEmployee);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete employee
  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const result = await employeeOnboardingService.deleteEmployee(id);
      const response = ApiResponse.success(result.message);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Transform database snake_case to API camelCase
  transformEmployeeResponse(employee) {
    if (!employee) return null;

    return {
      id: employee.id,
      employeeCode: employee.employee_code,
      status: employee.status,
      firstName: employee.first_name,
      lastName: employee.last_name,
      gender: employee.gender,
      dateOfBirth: employee.date_of_birth,
      email: employee.email,
      mobileNumber: employee.mobile_number,
      department: employee.department,
      designation: employee.designation,
      employmentType: employee.employment_type,
      joiningDate: employee.joining_date,
      role: employee.role,
      username: employee.username,
      firstLogin: employee.first_login === 1 || employee.first_login === true,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at,
      createdBy: employee.created_by,
      updatedBy: employee.updated_by
    };
  }
}

export default new EmployeeOnboardingController();

