import employeeOnboardingService from '../services/employee-onboarding.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class EmployeeOnboardingController {
  async getDropdownOptions(req, res, next) {
    try {
      const options = employeeOnboardingService.getDropdownOptions();
      res.status(200).json(ApiResponse.success('Dropdown options fetched successfully', options));
    } catch (error) {
      next(error);
    }
  }

  async getEmployees(req, res, next) {
    try {
      const result = await employeeOnboardingService.getAllEmployees(req.query);
      const transformedEmployees = result.employees.map(emp => this.transformEmployeeResponse(emp));
      res.status(200).json(ApiResponse.success('Employees fetched successfully', {
        employees: transformedEmployees,
        pagination: result.pagination
      }));
    } catch (error) {
      next(error);
    }
  }

  async getEmployee(req, res, next) {
    try {
      const employee = await employeeOnboardingService.getEmployeeById(req.params.id);
      res.status(200).json(ApiResponse.success('Employee fetched successfully', this.transformEmployeeResponse(employee)));
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const employee = await employeeOnboardingService.createEmployee(req.body);
      res.status(201).json(ApiResponse.created('Employee created successfully', this.transformEmployeeResponse(employee)));
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeOnboardingService.updateEmployee(req.params.id, req.body);
      res.status(200).json(ApiResponse.success('Employee updated successfully', this.transformEmployeeResponse(employee)));
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      const result = await employeeOnboardingService.deleteEmployee(req.params.id);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

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

