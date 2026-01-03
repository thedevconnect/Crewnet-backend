import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const dbConfig = {
  host: process.env.DB_HOST || '103.30.72.61',
  user: process.env.DB_USER || 'sam',
  password: process.env.DB_PASS || 'Ssam@123',
  database: process.env.DB_NAME || 'crewnet',
  port: parseInt(process.env.DB_PORT || '8011', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return null;
  return new Date(dateTime).toISOString();
};

router.get('/today/:employeeId', (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const todayDate = getTodayDate();

    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Employee ID is required'
      });
    }

    pool.getConnection((err, connection) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      const query = 'SELECT id, emp_id, attendance_date, swipe_in_time, swipe_out_time, status, created_at, updated_at FROM attendance WHERE emp_id = ? AND attendance_date = ?';
      
      connection.query(query, [employeeId, todayDate], (error, results) => {
        connection.release();

        if (error) {
          console.error('[ATTENDANCE API] Database query error:', error);
          return res.status(500).json({
            success: false,
            message: 'Database query error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }

        if (results.length === 0) {
          return res.status(200).json({
            success: true,
            status: 'NOT_SWIPED',
            message: 'No attendance record found for today'
          });
        }

        const record = results[0];
        res.status(200).json({
          success: true,
          status: record.status || 'IN',
          swipe_in_time: formatDateTime(record.swipe_in_time),
          swipe_out_time: formatDateTime(record.swipe_out_time),
          attendance_date: record.attendance_date,
          employee_id: record.emp_id,
          id: record.id
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/swipe-in', (req, res) => {
  try {
    const { employeeId } = req.body;
    const todayDate = getTodayDate();

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required in request body'
      });
    }

    pool.getConnection((err, connection) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      // First, check if record already exists for today
      const checkQuery = 'SELECT id, emp_id, attendance_date, swipe_in_time, swipe_out_time, status, created_at, updated_at FROM attendance WHERE emp_id = ? AND attendance_date = ?';
      
      connection.query(checkQuery, [employeeId, todayDate], (checkError, checkResults) => {
        if (checkError) {
          connection.release();
          return res.status(500).json({
            success: false,
            message: 'Database query error',
            error: process.env.NODE_ENV === 'development' ? checkError.message : undefined
          });
        }

        // If already swiped in, return existing record (first swipe in time is preserved)
        if (checkResults.length > 0) {
          connection.release();
          const existingRecord = checkResults[0];
          return res.status(200).json({
            success: true,
            message: 'Swipe in successful',
            data: {
              id: existingRecord.id,
              employee_id: existingRecord.emp_id,
              attendance_date: existingRecord.attendance_date,
              swipe_in_time: formatDateTime(existingRecord.swipe_in_time),
              swipe_out_time: formatDateTime(existingRecord.swipe_out_time),
              status: existingRecord.status,
              created_at: formatDateTime(existingRecord.created_at),
              updated_at: formatDateTime(existingRecord.updated_at)
            }
          });
        }

        // Insert new record if no record exists for today
        const insertQuery = 'INSERT INTO attendance (emp_id, attendance_date, swipe_in_time, status) VALUES (?, ?, NOW(), ?)';
        
        connection.query(insertQuery, [employeeId, todayDate, 'IN'], (insertError, insertResults) => {
          if (insertError) {
            connection.release();
            return res.status(500).json({
              success: false,
              message: 'Failed to record swipe in',
              error: process.env.NODE_ENV === 'development' ? insertError.message : undefined
            });
          }

          // Fetch the newly created record
          const selectQuery = 'SELECT id, emp_id, attendance_date, swipe_in_time, swipe_out_time, status, created_at, updated_at FROM attendance WHERE id = ?';
          
          connection.query(selectQuery, [insertResults.insertId], (selectError, selectResults) => {
            connection.release();
            
            if (selectError) {
              return res.status(500).json({
                success: false,
                message: 'Swipe in recorded but failed to fetch record',
                error: process.env.NODE_ENV === 'development' ? selectError.message : undefined
              });
            }

            const newRecord = selectResults[0];
            res.status(201).json({
              success: true,
              message: 'Swipe in successful',
              data: {
                id: newRecord.id,
                employee_id: newRecord.emp_id,
                attendance_date: newRecord.attendance_date,
                swipe_in_time: formatDateTime(newRecord.swipe_in_time),
                swipe_out_time: formatDateTime(newRecord.swipe_out_time),
                status: newRecord.status,
                created_at: formatDateTime(newRecord.created_at),
                updated_at: formatDateTime(newRecord.updated_at)
              }
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/swipe-out', (req, res) => {
  try {
    const { employeeId } = req.body;
    const todayDate = getTodayDate();

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required in request body'
      });
    }

    pool.getConnection((err, connection) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      // Check if employee has swiped in today
      const checkQuery = 'SELECT id, swipe_in_time, swipe_out_time, status FROM attendance WHERE emp_id = ? AND attendance_date = ?';
      
      connection.query(checkQuery, [employeeId, todayDate], (checkError, checkResults) => {
        if (checkError) {
          connection.release();
          return res.status(500).json({
            success: false,
            message: 'Database query error',
            error: process.env.NODE_ENV === 'development' ? checkError.message : undefined
          });
        }

        // If no record exists, return error
        if (checkResults.length === 0) {
          connection.release();
          return res.status(400).json({
            success: false,
            message: 'Cannot swipe out. Please swipe in first.'
          });
        }

        const record = checkResults[0];

        // If no swipe in time (shouldn't happen, but check anyway)
        if (!record.swipe_in_time) {
          connection.release();
          return res.status(400).json({
            success: false,
            message: 'Invalid attendance record. Swipe in time not found.'
          });
        }

        // Always update swipe out time to NOW() (this will be the LAST swipe out)
        // MySQL's NOW() will automatically be the latest time
        const updateQuery = 'UPDATE attendance SET swipe_out_time = NOW(), status = ?, updated_at = NOW() WHERE id = ?';
        
        connection.query(updateQuery, ['OUT', record.id], (updateError, updateResults) => {
        if (updateError) {
          connection.release();
          return res.status(500).json({
            success: false,
            message: 'Failed to record swipe out',
            error: process.env.NODE_ENV === 'development' ? updateError.message : undefined
          });
        }

        // Fetch the updated record
        const selectQuery = 'SELECT id, emp_id, attendance_date, swipe_in_time, swipe_out_time, status, created_at, updated_at FROM attendance WHERE id = ?';
        
        connection.query(selectQuery, [record.id], (selectError, selectResults) => {
          connection.release();

          if (selectError) {
            return res.status(500).json({
              success: false,
              message: 'Swipe out recorded but failed to fetch record',
              error: process.env.NODE_ENV === 'development' ? selectError.message : undefined
            });
          }

          const updatedRecord = selectResults[0];
          res.status(200).json({
            success: true,
            message: 'Swipe out successful',
            data: {
              id: updatedRecord.id,
              employee_id: updatedRecord.emp_id,
              attendance_date: updatedRecord.attendance_date,
              swipe_in_time: formatDateTime(updatedRecord.swipe_in_time),
              swipe_out_time: formatDateTime(updatedRecord.swipe_out_time),
              status: updatedRecord.status,
              created_at: formatDateTime(updatedRecord.created_at),
              updated_at: formatDateTime(updatedRecord.updated_at)
            }
          });
        });
      });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
