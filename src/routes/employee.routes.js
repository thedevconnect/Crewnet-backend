import express from 'express';
import employeeController from '../controllers/employee.controller.js';

const router = express.Router();

router.get('/', employeeController.getEmployees.bind(employeeController));
router.get('/:id', employeeController.getEmployee.bind(employeeController));
router.post('/', employeeController.createEmployee.bind(employeeController));
router.put('/:id', employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', employeeController.deleteEmployee.bind(employeeController));

export default router;
