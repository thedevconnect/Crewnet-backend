import express from 'express';
import { promisePool } from '../config/db.js';

const router = express.Router();

console.log('📝 Attendance routes module loaded');

const getTodayDate = () => new Date().toISOString().split('T')[0];

const calculateDuration = (swipeInTime, swipeOutTime) => {
  if (!swipeInTime || !swipeOutTime) return null;
  const diff = new Date(swipeOutTime) - new Date(swipeInTime);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

router.post('/swipe-in', async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'employeeId is required'
      });
    }

    const employeeIdNum = parseInt(employeeId, 10);
    if (isNaN(employeeIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'employeeId must be a valid number'
      });
    }

    const [employeeCheck] = await promisePool.execute(
      'SELECT id FROM employees WHERE id = ?',
      [employeeIdNum]
    );

    if (employeeCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const attendance_date = getTodayDate();

    const [existingRecords] = await promisePool.execute(
      'SELECT id, status, swipe_out_time FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [employeeIdNum, attendance_date]
    );

    if (existingRecords.length > 0) {
      const record = existingRecords[0];
      if (record.status === 'IN' && !record.swipe_out_time) {
        return res.status(400).json({
          success: false,
          error: 'Already swiped in'
        });
      }
    }

    const [result] = await promisePool.execute(
      `INSERT INTO attendance (emp_id, attendance_date, swipe_in_time, status) 
       VALUES (?, ?, NOW(), 'IN')
       ON DUPLICATE KEY UPDATE swipe_in_time = NOW(), status = 'IN', swipe_out_time = NULL`,
      [employeeIdNum, attendance_date]
    );

    const [newRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [employeeIdNum, attendance_date]
    );

    res.status(201).json({
      success: true,
      message: 'Swipe In Successful',
      data: {
        id: newRecord[0].id,
        employee_id: newRecord[0].emp_id,
        swipe_in_time: newRecord[0].swipe_in_time,
        status: newRecord[0].status
      }
    });

  } catch (error) {
    console.error('Swipe in error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error. Please try again later.'
    });
  }
});

router.post('/swipe-out', async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'employeeId is required'
      });
    }

    const employeeIdNum = parseInt(employeeId, 10);
    if (isNaN(employeeIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'employeeId must be a valid number'
      });
    }

    const attendance_date = getTodayDate();

    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ? AND status = ?',
      [employeeIdNum, attendance_date, 'IN']
    );

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please swipe in first'
      });
    }

    const record = records[0];

    if (!record.swipe_in_time) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attendance record'
      });
    }

    await promisePool.execute(
      `UPDATE attendance SET swipe_out_time = NOW(), status = 'OUT', updated_at = NOW() 
       WHERE id = ?`,
      [record.id]
    );

    const [updatedRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [record.id]
    );

    const duration = calculateDuration(
      updatedRecord[0].swipe_in_time,
      updatedRecord[0].swipe_out_time
    );

    res.status(200).json({
      success: true,
      message: 'Swipe Out Successful',
      data: {
        id: updatedRecord[0].id,
        employee_id: updatedRecord[0].emp_id,
        swipe_in_time: updatedRecord[0].swipe_in_time,
        swipe_out_time: updatedRecord[0].swipe_out_time,
        duration: duration,
        status: updatedRecord[0].status
      }
    });

  } catch (error) {
    console.error('Swipe out error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error. Please try again later.'
    });
  }
});

router.get('/today/:employeeId', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const attendance_date = getTodayDate();

    console.log(`[ATTENDANCE] GET /today/${employeeId} - Date: ${attendance_date}`);

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid Employee ID is required'
      });
    }

    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [employeeId, attendance_date]
    );

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        status: 'NOT_SWIPED'
      });
    }

    const record = records[0];
    res.status(200).json({
      success: true,
      status: record.status || 'IN',
      swipe_in_time: record.swipe_in_time,
      swipe_out_time: record.swipe_out_time,
      employee_id: record.emp_id,
      id: record.id
    });

  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error. Please try again later.'
    });
  }
});

export default router;
