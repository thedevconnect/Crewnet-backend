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

const calculateTotalTime = (records) => {
  let totalMilliseconds = 0;
  records.forEach(record => {
    if (record.swipe_in_time && record.swipe_out_time) {
      totalMilliseconds += new Date(record.swipe_out_time) - new Date(record.swipe_in_time);
    }
  });
  const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return { hours: totalHours, minutes: totalMinutes, formatted: `${totalHours}h ${totalMinutes}m` };
};

router.post('/swipe-in', async (req, res) => {
  try {
    let employeeId = req.body.employeeId;
    let employeeIdNum;

    if (!employeeId && req.user?.userId) {
      const [userRecord] = await promisePool.execute(
        'SELECT emp_id FROM users WHERE id = ?',
        [req.user.userId]
      );
      if (userRecord.length > 0 && userRecord[0].emp_id) {
        employeeId = userRecord[0].emp_id;
        console.log(`[SWIPE-IN] Auto-fetched emp_id ${employeeId} from user ${req.user.userId}`);
      } else {
        console.log(`[SWIPE-IN] User ${req.user.userId} has no emp_id linked. Available employee IDs: 2, 4, 6, 7, 8`);
      }
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'employeeId is required. Either provide in request body or ensure your user account is linked to an employee.'
      });
    }

    employeeIdNum = parseInt(employeeId, 10);
    if (isNaN(employeeIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'employeeId must be a valid number'
      });
    }

    console.log(`[SWIPE-IN] Checking employee ${employeeIdNum} exists...`);
    const [employeeCheck] = await promisePool.execute(
      'SELECT id FROM employees WHERE id = ?',
      [employeeIdNum]
    );

    if (employeeCheck.length === 0) {
      console.log(`[SWIPE-IN] Employee ${employeeIdNum} not found in employees table`);
      return res.status(404).json({
        success: false,
        error: `Employee not found. Employee ID ${employeeIdNum} does not exist in the system.`
      });
    }

    const attendance_date = getTodayDate();

    const [lastRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ? ORDER BY id DESC LIMIT 1',
      [employeeIdNum, attendance_date]
    );

    if (lastRecord.length > 0 && lastRecord[0].status === 'IN' && !lastRecord[0].swipe_out_time) {
      return res.status(400).json({
        success: false,
        error: 'Already swiped in. Please swipe out first.'
      });
    }

    const [result] = await promisePool.execute(
      `INSERT INTO attendance (emp_id, attendance_date, swipe_in_time, status) 
       VALUES (?, ?, NOW(), 'IN')`,
      [employeeIdNum, attendance_date]
    );

    const [newRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [result.insertId]
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
    let employeeId = req.body.employeeId;
    let employeeIdNum;

    if (!employeeId && req.user?.userId) {
      const [userRecord] = await promisePool.execute(
        'SELECT employee_id FROM users WHERE id = ?',
        [req.user.userId]
      );
      if (userRecord.length > 0 && userRecord[0].employee_id) {
        employeeId = userRecord[0].employee_id;
      }
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'employeeId is required'
      });
    }

    employeeIdNum = parseInt(employeeId, 10);
    if (isNaN(employeeIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'employeeId must be a valid number'
      });
    }

    const attendance_date = getTodayDate();

    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ? AND status = ? AND swipe_out_time IS NULL ORDER BY id DESC LIMIT 1',
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
      `UPDATE attendance SET swipe_out_time = NOW(), status = 'OUT', updatedAt = NOW() 
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

const getTodayAttendanceHandler = async (req, res) => {
  try {
    let employeeId = req.params.employeeId;
    let employeeIdNum;

    if (!employeeId && req.user?.userId) {
      const [userRecord] = await promisePool.execute(
        'SELECT employee_id FROM users WHERE id = ?',
        [req.user.userId]
      );
      if (userRecord.length > 0 && userRecord[0].employee_id) {
        employeeId = userRecord[0].employee_id;
      }
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Valid Employee ID is required'
      });
    }

    employeeIdNum = parseInt(employeeId, 10);
    if (isNaN(employeeIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Valid Employee ID is required'
      });
    }

    const attendance_date = getTodayDate();

    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ? ORDER BY swipe_in_time ASC',
      [employeeId, attendance_date]
    );

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        status: 'NOT_SWIPED',
        records: [],
        total_time: { hours: 0, minutes: 0, formatted: '0h 0m' }
      });
    }

    const totalTime = calculateTotalTime(records);
    const lastRecord = records[records.length - 1];
    const currentStatus = lastRecord.status === 'IN' && !lastRecord.swipe_out_time ? 'IN' : 'OUT';

    const formattedRecords = records.map(record => ({
      id: record.id,
      employee_id: record.emp_id,
      swipe_in_time: record.swipe_in_time,
      swipe_out_time: record.swipe_out_time,
      status: record.status,
      duration: record.swipe_in_time && record.swipe_out_time 
        ? calculateDuration(record.swipe_in_time, record.swipe_out_time) 
        : null,
      created_at: record.createdAt || record.created_at
    }));

    res.status(200).json({
      success: true,
      status: currentStatus,
      records: formattedRecords,
      total_records: records.length,
      total_time: totalTime,
      last_swipe_in: lastRecord.swipe_in_time,
      last_swipe_out: lastRecord.swipe_out_time || null
    });

  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error. Please try again later.'
    });
  }
};

router.get('/today', getTodayAttendanceHandler);
router.get('/today/:employeeId', getTodayAttendanceHandler);

export default router;
