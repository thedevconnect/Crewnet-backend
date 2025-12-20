import express from 'express';
import employeeOnboardingController from '../controllers/employee-onboarding.controller.js';

const router = express.Router();

// Routes - Simple and direct, no complex validation
router.get('/dropdown-options', employeeOnboardingController.getDropdownOptions.bind(employeeOnboardingController));
router.get('/', employeeOnboardingController.getEmployees.bind(employeeOnboardingController));
router.get('/:id', employeeOnboardingController.getEmployee.bind(employeeOnboardingController));
router.post('/', employeeOnboardingController.createEmployee.bind(employeeOnboardingController));
router.put('/:id', employeeOnboardingController.updateEmployee.bind(employeeOnboardingController));
router.delete('/:id', employeeOnboardingController.deleteEmployee.bind(employeeOnboardingController));

export default router;
