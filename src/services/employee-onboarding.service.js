import EmployeeOnboardingModel from '../models/employee-onboarding.model.js';
import ApiError from '../utils/ApiError.js';

class EmployeeOnboardingService {
  // Get dropdown options
  getDropdownOptions() {
    return {
      departments: [
        { label: 'HR', value: 'HR' },
        { label: 'IT', value: 'IT' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Sales', value: 'Sales' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Operations', value: 'Operations' }
      ],
      designations: [
        { label: 'Manager', value: 'Manager' },
        { label: 'Senior Manager', value: 'Senior Manager' },
        { label: 'Executive', value: 'Executive' },
        { label: 'Senior Executive', value: 'Senior Executive' },
        { label: 'Associate', value: 'Associate' },
        { label: 'Intern', value: 'Intern' }
      ],
      genders: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' }
      ],
      employmentTypes: [
        { label: 'Full Time', value: 'Full Time' },
        { label: 'Intern', value: 'Intern' }
      ],
      roles: [
        { label: 'HRADMIN', value: 'HRADMIN' },
        { label: 'ESS', value: 'ESS' }
      ],
      statuses: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ]
    };
  }

  async getAllEmployees(query) {
    try {
      return await EmployeeOnboardingModel.findAll(query);
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch employees', false, error.stack);
    }
  }

  async getEmployeeById(id) {
    try {
      const employee = await EmployeeOnboardingModel.findById(id);
      if (!employee) throw new ApiError(404, 'Employee not found', true, '', 'EMPLOYEE_NOT_FOUND');
      return employee;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch employee', false, error.stack);
    }
  }

  async createEmployee(data) {
    try {
      const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'email', 'mobileNumber', 'department', 'designation', 'employmentType', 'joiningDate', 'role'];
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`, true, '', 'VALIDATION_ERROR');
      }

      const existingEmail = await EmployeeOnboardingModel.findByEmail(data.email);
      if (existingEmail) throw new ApiError(400, 'Email already exists', true, '', 'DUPLICATE_EMAIL');

      const existingMobile = await EmployeeOnboardingModel.findByMobileNumber(data.mobileNumber);
      if (existingMobile) throw new ApiError(400, 'Mobile number already exists', true, '', 'DUPLICATE_MOBILE');

      const dob = data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth);
      const today = new Date();
      if (dob >= today) throw new ApiError(400, 'Date of birth must be in the past', true, '', 'VALIDATION_ERROR');

      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) throw new ApiError(400, 'Employee must be at least 18 years old', true, '', 'VALIDATION_ERROR');

      return await EmployeeOnboardingModel.create(data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create employee', false, error.stack);
    }
  }

  async updateEmployee(id, data) {
    try {
      const existingEmployee = await EmployeeOnboardingModel.findById(id);
      if (!existingEmployee) throw new ApiError(404, 'Employee not found', true, '', 'EMPLOYEE_NOT_FOUND');

      if (data.email && data.email !== existingEmployee.email) {
        const emailExists = await EmployeeOnboardingModel.findByEmail(data.email, id);
        if (emailExists) throw new ApiError(400, 'Email already exists', true, '', 'DUPLICATE_EMAIL');
      }

      if (data.mobileNumber && data.mobileNumber !== existingEmployee.mobile_number) {
        const mobileExists = await EmployeeOnboardingModel.findByMobileNumber(data.mobileNumber, id);
        if (mobileExists) throw new ApiError(400, 'Mobile number already exists', true, '', 'DUPLICATE_MOBILE');
      }

      if (data.dateOfBirth) {
        const dob = new Date(data.dateOfBirth);
        const today = new Date();
        if (dob >= today) throw new ApiError(400, 'Date of birth must be in the past', true, '', 'VALIDATION_ERROR');
      }

      return await EmployeeOnboardingModel.update(id, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update employee', false, error.stack);
    }
  }

  async deleteEmployee(id) {
    try {
      const existingEmployee = await EmployeeOnboardingModel.findById(id);
      if (!existingEmployee) throw new ApiError(404, 'Employee not found', true, '', 'EMPLOYEE_NOT_FOUND');

      const deleted = await EmployeeOnboardingModel.delete(id);
      if (!deleted) throw new ApiError(500, 'Failed to delete employee');
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete employee', false, error.stack);
    }
  }
}

export default new EmployeeOnboardingService();

