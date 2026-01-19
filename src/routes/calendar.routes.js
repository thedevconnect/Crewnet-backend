import express from 'express';
import calendarController from '../controllers/calendar.controller.js';

const router = express.Router();

/**
 * GET /api/calendar?employeeId={id}&month={YYYY-MM}
 * Get employee attendance calendar for a specific month
 */
router.get('/', calendarController.getCalendar.bind(calendarController));

export default router;

