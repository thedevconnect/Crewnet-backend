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
      // Normalize data - support both camelCase and snake_case
      const normalizedData = {
        status: data.status || data.Status || 'Active',
        firstName: data.firstName || data.first_name,
        lastName: data.lastName || data.last_name,
        gender: data.gender || data.Gender,
        dateOfBirth: data.dateOfBirth || data.date_of_birth,
        email: data.email || data.Email,
        mobileNumber: data.mobileNumber || data.mobile_number,
        department: data.department || data.Department,
        designation: data.designation || data.Designation,
        employmentType: data.employmentType || data.employment_type,
        joiningDate: data.joiningDate || data.joining_date,
        role: data.role || data.Role,
        username: data.username || data.Username,
        firstLogin: data.firstLogin !== undefined ? data.firstLogin : (data.first_login !== undefined ? data.first_login : true)
      };

      const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'email', 'mobileNumber', 'department', 'designation', 'employmentType', 'joiningDate', 'role'];
      const missingFields = requiredFields.filter(field => !normalizedData[field]);
      if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`, true, '', 'VALIDATION_ERROR');
      }

      const existingEmail = await EmployeeOnboardingModel.findByEmail(normalizedData.email);
      if (existingEmail) throw new ApiError(400, 'Email already exists', true, '', 'DUPLICATE_EMAIL');

      const existingMobile = await EmployeeOnboardingModel.findByMobileNumber(normalizedData.mobileNumber);
      if (existingMobile) throw new ApiError(400, 'Mobile number already exists', true, '', 'DUPLICATE_MOBILE');

      const dob = normalizedData.dateOfBirth instanceof Date ? normalizedData.dateOfBirth : new Date(normalizedData.dateOfBirth);
      const today = new Date();
      if (dob >= today) throw new ApiError(400, 'Date of birth must be in the past', true, '', 'VALIDATION_ERROR');

      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) throw new ApiError(400, 'Employee must be at least 18 years old', true, '', 'VALIDATION_ERROR');

      return await EmployeeOnboardingModel.create(normalizedData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create employee', false, error.stack);
    }
  }

  async updateEmployee(id, data) {
    try {
      const existingEmployee = await EmployeeOnboardingModel.findById(id);
      if (!existingEmployee) throw new ApiError(404, 'Employee not found', true, '', 'EMPLOYEE_NOT_FOUND');

      // Normalize data - support both camelCase and snake_case
      const normalizedData = {};
      
      // Helper to trim string values
      const trimValue = (val) => (typeof val === 'string' ? val.trim() : val);
      
      // Only include fields that are being updated
      if (data.status !== undefined || data.Status !== undefined) {
        normalizedData.status = trimValue(data.status || data.Status);
      }
      if (data.firstName !== undefined || data.first_name !== undefined) {
        normalizedData.firstName = trimValue(data.firstName || data.first_name);
      }
      if (data.lastName !== undefined || data.last_name !== undefined) {
        normalizedData.lastName = trimValue(data.lastName || data.last_name);
      }
      if (data.gender !== undefined || data.Gender !== undefined) {
        normalizedData.gender = trimValue(data.gender || data.Gender);
      }
      if (data.dateOfBirth !== undefined || data.date_of_birth !== undefined) {
        normalizedData.dateOfBirth = data.dateOfBirth || data.date_of_birth;
      }
      if (data.email !== undefined || data.Email !== undefined) {
        normalizedData.email = trimValue(data.email || data.Email);
      }
      if (data.mobileNumber !== undefined || data.mobile_number !== undefined) {
        normalizedData.mobileNumber = trimValue(data.mobileNumber || data.mobile_number);
      }
      if (data.department !== undefined || data.Department !== undefined) {
        normalizedData.department = trimValue(data.department || data.Department);
      }
      if (data.designation !== undefined || data.Designation !== undefined) {
        normalizedData.designation = trimValue(data.designation || data.Designation);
      }
      if (data.employmentType !== undefined || data.employment_type !== undefined) {
        normalizedData.employmentType = trimValue(data.employmentType || data.employment_type);
      }
      if (data.joiningDate !== undefined || data.joining_date !== undefined) {
        normalizedData.joiningDate = data.joiningDate || data.joining_date;
      }
      if (data.role !== undefined || data.Role !== undefined) {
        normalizedData.role = trimValue(data.role || data.Role);
      }
      if (data.username !== undefined || data.Username !== undefined) {
        normalizedData.username = trimValue(data.username || data.Username);
      }
      if (data.firstLogin !== undefined || data.first_login !== undefined) {
        normalizedData.firstLogin = data.firstLogin !== undefined ? data.firstLogin : data.first_login;
      }

      // Validation checks using normalized data
      if (normalizedData.email && normalizedData.email !== existingEmployee.email) {
        const emailExists = await EmployeeOnboardingModel.findByEmail(normalizedData.email, id);
        if (emailExists) throw new ApiError(400, 'Email already exists', true, '', 'DUPLICATE_EMAIL');
      }

      if (normalizedData.mobileNumber && normalizedData.mobileNumber !== existingEmployee.mobile_number) {
        const mobileExists = await EmployeeOnboardingModel.findByMobileNumber(normalizedData.mobileNumber, id);
        if (mobileExists) throw new ApiError(400, 'Mobile number already exists', true, '', 'DUPLICATE_MOBILE');
      }

      if (normalizedData.dateOfBirth) {
        const dob = normalizedData.dateOfBirth instanceof Date 
          ? normalizedData.dateOfBirth 
          : new Date(normalizedData.dateOfBirth);
        const today = new Date();
        if (dob >= today) throw new ApiError(400, 'Date of birth must be in the past', true, '', 'VALIDATION_ERROR');
      }

      return await EmployeeOnboardingModel.update(id, normalizedData);
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

