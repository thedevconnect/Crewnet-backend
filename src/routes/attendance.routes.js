import express from 'express';
import { promisePool } from '../config/db.js';

const router = express.Router();

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// ============================================
// POST /api/attendance/swipe-in
// ============================================
router.post('/swipe-in', async (req, res) => {
  try {
    // Get emp_id from JWT middleware (req.user.emp_id)
    const emp_id = req.user?.emp_id;

    if (!emp_id) {
      return res.status(401).json({
        success: false,
        message: 'Employee ID not found. Please ensure you are authenticated.'
      });
    }

    const attendance_date = getTodayDate();

    // Check if attendance record already exists for today
    const [existingRecords] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [emp_id, attendance_date]
    );

    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped in'
      });
    }

    // Insert new attendance record with swipe_in_time
    const [result] = await promisePool.execute(
      `INSERT INTO attendance (emp_id, attendance_date, swipe_in_time, status) 
       VALUES (?, ?, NOW(), 'IN')`,
      [emp_id, attendance_date]
    );

    // Fetch the created record
    const [newRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [result.insertId]
    );

    console.log(`✅ Swipe in successful for emp_id: ${emp_id} on ${attendance_date}`);

    res.status(201).json({
      success: true,
      message: 'Swiped in successfully',
      data: {
        id: newRecord[0].id,
        emp_id: newRecord[0].emp_id,
        attendance_date: newRecord[0].attendance_date,
        swipe_in_time: newRecord[0].swipe_in_time,
        status: newRecord[0].status
      }
    });

  } catch (error) {
    console.error('❌ Swipe in error:', error);
    
    // Handle duplicate entry error (UNIQUE constraint violation)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Already swiped in'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// POST /api/attendance/swipe-out
// ============================================
router.post('/swipe-out', async (req, res) => {
  try {
    // Get emp_id from JWT middleware (req.user.emp_id)
    const emp_id = req.user?.emp_id;

    if (!emp_id) {
      return res.status(401).json({
        success: false,
        message: 'Employee ID not found. Please ensure you are authenticated.'
      });
    }

    const attendance_date = getTodayDate();

    // Find today's attendance record
    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [emp_id, attendance_date]
    );

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Swipe in not found'
      });
    }

    const attendanceRecord = records[0];

    // Check if already swiped out
    if (attendanceRecord.swipe_out_time) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped out'
      });
    }

    // Update swipe_out_time and status
    await promisePool.execute(
      `UPDATE attendance 
       SET swipe_out_time = NOW(), status = 'OUT', updatedAt = NOW() 
       WHERE id = ?`,
      [attendanceRecord.id]
    );

    // Fetch updated record
    const [updatedRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [attendanceRecord.id]
    );

    console.log(`✅ Swipe out successful for emp_id: ${emp_id} on ${attendance_date}`);

    res.status(200).json({
      success: true,
      message: 'Swiped out successfully',
      data: {
        id: updatedRecord[0].id,
        emp_id: updatedRecord[0].emp_id,
        attendance_date: updatedRecord[0].attendance_date,
        swipe_in_time: updatedRecord[0].swipe_in_time,
        swipe_out_time: updatedRecord[0].swipe_out_time,
        status: updatedRecord[0].status
      }
    });

  } catch (error) {
    console.error('❌ Swipe out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/attendance/today-status
// ============================================
router.get('/today-status', async (req, res) => {
  try {
    // Get emp_id from JWT middleware (req.user.emp_id)
    const emp_id = req.user?.emp_id;

    if (!emp_id) {
      return res.status(401).json({
        success: false,
        message: 'Employee ID not found. Please ensure you are authenticated.'
      });
    }

    const attendance_date = getTodayDate();

    // Find today's attendance record
    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [emp_id, attendance_date]
    );

    let canSwipeIn = false;
    let canSwipeOut = false;
    let attendanceData = null;

    if (records.length === 0) {
      // No record exists - can swipe in
      canSwipeIn = true;
      canSwipeOut = false;
    } else {
      attendanceData = records[0];
      
      if (attendanceData.status === 'IN' && !attendanceData.swipe_out_time) {
        // Swiped in but not swiped out - can swipe out
        canSwipeIn = false;
        canSwipeOut = true;
      } else if (attendanceData.status === 'OUT' && attendanceData.swipe_out_time) {
        // Already swiped out - cannot do anything
        canSwipeIn = false;
        canSwipeOut = false;
      } else {
        // Edge case: status is IN but has swipe_out_time (shouldn't happen, but handle it)
        canSwipeIn = false;
        canSwipeOut = false;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Today\'s attendance status fetched successfully',
      data: {
        canSwipeIn,
        canSwipeOut,
        attendance: attendanceData ? {
          id: attendanceData.id,
          emp_id: attendanceData.emp_id,
          attendance_date: attendanceData.attendance_date,
          swipe_in_time: attendanceData.swipe_in_time,
          swipe_out_time: attendanceData.swipe_out_time,
          status: attendanceData.status
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Log route registration
console.log('✅ Attendance routes loaded: /swipe-in, /swipe-out, /today-status');

export default router;

