import express from 'express';
import leavesController from '../controllers/leaves.controller.js';

const router = express.Router();

router.get('/', leavesController.getAllLeaves.bind(leavesController));
router.get('/:id', leavesController.getLeaveById.bind(leavesController));
router.post('/', leavesController.createLeave.bind(leavesController));
router.put('/:id', leavesController.updateLeave.bind(leavesController));
router.delete('/:id', leavesController.deleteLeave.bind(leavesController));

export default router;
