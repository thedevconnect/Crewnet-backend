import express from 'express';
import holidayController from '../controllers/controllers/holiday.controller.js';

const router = express.Router();

router.get('/', holidayController.getHolidays.bind(holidayController));

export default router;

