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

      // Create employee
      const employee = await EmployeeOnboardingModel.create(normalizedData);

      if (!employee || !employee.employee_code) {
        const employeeWithCode = await EmployeeOnboardingModel.findById(employee.id);
        if (employeeWithCode && employeeWithCode.employee_code) {
          employee.employee_code = employeeWithCode.employee_code;
        }
      }

      // Create user in users table with default password ESS@1234 and employee_code
      try {
        const { promisePool } = await import('../config/db.js');
        const fullName = `${normalizedData.firstName} ${normalizedData.lastName}`.trim();
        const defaultPassword = 'ESS@1234';
        const employeeCode = employee.employee_code;

        try {
          await promisePool.execute(
            'ALTER TABLE users ADD COLUMN employee_code VARCHAR(50) UNIQUE NULL'
          );
        } catch (alterError) {
          if (!alterError.message.includes('Duplicate column name') && !alterError.message.includes('Duplicate column')) {
            // Column might not exist or other error
          }
        }

        let existingUsers = [];
        try {
          [existingUsers] = await promisePool.execute(
            'SELECT id FROM users WHERE email = ?',
            [normalizedData.email.trim()]
          );
        } catch (checkError) {
          // Error checking user
        }

        if (existingUsers.length === 0 && employeeCode) {
          try {
            [existingUsers] = await promisePool.execute(
              'SELECT id FROM users WHERE employee_code = ?',
              [employeeCode]
            );
          } catch (codeCheckError) {
            // employee_code column might not exist
          }
        }

        if (existingUsers.length === 0) {
          try {
            await promisePool.execute(
              'INSERT INTO users (name, email, password, employee_code) VALUES (?, ?, ?, ?)',
              [fullName, normalizedData.email.trim(), defaultPassword, employeeCode]
            );
          } catch (insertError) {
            if (insertError.message.includes('Unknown column') || insertError.message.includes('employee_code')) {
              await promisePool.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [fullName, normalizedData.email.trim(), defaultPassword]
              );
              try {
                await promisePool.execute(
                  'UPDATE users SET employee_code = ? WHERE email = ?',
                  [employeeCode, normalizedData.email.trim()]
                );
              } catch (updateError) {
                // Could not update employee_code
              }
            } else {
              throw insertError;
            }
          }
        } else {
          if (employeeCode && existingUsers.length > 0) {
            try {
              await promisePool.execute(
                'UPDATE users SET employee_code = ? WHERE id = ? AND (employee_code IS NULL OR employee_code = "")',
                [employeeCode, existingUsers[0].id]
              );
            } catch (updateError) {
              // Could not update employee_code
            }
          }
        }
      } catch (userError) {
        // Continue - employee is already created
      }

      return employee;
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

      // Update employee
      const updatedEmployee = await EmployeeOnboardingModel.update(id, normalizedData);

      // Update user in users table if email or name changed
      try {
        const { promisePool } = await import('../config/db.js');
        
        // Check if user exists with old email or employee_code
        let oldUsers;
        try {
          [oldUsers] = await promisePool.execute(
            'SELECT id, email, employee_code FROM users WHERE email = ? OR employee_code = ?',
            [existingEmployee.email, updatedEmployee.employee_code]
          );
        } catch (columnError) {
          // If employee_code column doesn't exist, fallback to email only
          if (columnError.message.includes('Unknown column')) {
            [oldUsers] = await promisePool.execute(
              'SELECT id, email FROM users WHERE email = ?',
              [existingEmployee.email]
            );
          } else {
            throw columnError;
          }
        }

        if (oldUsers.length > 0) {
          const user = oldUsers[0];
          const updates = [];
          const params = [];

          // Update name if firstName or lastName changed
          if (normalizedData.firstName || normalizedData.lastName) {
            const newFirstName = normalizedData.firstName || existingEmployee.first_name;
            const newLastName = normalizedData.lastName || existingEmployee.last_name;
            const fullName = `${newFirstName} ${newLastName}`.trim();
            updates.push('name = ?');
            params.push(fullName);
          }

          // Update email if changed
          if (normalizedData.email && normalizedData.email !== existingEmployee.email) {
            updates.push('email = ?');
            params.push(normalizedData.email.trim());
          }

          // Update employee_code if employee was updated (employee_code might have changed)
          if (updatedEmployee.employee_code) {
            try {
              // Check if employee_code column exists
              updates.push('employee_code = ?');
              params.push(updatedEmployee.employee_code);
            } catch (e) {
              // Column might not exist, skip it
            }
          }

          if (updates.length > 0) {
            params.push(user.id);
            try {
              await promisePool.execute(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                params
              );
            } catch (updateError) {
              if (updateError.message.includes('Unknown column')) {
                const filteredUpdates = updates.filter(u => !u.includes('employee_code'));
                const filteredParams = params.slice(0, -1).filter((p, i) => !updates[i].includes('employee_code'));
                filteredParams.push(user.id);
                if (filteredUpdates.length > 0) {
                  await promisePool.execute(
                    `UPDATE users SET ${filteredUpdates.join(', ')} WHERE id = ?`,
                    filteredParams
                  );
                }
              } else {
                throw updateError;
              }
            }
          }
        } else {
          // User doesn't exist, create one with default password and employee_code
          const newFirstName = normalizedData.firstName || existingEmployee.first_name;
          const newLastName = normalizedData.lastName || existingEmployee.last_name;
          const fullName = `${newFirstName} ${newLastName}`.trim();
          const email = normalizedData.email || existingEmployee.email;
          const defaultPassword = 'ESS@1234';
          const employeeCode = updatedEmployee.employee_code;

          try {
            await promisePool.execute(
              'INSERT INTO users (name, email, password, employee_code) VALUES (?, ?, ?, ?)',
              [fullName, email.trim(), defaultPassword, employeeCode]
            );
          } catch (insertError) {
            if (insertError.message.includes('Unknown column')) {
              await promisePool.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [fullName, email.trim(), defaultPassword]
              );
            } else {
              throw insertError;
            }
          }
        }
      } catch (userError) {
        // Continue - employee is already updated
      }

      return updatedEmployee;
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

