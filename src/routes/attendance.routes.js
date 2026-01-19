import express from 'express';
import { promisePool } from '../config/db.js';

const router = express.Router();

// Helper: Get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Helper: Calculate duration between swipe in and swipe out
const calculateDuration = (swipeInTime, swipeOutTime) => {
  const diff = new Date(swipeOutTime) - new Date(swipeInTime);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Helper: Get employee ID from request body or authenticated user token
const getEmployeeId = async (req) => {
  // First check request body
  if (req.body.employeeId) {
    return parseInt(req.body.employeeId, 10);
  }

  // If not found, fetch from authenticated user
  if (req.user?.userId) {
    const [userRecord] = await promisePool.execute(
      'SELECT emp_id FROM users WHERE id = ?',
      [req.user.userId]
    );
    if (userRecord.length > 0 && userRecord[0].emp_id) {
      return parseInt(userRecord[0].emp_id, 10);
    }
  }

  return null;
};

// SWIPE IN - Insert attendance record directly into database
router.post('/swipe-in', async (req, res) => {
  try {
    // Get employee ID
    const employeeId = await getEmployeeId(req);
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'employeeId is required'
      });
    }

    // Get today's date
    const todayDate = getTodayDate();

    // Get location from request body (optional)
    // Note: swipe_in_location column may not exist - run attendance_location_migration.sql to add it
    const location = req.body.location || null;

    // Insert into database
    const [result] = await promisePool.execute(
      `INSERT INTO attendance (emp_id, attendance_date, swipe_in_time, status) 
       VALUES (?, ?, NOW(), 'IN')`,
      [employeeId, todayDate]
    );

    // Fetch inserted record
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
        swipe_in_location: newRecord[0].swipe_in_location || null,
        status: newRecord[0].status
      }
    });

  } catch (error) {
    console.error('Swipe in error:', error);

    // Database constraint error (employee doesn't exist)
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Duplicate entry error (UNIQUE constraint exists - needs database migration)
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(400).json({
        success: false,
        error: 'Already swiped in today. Database migration required to allow multiple swipe-ins per day.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// SWIPE OUT - Update the latest IN record
router.post('/swipe-out', async (req, res) => {
  try {
    // Get employee ID
    const employeeId = await getEmployeeId(req);
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'employeeId is required'
      });
    }

    const todayDate = getTodayDate();

    // Find latest IN record (where swipe_out_time is NULL)
    const [records] = await promisePool.execute(
      `SELECT * FROM attendance 
       WHERE emp_id = ? AND attendance_date = ? 
       AND status = 'IN' AND swipe_out_time IS NULL 
       ORDER BY id DESC LIMIT 1`,
      [employeeId, todayDate]
    );

    // If record not found, return error
    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please swipe in first'
      });
    }

    const record = records[0];

    // Get location from request body (optional)
    const location = req.body.location || null;

    // Update swipe out time and status (updatedAt will be updated automatically by ON UPDATE CURRENT_TIMESTAMP)
    // Note: swipe_out_location column may not exist - run attendance_location_migration.sql to add it
    await promisePool.execute(
      `UPDATE attendance 
       SET swipe_out_time = NOW(), status = 'OUT' 
       WHERE id = ?`,
      [record.id]
    );

    // Fetch updated record
    const [updatedRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [record.id]
    );

    // Calculate duration
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
        swipe_in_location: updatedRecord[0].swipe_in_location || null,
        swipe_out_time: updatedRecord[0].swipe_out_time,
        swipe_out_location: updatedRecord[0].swipe_out_location || null,
        duration: duration,
        status: updatedRecord[0].status
      }
    });

  } catch (error) {
    console.error('Swipe out error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// Helper: Calculate total time from all records
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

// GET TODAY ATTENDANCE - Handler function (used for both routes)
const getTodayAttendanceHandler = async (req, res) => {
  try {
    // Get employee ID from params or user token
    let employeeId = req.params.employeeId
      ? parseInt(req.params.employeeId, 10)
      : await getEmployeeId(req);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const todayDate = getTodayDate();

    // Fetch all records for today
    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ? ORDER BY swipe_in_time ASC',
      [employeeId, todayDate]
    );

    // If no records found
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        status: 'NOT_SWIPED',
        records: [],
        total_time: { hours: 0, minutes: 0, formatted: '0h 0m' }
      });
    }

    // Calculate total time
    const totalTime = calculateTotalTime(records);

    // Get current status from last record
    const lastRecord = records[records.length - 1];
    const currentStatus = lastRecord.status === 'IN' && !lastRecord.swipe_out_time ? 'IN' : 'OUT';

    // Format records (add duration)
    const formattedRecords = records.map(record => ({
      id: record.id,
      employee_id: record.emp_id,
      swipe_in_time: record.swipe_in_time,
      swipe_in_location: record.swipe_in_location || null,
      swipe_out_time: record.swipe_out_time,
      swipe_out_location: record.swipe_out_location || null,
      status: record.status,
      duration: record.swipe_in_time && record.swipe_out_time
        ? calculateDuration(record.swipe_in_time, record.swipe_out_time)
        : null
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
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

// Two routes: with parameter and without parameter
router.get('/today', getTodayAttendanceHandler);
router.get('/today/:employeeId', getTodayAttendanceHandler);

// GET ATTENDANCE BY DATE - Get attendance records for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const employeeId = req.query.employeeId
      ? parseInt(req.query.employeeId, 10)
      : await getEmployeeId(req);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required (provide in query parameter or authenticate)'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format'
      });
    }

    // Fetch all records for the specified date
    const [records] = await promisePool.execute(
      `SELECT * FROM attendance 
       WHERE emp_id = ? AND attendance_date = ? 
       ORDER BY swipe_in_time ASC`,
      [employeeId, date]
    );

    // If no records found
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        date: date,
        status: 'NO_RECORDS',
        records: [],
        total_time: { hours: 0, minutes: 0, formatted: '0h 0m' },
        message: 'No attendance records found for this date'
      });
    }

    // Calculate total time
    const totalTime = calculateTotalTime(records);

    // Get current status from last record
    const lastRecord = records[records.length - 1];
    const currentStatus = lastRecord.status === 'IN' && !lastRecord.swipe_out_time ? 'IN' : 'OUT';

    // Format records (add duration and location)
    const formattedRecords = records.map(record => ({
      id: record.id,
      employee_id: record.emp_id,
      attendance_date: record.attendance_date,
      swipe_in_time: record.swipe_in_time,
      swipe_in_location: record.swipe_in_location || null,
      swipe_out_time: record.swipe_out_time,
      swipe_out_location: record.swipe_out_location || null,
      status: record.status,
      duration: record.swipe_in_time && record.swipe_out_time
        ? calculateDuration(record.swipe_in_time, record.swipe_out_time)
        : null
    }));

    res.status(200).json({
      success: true,
      date: date,
      status: currentStatus,
      records: formattedRecords,
      total_records: records.length,
      total_time: totalTime,
      summary: {
        first_swipe_in: records[0].swipe_in_time,
        first_swipe_in_location: records[0].swipe_in_location || null,
        last_swipe_out: lastRecord.swipe_out_time || null,
        last_swipe_out_location: lastRecord.swipe_out_location || null,
        total_hours_in_office: totalTime.formatted
      }
    });

  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// GET ATTENDANCE BY DATE WITH EMPLOYEE ID IN PATH
router.get('/date/:date/:employeeId', async (req, res) => {
  try {
    const { date, employeeId: empIdParam } = req.params;
    const employeeId = parseInt(empIdParam, 10);

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format'
      });
    }

    // Fetch all records for the specified date
    const [records] = await promisePool.execute(
      `SELECT * FROM attendance 
       WHERE emp_id = ? AND attendance_date = ? 
       ORDER BY swipe_in_time ASC`,
      [employeeId, date]
    );

    // If no records found
    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        date: date,
        employee_id: employeeId,
        status: 'NO_RECORDS',
        records: [],
        total_time: { hours: 0, minutes: 0, formatted: '0h 0m' },
        message: 'No attendance records found for this date'
      });
    }

    // Calculate total time
    const totalTime = calculateTotalTime(records);

    // Get current status from last record
    const lastRecord = records[records.length - 1];
    const currentStatus = lastRecord.status === 'IN' && !lastRecord.swipe_out_time ? 'IN' : 'OUT';

    // Format records (add duration and location)
    const formattedRecords = records.map(record => ({
      id: record.id,
      employee_id: record.emp_id,
      attendance_date: record.attendance_date,
      swipe_in_time: record.swipe_in_time,
      swipe_in_location: record.swipe_in_location || null,
      swipe_out_time: record.swipe_out_time,
      swipe_out_location: record.swipe_out_location || null,
      status: record.status,
      duration: record.swipe_in_time && record.swipe_out_time
        ? calculateDuration(record.swipe_in_time, record.swipe_out_time)
        : null
    }));

    res.status(200).json({
      success: true,
      date: date,
      employee_id: employeeId,
      status: currentStatus,
      records: formattedRecords,
      total_records: records.length,
      total_time: totalTime,
      summary: {
        first_swipe_in: records[0].swipe_in_time,
        first_swipe_in_location: records[0].swipe_in_location || null,
        last_swipe_out: lastRecord.swipe_out_time || null,
        last_swipe_out_location: lastRecord.swipe_out_location || null,
        total_hours_in_office: totalTime.formatted
      }
    });

  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

export default router;

