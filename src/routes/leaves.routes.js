import express from 'express';
import leavesController from '../controllers/leaves.controller.js';

const router = express.Router();

router.post('/', leavesController.createLeave.bind(leavesController));

export default router;

