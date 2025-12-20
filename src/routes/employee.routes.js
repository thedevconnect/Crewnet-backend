import express from 'express';
import { body, param, query } from 'express-validator';
import employeeController from '../controllers/employee.controller.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const employeeValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Phone must be at least 10 digits long')
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('Phone must contain only numbers and valid characters'),
    body('department')
      .trim()
      .notEmpty()
      .withMessage('Department is required'),
    body('status')
      .optional()
      .isIn(['Active', 'Inactive'])
      .withMessage('Status must be either Active or Inactive'),
    body('joiningDate')
      .isISO8601()
      .withMessage('Please provide a valid joining date (ISO 8601 format)')
      .toDate(),
    validateRequest
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Phone must be at least 10 digits long')
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('Phone must contain only numbers and valid characters'),
    body('department')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Department cannot be empty'),
    body('status')
      .optional()
      .isIn(['Active', 'Inactive'])
      .withMessage('Status must be either Active or Inactive'),
    body('joiningDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid joining date (ISO 8601 format)')
      .toDate(),
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
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['name', 'email', 'department', 'status', 'joiningDate', 'createdAt', 'created_at'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('Sort order must be ASC or DESC'),
    validateRequest
  ]
};

// Routes
router.get(
  '/',
  employeeValidation.query,
  employeeController.getEmployees.bind(employeeController)
);

router.get(
  '/:id',
  employeeValidation.idParam,
  employeeController.getEmployee.bind(employeeController)
);

router.post(
  '/',
  employeeValidation.create,
  employeeController.createEmployee.bind(employeeController)
);

router.put(
  '/:id',
  employeeValidation.idParam,
  employeeValidation.update,
  employeeController.updateEmployee.bind(employeeController)
);

router.delete(
  '/:id',
  employeeValidation.idParam,
  employeeController.deleteEmployee.bind(employeeController)
);

export default router;

