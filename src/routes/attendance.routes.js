import express from 'express';
import { promisePool } from '../config/db.js';

const router = express.Router();

const getTodayDate = () => new Date().toISOString().split('T')[0];

// POST /swipe-in
router.post('/swipe-in', async (req, res) => {
  try {
    const emp_id = req.user?.emp_id;
    if (!emp_id) {
      return res.status(401).json({
        success: false,
        message: 'Employee ID not found'
      });
    }

    const attendance_date = getTodayDate();
    const [existingRecords] = await promisePool.execute(
      'SELECT id FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [emp_id, attendance_date]
    );

    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped in'
      });
    }

    const [result] = await promisePool.execute(
      `INSERT INTO attendance (emp_id, attendance_date, swipe_in_time, status) 
       VALUES (?, ?, NOW(), 'IN')`,
      [emp_id, attendance_date]
    );

    const [newRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Swiped in successfully',
      data: newRecord[0]
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Already swiped in'
      });
    }
    console.error('Swipe in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /swipe-out
router.post('/swipe-out', async (req, res) => {
  try {
    const emp_id = req.user?.emp_id;
    if (!emp_id) {
      return res.status(401).json({
        success: false,
        message: 'Employee ID not found'
      });
    }

    const attendance_date = getTodayDate();
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

    const record = records[0];
    if (record.swipe_out_time) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped out'
      });
    }

    await promisePool.execute(
      `UPDATE attendance SET swipe_out_time = NOW(), status = 'OUT', updatedAt = NOW() WHERE id = ?`,
      [record.id]
    );

    const [updatedRecord] = await promisePool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [record.id]
    );

    res.status(200).json({
      success: true,
      message: 'Swiped out successfully',
      data: updatedRecord[0]
    });

  } catch (error) {
    console.error('Swipe out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /today-status
router.get('/today-status', async (req, res) => {
  try {
    const emp_id = req.user?.emp_id;
    if (!emp_id) {
      return res.status(401).json({
        success: false,
        message: 'Employee ID not found'
      });
    }

    const attendance_date = getTodayDate();
    const [records] = await promisePool.execute(
      'SELECT * FROM attendance WHERE emp_id = ? AND attendance_date = ?',
      [emp_id, attendance_date]
    );

    const attendanceData = records[0] || null;
    const canSwipeIn = !attendanceData;
    const canSwipeOut = attendanceData?.status === 'IN' && !attendanceData?.swipe_out_time;

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
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

