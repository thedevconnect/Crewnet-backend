import express from 'express';
import { body, param, query } from 'express-validator';
import employeeOnboardingController from '../controllers/employee-onboarding.controller.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const employeeValidation = {
  create: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage('First name can only contain letters, spaces, and hyphens'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage('Last name can only contain letters, spaces, and hyphens'),
    body('gender')
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Gender must be Male, Female, or Other'),
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Date of birth must be a valid date')
      .toDate(),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 200 })
      .withMessage('Email must be less than 200 characters'),
    body('mobileNumber')
      .trim()
      .matches(/^\+?[0-9]{10,15}$/)
      .withMessage('Mobile number must be 10-15 digits (can include country code with +)'),
    body('department')
      .trim()
      .notEmpty()
      .withMessage('Department is required')
      .isIn(['HR', 'IT', 'Finance', 'Sales', 'Marketing', 'Operations'])
      .withMessage('Department must be one of: HR, IT, Finance, Sales, Marketing, Operations'),
    body('designation')
      .trim()
      .notEmpty()
      .withMessage('Designation is required')
      .isIn(['Manager', 'Senior Manager', 'Executive', 'Senior Executive', 'Associate', 'Intern'])
      .withMessage('Designation must be one of: Manager, Senior Manager, Executive, Senior Executive, Associate, Intern'),
    body('employmentType')
      .isIn(['Full Time', 'Intern'])
      .withMessage('Employment type must be Full Time or Intern'),
    body('joiningDate')
      .isISO8601()
      .withMessage('Joining date must be a valid date')
      .toDate(),
    body('role')
      .isIn(['HRADMIN', 'ESS'])
      .withMessage('Role must be HRADMIN or ESS'),
    body('status')
      .optional()
      .isIn(['Active', 'Inactive'])
      .withMessage('Status must be Active or Inactive'),
    body('firstLogin')
      .optional()
      .isBoolean()
      .withMessage('firstLogin must be a boolean'),
    validateRequest
  ],
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Employee ID must be a positive integer'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage('First name can only contain letters, spaces, and hyphens'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage('Last name can only contain letters, spaces, and hyphens'),
    body('gender')
      .optional()
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Gender must be Male, Female, or Other'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date')
      .toDate(),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 200 })
      .withMessage('Email must be less than 200 characters'),
    body('mobileNumber')
      .optional()
      .trim()
      .matches(/^\+?[0-9]{10,15}$/)
      .withMessage('Mobile number must be 10-15 digits (can include country code with +)'),
    body('department')
      .optional()
      .trim()
      .isIn(['HR', 'IT', 'Finance', 'Sales', 'Marketing', 'Operations'])
      .withMessage('Department must be one of: HR, IT, Finance, Sales, Marketing, Operations'),
    body('designation')
      .optional()
      .trim()
      .isIn(['Manager', 'Senior Manager', 'Executive', 'Senior Executive', 'Associate', 'Intern'])
      .withMessage('Designation must be one of: Manager, Senior Manager, Executive, Senior Executive, Associate, Intern'),
    body('employmentType')
      .optional()
      .isIn(['Full Time', 'Intern'])
      .withMessage('Employment type must be Full Time or Intern'),
    body('joiningDate')
      .optional()
      .isISO8601()
      .withMessage('Joining date must be a valid date')
      .toDate(),
    body('role')
      .optional()
      .isIn(['HRADMIN', 'ESS'])
      .withMessage('Role must be HRADMIN or ESS'),
    body('status')
      .optional()
      .isIn(['Active', 'Inactive'])
      .withMessage('Status must be Active or Inactive'),
    body('firstLogin')
      .optional()
      .isBoolean()
      .withMessage('firstLogin must be a boolean'),
    validateRequest
  ],
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Employee ID must be a positive integer'),
    validateRequest
  ],
  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100'),
    query('search')
      .optional()
      .trim(),
    query('status')
      .optional()
      .isIn(['Active', 'Inactive'])
      .withMessage('Status must be Active or Inactive'),
    query('department')
      .optional()
      .trim(),
    query('sortBy')
      .optional()
      .isIn(['created_at', 'first_name', 'last_name', 'email', 'department', 'joining_date', 'employee_code'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', 'ASC', 'DESC'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ]
};

// Routes
router.get(
  '/dropdown-options',
  employeeOnboardingController.getDropdownOptions.bind(employeeOnboardingController)
);

router.get(
  '/',
  employeeValidation.query,
  employeeOnboardingController.getEmployees.bind(employeeOnboardingController)
);

router.get(
  '/:id',
  employeeValidation.idParam,
  employeeOnboardingController.getEmployee.bind(employeeOnboardingController)
);

router.post(
  '/',
  employeeValidation.create,
  employeeOnboardingController.createEmployee.bind(employeeOnboardingController)
);

router.put(
  '/:id',
  employeeValidation.idParam,
  employeeValidation.update,
  employeeOnboardingController.updateEmployee.bind(employeeOnboardingController)
);

router.delete(
  '/:id',
  employeeValidation.idParam,
  employeeOnboardingController.deleteEmployee.bind(employeeOnboardingController)
);

export default router;

